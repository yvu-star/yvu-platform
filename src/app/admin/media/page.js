'use client'

import { useState, useRef, useCallback } from 'react'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { getAllMedia, createMedia, updateMedia, deleteMedia } from '@/lib/services/media.service'
import DeleteConfirm from '@/components/admin/DeleteConfirm'
import DataTable from '@/components/admin/DataTable'
import { useActivityLog } from '@/hooks/useActivityLog'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/services/upload.service'

// ─── helpers ────────────────────────────────────────────────────────────────

function getMimeCategory(mimeType) {
  if (!mimeType) return 'image'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (
    mimeType === 'application/pdf' ||
    mimeType.startsWith('application/msword') ||
    mimeType.startsWith('application/vnd') ||
    mimeType === 'text/plain'
  ) return 'document'
  return 'other'
}

function formatBytes(bytes) {
  if (!bytes || isNaN(Number(bytes))) return '—'
  var n = Number(bytes)
  if (n < 1024) return n + ' B'
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1048576).toFixed(1) + ' MB'
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStoragePath(url) {
  // Extract path after bucket name for deletion
  var marker = '/yvu-assets/'
  var idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

// ─── icon components ─────────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
}

function IconVideo() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

function IconUpload() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

// ─── MediaThumb ───────────────────────────────────────────────────────────────

function MediaThumb(props) {
  var item = props.item
  var size = props.size || 130

  if (item.file_type === 'image' && item.file_url) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={item.file_url}
        alt={item.title}
        style={{ width: '100%', height: size, objectFit: 'cover', display: 'block' }}
      />
    )
  }
  if (item.file_type === 'video') {
    return (
      <div style={{
        width: '100%', height: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--navy-deep)', color: 'var(--gold)',
        flexDirection: 'column', gap: 6,
      }}>
        <IconVideo />
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: '80%',
          textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'center' }}>
          {item.title}
        </span>
      </div>
    )
  }
  if (item.file_type === 'document') {
    return (
      <div style={{
        width: '100%', height: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--beige-light)', color: 'var(--navy)',
        flexDirection: 'column', gap: 6,
      }}>
        <IconDocument />
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: '80%',
          textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'center' }}>
          {item.title}
        </span>
      </div>
    )
  }
  return (
    <div style={{
      width: '100%', height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--beige)', color: 'var(--text-muted)', fontSize: 28,
    }}>
      🗂
    </div>
  )
}

// ─── UploadModal ─────────────────────────────────────────────────────────────

function UploadModal(props) {
  var onClose   = props.onClose
  var onUploaded = props.onUploaded

  var [files, setFiles]         = useState([])
  var [progMap, setProgMap]     = useState({})   // { filename: 0-100 | 'done' | 'error' }
  var [uploading, setUploading] = useState(false)
  var [dragOver, setDragOver]   = useState(false)
  var inputRef = useRef(null)

  function addFiles(fileList) {
    var arr = Array.from(fileList)
    setFiles(function(prev) {
      var names = new Set(prev.map(function(f) { return f.name }))
      var next = prev.slice()
      arr.forEach(function(f) {
        if (!names.has(f.name)) next.push(f)
      })
      return next
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  function handleInputChange(e) {
    if (e.target.files.length) addFiles(e.target.files)
  }

  function removeFile(name) {
    setFiles(function(prev) { return prev.filter(function(f) { return f.name !== name }) })
  }

  async function handleUpload() {
    if (!files.length || uploading) return
    setUploading(true)

    var uploaded = []

    for (var i = 0; i < files.length; i++) {
      var file = files[i]
      var key  = file.name

      // set progress to 10 to show activity
      setProgMap(function(prev) {
        var next = Object.assign({}, prev)
        next[key] = 10
        return next
      })

      try {
        var url = await uploadFile(file, 'yvu-assets/media')

        setProgMap(function(prev) {
          var next = Object.assign({}, prev)
          next[key] = 100
          return next
        })

        uploaded.push({
          name:  file.name,
          url:   url,
          mime:  file.type,
          size:  file.size,
        })
      } catch (err) {
        setProgMap(function(prev) {
          var next = Object.assign({}, prev)
          next[key] = 'error'
          return next
        })
      }
    }

    if (uploaded.length) onUploaded(uploaded)
    setUploading(false)
  }

  var allDone = files.length > 0 && files.every(function(f) {
    return progMap[f.name] === 100
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(12,18,32,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: 560,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--beige-dark)',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>Upload Files</div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1,
              padding: '2px 6px', borderRadius: 6,
            }}
          >×</button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* drop zone */}
          <div
            onDragOver={function(e) { e.preventDefault(); setDragOver(true) }}
            onDragLeave={function() { setDragOver(false) }}
            onDrop={handleDrop}
            onClick={function() { if (inputRef.current) inputRef.current.click() }}
            style={{
              border: '2px dashed ' + (dragOver ? 'var(--gold)' : 'var(--beige-dark)'),
              borderRadius: 'var(--radius-md)',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'var(--beige-warm)' : 'var(--beige-light)',
              transition: 'var(--transition)',
              marginBottom: 18,
            }}
          >
            <div style={{ color: dragOver ? 'var(--gold)' : 'var(--text-muted)', marginBottom: 10 }}>
              <IconUpload />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>
              Drag &amp; drop files here
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              or click to browse — images, videos, PDFs
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* file list */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18, maxHeight: 220, overflowY: 'auto' }}>
              {files.map(function(file) {
                var prog  = progMap[file.name]
                var isDone  = prog === 100
                var isError = prog === 'error'
                var pct     = typeof prog === 'number' ? prog : 0

                return (
                  <div key={file.name} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    background: 'var(--beige-light)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid ' + (isError ? '#fca5a5' : 'var(--beige-dark)'),
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatBytes(file.size)}
                      </div>
                      {typeof prog === 'number' && prog > 0 && (
                        <div style={{
                          marginTop: 4, height: 4, borderRadius: 2,
                          background: 'var(--beige-dark)', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: pct + '%',
                            background: isDone ? '#22c55e' : 'var(--gold)',
                            borderRadius: 2,
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                      )}
                      {isError && (
                        <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 2 }}>Upload failed</div>
                      )}
                    </div>
                    {!uploading && !isDone && (
                      <button
                        onClick={function() { removeFile(file.name) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem', padding: 0 }}
                      >×</button>
                    )}
                    {isDone && (
                      <span style={{ color: '#22c55e', fontSize: '1rem' }}>✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 20px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--beige-dark)', background: '#fff',
                fontSize: '0.88rem', cursor: 'pointer', color: 'var(--navy)',
              }}
            >
              {allDone ? 'Close' : 'Cancel'}
            </button>
            {!allDone && (
              <button
                onClick={handleUpload}
                disabled={!files.length || uploading}
                style={{
                  padding: '9px 22px', borderRadius: 'var(--radius-sm)',
                  background: files.length && !uploading ? 'var(--gold)' : 'var(--beige-dark)',
                  color: files.length && !uploading ? '#fff' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, fontSize: '0.88rem',
                  cursor: files.length && !uploading ? 'pointer' : 'not-allowed',
                  transition: 'var(--transition)',
                }}
              >
                {uploading ? 'Uploading…' : 'Upload ' + (files.length ? files.length + ' file' + (files.length !== 1 ? 's' : '') : '')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DetailModal ─────────────────────────────────────────────────────────────

function DetailModal(props) {
  var item     = props.item
  var onClose  = props.onClose
  var onSave   = props.onSave
  var onDelete = props.onDelete

  var [title, setTitle]     = useState(item.title || '')
  var [copied, setCopied]   = useState(false)
  var [saving, setSaving]   = useState(false)

  function copyUrl() {
    if (!item.file_url) return
    navigator.clipboard.writeText(item.file_url).then(function() {
      setCopied(true)
      setTimeout(function() { setCopied(false) }, 1800)
    })
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onSave(item.id, title.trim())
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(12,18,32,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: 640,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px 14px',
          borderBottom: '1px solid var(--beige-dark)',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>File Details</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: 'var(--text-muted)', padding: '2px 6px' }}
          >×</button>
        </div>

        <div style={{ padding: '22px 24px 24px' }}>
          {/* preview */}
          <div style={{
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
            marginBottom: 20, background: 'var(--navy-deep)',
            maxHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {item.file_type === 'image' && item.file_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.file_url} alt={item.title} style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }} />
            ) : item.file_type === 'video' && item.file_url ? (
              <video controls style={{ maxWidth: '100%', maxHeight: 320 }}>
                <source src={item.file_url} />
              </video>
            ) : (
              <div style={{ padding: '48px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                {item.file_type === 'document' ? <IconDocument /> : <span style={{ fontSize: 40 }}>🗂</span>}
                <div style={{ marginTop: 8, fontSize: '0.82rem' }}>No preview available</div>
              </div>
            )}
          </div>

          {/* editable title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Title
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={title}
                onChange={function(e) { setTitle(e.target.value) }}
                style={{
                  flex: 1, padding: '8px 12px', border: '1px solid var(--beige-dark)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--navy)',
                }}
              />
              <button
                onClick={handleSave}
                disabled={saving || title === item.title}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--gold)', color: '#fff',
                  border: 'none', fontWeight: 600, fontSize: '0.85rem',
                  cursor: saving || title === item.title ? 'not-allowed' : 'pointer',
                  opacity: saving || title === item.title ? 0.5 : 1,
                }}
              >
                {saving ? '…' : 'Save'}
              </button>
            </div>
          </div>

          {/* meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Type</div>
              <div style={{ fontSize: '0.88rem', textTransform: 'capitalize', color: 'var(--navy)' }}>{item.file_type || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Size</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--navy)' }}>{formatBytes(item.file_size)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Uploaded</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--navy)' }}>{formatDate(item.created_at)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Folder</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--navy)', textTransform: 'capitalize' }}>{item.folder || 'general'}</div>
            </div>
          </div>

          {/* URL copy */}
          {item.file_url && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>URL</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{
                  flex: 1, fontSize: '0.78rem', color: 'var(--text-muted)',
                  padding: '7px 10px', background: 'var(--beige-light)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--beige-dark)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {item.file_url}
                </div>
                <button
                  onClick={copyUrl}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                    background: copied ? '#dcfce7' : 'var(--navy)',
                    color: copied ? '#16a34a' : '#fff',
                    border: 'none', fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'var(--transition)', whiteSpace: 'nowrap',
                  }}
                >
                  <IconCopy /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* footer actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--beige-dark)' }}>
            <button
              onClick={function() { onDelete(item) }}
              style={{
                padding: '8px 16px', border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-sm)', background: '#fff',
                color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Delete
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px', border: '1px solid var(--beige-dark)',
                borderRadius: 'var(--radius-sm)', background: '#fff',
                color: 'var(--navy)', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

var TYPE_FILTERS = [
  { key: 'all',      label: 'All'       },
  { key: 'image',    label: 'Images'    },
  { key: 'document', label: 'Documents' },
  { key: 'video',    label: 'Videos'    },
]

export default function MediaPage() {
  var { data, loading, error } = useRealtimeTable(getAllMedia, 'media')
  var { log } = useActivityLog()

  var [view, setView]             = useState('grid')    // 'grid' | 'list'
  var [search, setSearch]         = useState('')
  var [typeFilter, setTypeFilter] = useState('all')
  var [showUpload, setShowUpload] = useState(false)
  var [detailItem, setDetailItem] = useState(null)
  var [deleteItem, setDeleteItem] = useState(null)

  // filter results
  var results = (data || []).filter(function(item) {
    var matchSearch = !search || (item.title || '').toLowerCase().includes(search.toLowerCase())
    var matchType   = typeFilter === 'all' || item.file_type === typeFilter
    return matchSearch && matchType
  })

  // after upload: insert rows into media table
  async function handleUploaded(uploads) {
    for (var i = 0; i < uploads.length; i++) {
      var u = uploads[i]
      var category = getMimeCategory(u.mime)

      // Only send columns that are guaranteed to exist on the media table.
      // file_size and folder are optional extensions — add them only if the
      // SQL migration has already been run; if Supabase rejects them the
      // catch block will log a readable message.
      var payload = {
        title: u.name,
        file_url:  u.url,
        file_type: category,
      }

      // Attempt to include extended columns — silently skipped if missing.
      try {
        var extPayload = Object.assign({}, payload, {
          file_size: String(u.size),
          folder:    'media',
        })
        var result = await createMedia(extPayload)
        await log({
          action:      'create',
          entity:      'media',
          entityId:    result && result.id ? result.id : null,
          description: 'Uploaded media: ' + u.name,
        })
      } catch (extErr) {
        // Extended columns may not exist yet — fall back to base columns only
        var errMsg = extErr && (extErr.message || extErr.msg || JSON.stringify(extErr))
        var isColumnErr = errMsg && (
          errMsg.includes('file_size') ||
          errMsg.includes('folder') ||
          errMsg.includes('column') ||
          errMsg.includes('schema')
        )

        if (isColumnErr) {
          try {
            var result2 = await createMedia(payload)
            await log({
              action:      'create',
              entity:      'media',
              entityId:    result2 && result2.id ? result2.id : null,
              description: 'Uploaded media: ' + u.name,
            })
          } catch (baseErr) {
            var baseMsg = baseErr && (baseErr.message || baseErr.msg || baseErr.details || JSON.stringify(baseErr))
            console.error('Failed to save media row (base):', baseMsg, baseErr)
          }
        } else {
          console.error('Failed to save media row:', errMsg, extErr)
        }
      }
    }
    setShowUpload(false)
  }

  async function handleSaveTitle(id, title) {
    await updateMedia(id, { title: title })
    await log({
      action:      'update',
      entity:      'media',
      entityId:    id,
      description: 'Renamed media to: ' + title,
    })
    // update detailItem locally
    setDetailItem(function(prev) {
      if (!prev || prev.id !== id) return prev
      var next = {}
      var keys = Object.keys(prev)
      for (var i = 0; i < keys.length; i++) next[keys[i]] = prev[keys[i]]
      next.title = title
      return next
    })
  }

  async function handleDelete() {
    if (!deleteItem) return
    try {
      var supabase = createClient()
      var storagePath = getStoragePath(deleteItem.file_url || '')
      if (storagePath) {
        await supabase.storage.from('yvu-assets').remove([storagePath])
      }
      await deleteMedia(deleteItem.id)
      await log({
        action:      'delete',
        entity:      'media',
        entityId:    deleteItem.id,
        description: 'Deleted media: ' + deleteItem.title,
      })
    } catch (err) {
      var msg = err && (err.message || err.msg || err.details || JSON.stringify(err))
      console.error('Failed to delete media:', msg, err)
    }
    setDeleteItem(null)
    if (detailItem && detailItem.id === deleteItem.id) setDetailItem(null)
  }

  // list view columns
  var listColumns = [
    {
      key: 'thumb',
      label: '',
      render: function(row) {
        return (
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--beige)' }}>
            <MediaThumb item={row} size={48} />
          </div>
        )
      },
    },
    {
      key: 'title',
      label: 'Title',
      render: function(row) {
        return (
          <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.88rem' }}>
            {row && row.title ? row.title : '—'}
          </span>
        )
      },
    },
    {
      key: 'type',
      label: 'Type',
      render: function(row) {
        return <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row && row.file_type ? row.file_type : '—'}</span>
      },
    },
    {
      key: 'file_size',
      label: 'Size',
      render: function(row) {
        return <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatBytes(row && row.file_size ? row.file_size : null)}</span>
      },
    },
    {
      key: 'created_at',
      label: 'Uploaded',
      render: function(row) {
        return <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(row && row.created_at ? row.created_at : null)}</span>
      },
    },
    {
      key: 'copy',
      label: '',
      render: function(row) {
        return (
          <button
            onClick={function(e) {
              e.stopPropagation()
              if (row && row.file_url) navigator.clipboard.writeText(row.file_url)
            }}
            title="Copy URL"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', border: '1px solid var(--beige-dark)',
              borderRadius: 'var(--radius-sm)', background: '#fff',
              cursor: 'pointer', fontSize: '0.75rem', color: 'var(--navy)', fontWeight: 600,
            }}
          >
            <IconCopy /> Copy URL
          </button>
        )
      },
    },
  ]

  if (error) {
    return <div className="admin-page"><div className="alert alert-error">Failed to load media: {error.message}</div></div>
  }

  return (
    <div className="admin-page">
      {/* ── header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Media Library</h1>
          <p className="admin-page-subtitle">
            {data ? data.length : 0} asset{data && data.length !== 1 ? 's' : ''} stored
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* view toggle */}
          <div style={{
            display: 'flex', border: '1px solid var(--beige-dark)',
            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
          }}>
            <button
              onClick={function() { setView('grid') }}
              title="Grid view"
              style={{
                padding: '7px 11px', background: view === 'grid' ? 'var(--navy)' : '#fff',
                color: view === 'grid' ? '#fff' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', alignItems: 'center',
              }}
            >
              <IconGrid />
            </button>
            <button
              onClick={function() { setView('list') }}
              title="List view"
              style={{
                padding: '7px 11px', background: view === 'list' ? 'var(--navy)' : '#fff',
                color: view === 'list' ? '#fff' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', alignItems: 'center',
                borderLeft: '1px solid var(--beige-dark)',
              }}
            >
              <IconList />
            </button>
          </div>
          <button
            className="btn-primary"
            onClick={function() { setShowUpload(true) }}
          >
            ↑ Upload Files
          </button>
        </div>
      </div>

      {/* ── search + type tabs ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={function(e) { setSearch(e.target.value) }}
          placeholder="Search by title…"
          style={{
            padding: '9px 14px', border: '1px solid var(--beige-dark)',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem',
            color: 'var(--navy)', minWidth: 220, flex: '0 0 auto',
          }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {TYPE_FILTERS.map(function(f) {
            return (
              <button
                key={f.key}
                onClick={function() { setTypeFilter(f.key) }}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (typeFilter === f.key ? 'var(--gold)' : 'var(--beige-dark)'),
                  background: typeFilter === f.key ? 'rgba(200,167,94,0.12)' : '#fff',
                  color: typeFilter === f.key ? 'var(--gold-dark)' : 'var(--text-muted)',
                  fontWeight: typeFilter === f.key ? 700 : 400,
                  fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {results.length} of {data ? data.length : 0}
        </span>
      </div>

      {/* ── grid view ── */}
      {view === 'grid' && (
        <div>
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {[1,2,3,4,5,6,7,8].map(function(n) {
                return (
                  <div key={n} style={{
                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    background: 'var(--beige-light)', border: '1px solid var(--beige-dark)',
                  }}>
                    <div style={{ height: 130, background: 'var(--beige)', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ height: 10, borderRadius: 4, background: 'var(--beige)', width: '70%', marginBottom: 6 }} />
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--beige)', width: '40%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {!loading && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🖼</div>
              <div style={{ fontWeight: 600 }}>No media found</div>
              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Upload your first file to get started.</div>
            </div>
          )}
          {!loading && results.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}>
              {results.map(function(item) {
                return (
                  <div
                    key={item.id}
                    onClick={function() { setDetailItem(item) }}
                    style={{
                      borderRadius: 'var(--radius-md)', overflow: 'hidden',
                      background: '#fff', border: '1px solid var(--beige-dark)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      cursor: 'pointer', transition: 'var(--transition)',
                      position: 'relative',
                    }}
                    onMouseEnter={function(e) {
                      e.currentTarget.querySelector('.media-overlay').style.opacity = '1'
                    }}
                    onMouseLeave={function(e) {
                      e.currentTarget.querySelector('.media-overlay').style.opacity = '0'
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <MediaThumb item={item} size={130} />
                      {/* hover overlay */}
                      <div
                        className="media-overlay"
                        style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(12,18,32,0.55)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: 6, opacity: 0, transition: 'opacity 0.2s ease',
                        }}
                      >
                        <span style={{
                          fontSize: '0.72rem', color: '#fff', fontWeight: 600,
                          padding: '0 10px', textAlign: 'center',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {item.title}
                        </span>
                        <button
                          onClick={function(e) { e.stopPropagation(); setDeleteItem(item) }}
                          style={{
                            background: '#ef4444', color: '#fff', border: 'none',
                            borderRadius: '50%', width: 26, height: 26,
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >×</button>
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{
                        fontWeight: 600, fontSize: '0.78rem', color: 'var(--navy)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        marginBottom: 2,
                      }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {item.file_type || 'other'}{item.file_size ? ' · ' + formatBytes(item.file_size) : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── list view ── */}
      {view === 'list' && (
        <DataTable
          columns={listColumns}
          data={results}
          loading={loading}
          onEdit={function(row) { setDetailItem(row) }}
          onDelete={function(row) { setDeleteItem(row) }}
          emptyMessage="No media found."
        />
      )}

      {/* ── upload modal ── */}
      {showUpload && (
        <UploadModal
          onClose={function() { setShowUpload(false) }}
          onUploaded={handleUploaded}
        />
      )}

      {/* ── detail modal ── */}
      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={function() { setDetailItem(null) }}
          onSave={handleSaveTitle}
          onDelete={function(item) { setDetailItem(null); setDeleteItem(item) }}
        />
      )}

      {/* ── delete confirm ── */}
      {deleteItem && (
        <DeleteConfirm
          itemName={deleteItem.title}
          onConfirm={handleDelete}
          onCancel={function() { setDeleteItem(null) }}
        />
      )}
    </div>
  )
}