'use client';

import { useState, useRef } from 'react';
import { uploadFile } from '@/lib/services/upload.service';

/**
 * FileUpload — drag & drop or click to upload
 * Props:
 *   folder:     string   — storage subfolder ('team', 'events', 'media', 'research')
 *   onUpload:   fn       — single mode: (url: string) => void
 *                          multiple mode: (urls: string[]) => void
 *   currentUrl: string   — existing file URL (single mode only)
 *   accept:     string   — MIME types e.g. 'image/*' or 'image/*,application/pdf'
 *   label:      string   — optional label override
 *   multiple:   boolean  — allow selecting + uploading multiple files at once
 */
export default function FileUpload({
  folder = 'general',
  onUpload,
  currentUrl = '',
  accept = 'image/*',
  label = 'Upload File',
  multiple = false,
}) {
  const [dragging, setDragging] = useState(false);
  // uploadingFiles: array of { name, progress: 'uploading'|'done'|'error', url?, error? }
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentUrl);
  const inputRef = useRef();

  // ── Single file ──────────────────────────────────────────
  async function handleSingleFile(file) {
    if (!file) return;
    setError('');
    setUploadingFiles([{ name: file.name, progress: 'uploading' }]);
    try {
      const url = await uploadFile(file, folder);
      setPreview(url);
      setUploadingFiles([{ name: file.name, progress: 'done', url }]);
      onUpload(url);
    } catch (e) {
      setUploadingFiles([{ name: file.name, progress: 'error', error: e.message }]);
      setError('Upload failed: ' + e.message);
    }
  }

  // ── Multiple files ───────────────────────────────────────
  async function handleMultipleFiles(files) {
    if (!files || files.length === 0) return;
    setError('');
    const fileList = Array.from(files);

    // Initialise all as uploading
    setUploadingFiles(fileList.map((f) => ({ name: f.name, progress: 'uploading' })));

    // Upload all in parallel
    const results = await Promise.allSettled(
      fileList.map((f) => uploadFile(f, folder))
    );

    const updated = fileList.map((f, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        return { name: f.name, progress: 'done', url: result.value };
      } else {
        return { name: f.name, progress: 'error', error: result.reason?.message };
      }
    });

    setUploadingFiles(updated);

    const successUrls = updated
      .filter((r) => r.progress === 'done')
      .map((r) => r.url);

    const failCount = updated.filter((r) => r.progress === 'error').length;
    if (failCount > 0) {
      setError(`${failCount} file(s) failed to upload.`);
    }

    if (successUrls.length > 0) {
      onUpload(successUrls);
    }
  }

  function handleFiles(files) {
    if (multiple) {
      handleMultipleFiles(files);
    } else {
      handleSingleFile(files[0]);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const isUploading = uploadingFiles.some((f) => f.progress === 'uploading');
  const isImage = accept.includes('image');
  const allDone = uploadingFiles.length > 0 && uploadingFiles.every((f) => f.progress === 'done');

  return (
    <div className="file-upload-wrapper">
      {label && <label className="form-label">{label}</label>}

      <div
        className={`file-drop-zone ${dragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onClick={() => !isUploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {/* Single mode — uploading spinner */}
        {!multiple && isUploading && (
          <div className="file-upload-state">
            <div className="spinner" />
            <span>Uploading…</span>
          </div>
        )}

        {/* Single mode — image preview */}
        {!multiple && !isUploading && preview && isImage && (
          <div className="file-preview-image">
            <img src={preview} alt="Preview" />
            <div className="file-preview-overlay"><span>Click to replace</span></div>
          </div>
        )}

        {/* Single mode — non-image file uploaded */}
        {!multiple && !isUploading && preview && !isImage && (
          <div className="file-upload-state">
            <span className="file-upload-icon">📄</span>
            <span className="file-upload-hint">File uploaded. Click to replace.</span>
          </div>
        )}

        {/* Single mode — empty state */}
        {!multiple && !isUploading && !preview && (
          <div className="file-upload-state">
            <span className="file-upload-icon">☁️</span>
            <span className="file-upload-hint">
              Drag & drop or <strong>click to browse</strong>
            </span>
            <span className="file-upload-size">Max 10MB</span>
          </div>
        )}

        {/* Multiple mode — uploading progress list */}
        {multiple && isUploading && (
          <div className="file-upload-state" style={{ width: '100%', padding: '1rem 1.5rem' }}>
            <div className="spinner" style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Uploading {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''}…
            </span>
            <div className="file-upload-list">
              {uploadingFiles.map((f, i) => (
                <div key={i} className={`file-upload-item file-upload-item--${f.progress}`}>
                  <span className="file-upload-item-name">{f.name}</span>
                  <span className="file-upload-item-status">
                    {f.progress === 'uploading' ? '⏳' : f.progress === 'done' ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multiple mode — results after upload */}
        {multiple && !isUploading && allDone && (
          <div className="file-upload-state" style={{ width: '100%', padding: '1rem 1.5rem' }}>
            <span className="file-upload-icon">✅</span>
            <span className="file-upload-hint">
              {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''} uploaded.{' '}
              <strong>Click to add more.</strong>
            </span>
            <div className="file-upload-list">
              {uploadingFiles.map((f, i) => (
                <div key={i} className={`file-upload-item file-upload-item--${f.progress}`}>
                  <span className="file-upload-item-name">{f.name}</span>
                  <span className="file-upload-item-status">
                    {f.progress === 'done' ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multiple mode — empty state */}
        {multiple && !isUploading && !allDone && (
          <div className="file-upload-state">
            <span className="file-upload-icon">☁️</span>
            <span className="file-upload-hint">
              Drag & drop or <strong>click to browse</strong>
            </span>
            <span className="file-upload-size">Select multiple files · Max 10MB each</span>
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* Single mode — URL paste fallback */}
      {!multiple && (
        <div className="file-upload-url">
          <input
            className="form-input"
            value={preview}
            onChange={(e) => { setPreview(e.target.value); onUpload(e.target.value); }}
            placeholder="Or paste a URL directly"
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}