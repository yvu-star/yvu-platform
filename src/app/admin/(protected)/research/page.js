'use client'

import { useState, useEffect } from 'react'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useActivityLog } from '@/hooks/useActivityLog'
import { createClient } from '@/lib/supabase/client'
import {
  getResearch,
  createResearch,
  updateResearch,
  deleteResearch,
} from '@/lib/services/research.service'
import DeleteConfirm from '@/components/admin/DeleteConfirm'
import {
  FileText, Search, Plus, MoreVertical, ExternalLink, Upload,
  Pencil, Trash2, EyeOff, Loader2, AlertCircle,
  CheckCircle2, Circle, Clock, Tag, Users, GraduationCap
} from 'lucide-react'

// ── Slug generator ─────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Empty form ─────────────────────────────────────────────
const EMPTY_AUTHOR = { name: '', role: '', affiliation: '' }

const EMPTY_FORM = {
  title: '',
  slug: '',
  abstract: '',
  authors: [{ ...EMPTY_AUTHOR }],
  tags: [],
  status: 'Draft',
  is_published: false,
  category: '',
  published_at: '',
  pdf_url: '',
  external_url: '',
}

// ── Status config ──────────────────────────────────────────
const STATUS_CONFIG = {
  Draft: {
    bg: 'rgba(107,122,150,0.08)',
    color: 'var(--text-muted)',
    border: 'rgba(107,122,150,0.18)',
    Icon: Circle
  },
  'Under Review': {
    bg: 'rgba(200,167,94,0.10)',
    color: 'var(--gold-dark)',
    border: 'rgba(200,167,94,0.22)',
    Icon: Clock
  },
  Published: {
    bg: 'rgba(31,42,68,0.07)',
    color: 'var(--navy)',
    border: 'rgba(31,42,68,0.15)',
    Icon: CheckCircle2
  },
}

// ── Section box wrapper ────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="form-section">
      <div className="form-section__label">{title}</div>
      {children}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="field">
      <label className="field__label">
        {label}{required && <span className="field__required">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Toggle switch ──────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <div
        className={`toggle__track${checked ? ' toggle__track--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <div
          className="toggle__thumb"
          style={{ left: checked ? 21 : 3 }}
        />
      </div>
      <span className="toggle__label">{label}</span>
    </label>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function ResearchPage() {
  const { data, loading, error } = useRealtimeTable(
    getResearch,
    'research'
  )

  const { log } = useActivityLog()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [menuPos, setMenuPos] = useState({
    top: 0,
    right: 0
  })

  // PDF upload state
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Auto-slug from title
  useEffect(() => {
    if (!slugEdited && form.title) {
      setForm(prev => ({
        ...prev,
        slug: toSlug(prev.title)
      }))
    }
  }, [form.title, slugEdited])

  const filtered = (data || []).filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      authors: [{ ...EMPTY_AUTHOR }]
    })

    setEditItem(null)
    setFormError('')
    setUploadError('')
    setSlugEdited(false)
    setTagInput('')
    setShowModal(true)
  }

  function openEdit(row) {
    setForm({
      title: row.title ?? '',
      slug: row.slug ?? '',
      abstract: row.abstract ?? '',
      authors:
        Array.isArray(row.authors) && row.authors.length
          ? row.authors
          : [{ ...EMPTY_AUTHOR }],
      tags: Array.isArray(row.tags) ? row.tags : [],
      status: row.status ?? 'Draft',
      is_published: row.is_published ?? false,
      category: row.category ?? '',
      published_at: row.published_at
        ? new Date(row.published_at)
            .toISOString()
            .slice(0, 10)
        : '',
      pdf_url: row.pdf_url ?? row.file_url ?? '',
      external_url: row.external_url ?? '',
    })

    setEditItem(row)
    setFormError('')
    setUploadError('')
    setSlugEdited(true)
    setTagInput('')
    setShowModal(true)
  }

  function setField(name, value) {
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function handleInput(e) {
    const { name, value } = e.target

    if (name === 'slug') {
      setSlugEdited(true)
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // ── Authors helpers ──────────────────────────────────────
  function setAuthorField(i, key, val) {
    const arr = form.authors.map(
      (a, idx) =>
        idx === i
          ? { ...a, [key]: val }
          : a
    )

    setField('authors', arr)
  }

  function addAuthor() {
    setField('authors', [
      ...form.authors,
      { ...EMPTY_AUTHOR }
    ])
  }

  function removeAuthor(i) {
    if (form.authors.length === 1) return

    setField(
      'authors',
      form.authors.filter((_, idx) => idx !== i)
    )
  }

  // ── Tags helpers ─────────────────────────────────────────
  function addTag(tag) {
    const t = tag.trim()

    if (t && !form.tags.includes(t)) {
      setField('tags', [
        ...form.tags,
        t
      ])
    }

    setTagInput('')
  }

  function removeTag(tag) {
    setField(
      'tags',
      form.tags.filter(t => t !== tag)
    )
  }

  // ── Supabase PDF upload ──────────────────────────────────
  async function handlePdfUpload(e) {
    const file = e.target.files?.[0]

    // Allow selecting the same file again
    e.target.value = ''

    if (!file) return

    setUploadError('')

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError(
        'Please select a PDF file.'
      )
      return
    }

    // 25 MB maximum
    const MAX_SIZE = 25 * 1024 * 1024

    if (file.size > MAX_SIZE) {
      setUploadError(
        'PDF must be 25 MB or smaller.'
      )
      return
    }

    setUploadingPdf(true)

    try {
      const supabase = createClient()

      const safeTitle =
        toSlug(
          form.title ||
          file.name.replace(/\.pdf$/i, '')
        ) || 'research-paper'

      const filePath =
        `${safeTitle}-${Date.now()}.pdf`

      const {
        error: storageError
      } = await supabase.storage
        .from('research-papers')
        .upload(
          filePath,
          file,
          {
            cacheControl: '3600',
            contentType: 'application/pdf',
            upsert: false,
          }
        )

      if (storageError) {
        throw new Error(
          storageError.message
        )
      }

      const { data } =
        supabase.storage
          .from('research-papers')
          .getPublicUrl(filePath)

      if (!data?.publicUrl) {
        throw new Error(
          'Supabase did not return a public PDF URL.'
        )
      }

      // Store the generated public URL
      // in the research form.
      setField(
        'pdf_url',
        data.publicUrl
      )

    } catch (err) {
      console.error(
        '[Research PDF Upload]',
        err
      )

      setUploadError(
        err?.message ||
        'Failed to upload PDF.'
      )
    } finally {
      setUploadingPdf(false)
    }
  }

  // ── Save research ────────────────────────────────────────
  async function handleSubmit() {
    if (!form.title.trim()) {
      setFormError(
        'Title is required.'
      )
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const payload = {
        title: form.title.trim(),

        slug:
          form.slug.trim() ||
          toSlug(form.title),

        abstract: form.abstract,

        authors:
          form.authors.filter(
            a => a.name.trim()
          ),

        tags: form.tags,

        status: form.status,

        is_published:
          form.is_published,

        category:
          form.category,

        published_at:
          form.published_at || null,

        pdf_url:
          form.pdf_url.trim() ||
          null,

        // Legacy synchronization
        file_url:
          form.pdf_url.trim() ||
          null,

        external_url:
          form.external_url.trim() ||
          null,
      }

      if (editItem) {
        await updateResearch(
          editItem.id,
          payload
        )

        await log({
          action: 'update',
          entity: 'research',
          entityId: editItem.id,
          description:
            `Updated research: ${payload.title}`
        })
      } else {
        const result =
          await createResearch(
            payload
          )

        await log({
          action: 'create',
          entity: 'research',
          entityId: result?.id,
          description:
            `Created research: ${payload.title}`
        })
      }

      setShowModal(false)

    } catch (err) {
      setFormError(
        err?.message ??
        'Failed to save publication.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ── Delete research ──────────────────────────────────────
  async function handleDelete() {
    try {
      await deleteResearch(
        deleteItem.id
      )

      await log({
        action: 'delete',
        entity: 'research',
        entityId: deleteItem.id,
        description:
          `Deleted research: ${deleteItem.title}`
      })

      setDeleteItem(null)

    } catch (err) {
      console.error(err)
    }
  }

  if (error) {
    return (
      <div className="dash-error">
        Failed to load research.
      </div>
    )
  }

  return (
    <>
      <style>{`
        /* ── CSS Variables ── */
        .research-page {
          --navy: #1f2a44;
          --navy-dark: #131c30;
          --navy-mid: #26354f;
          --navy-light: #2e4266;
          --navy-deep: #0c1220;

          --beige: #e8dcc8;
          --beige-dark: #d5c9b0;
          --beige-light: #f4efe6;
          --beige-warm: #faf6ef;

          --gold: #c8a75e;
          --gold-light: #e2c07a;
          --gold-dark: #a07c3a;

          --text-muted: #6b7a96;

          --shadow-gold:
            0 8px 32px rgba(200,167,94,0.25);

          --radius-sm: 6px;
          --radius-md: 12px;
          --radius-lg: 20px;
          --radius-xl: 28px;

          --transition:
            all
            0.35s
            cubic-bezier(
              0.25,
              0.46,
              0.45,
              0.94
            );
        }

        /* ── Page Base ── */
        .research-page {
          animation:
            rsPageIn
            0.3s
            ease
            both;

          background-color:
            var(--beige-warm);

          min-height: 100vh;

          padding:
            32px
            40px;

          font-family:
            system-ui,
            -apple-system,
            sans-serif;

          position: relative;

          box-sizing: border-box;
        }

        @keyframes rsPageIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Page Header ── */
        .research-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .research-header__left {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .research-header__icon-box {
          width: 52px;
          height: 52px;

          background:
            var(--navy);

          color:
            var(--gold-light);

          border-radius:
            var(--radius-md);

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          box-shadow:
            0 4px 16px
            rgba(31,42,68,0.18);
        }

        .research-header__title-container {
          display: flex;
          flex-direction: column;
        }

        .research-header__eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold-dark);
          margin-bottom: 4px;
        }

        .research-header__title {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .research-header__subtitle {
          margin: 5px 0 0;
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .btn-add-research {
          display: flex;
          align-items: center;
          gap: 8px;

          height: 40px;

          padding:
            0 20px;

          background:
            var(--navy);

          color: #fff;

          border: none;

          border-radius:
            var(--radius-sm);

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          transition:
            var(--transition);

          white-space: nowrap;

          letter-spacing: 0.01em;

          flex-shrink: 0;
        }

        .btn-add-research:hover {
          background:
            var(--navy-dark);

          transform:
            translateY(-1px);

          box-shadow:
            0 4px 16px
            rgba(31,42,68,0.22);
        }

        /* ── Main Content Card ── */
        .research-content-card {
          background: #fff;

          border:
            1px solid
            rgba(31,42,68,0.08);

          border-radius:
            var(--radius-lg);

          box-shadow:
            0 4px 24px
            rgba(15,23,42,0.06);

          overflow: hidden;
        }

        .research-content-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding:
            18px
            28px;

          border-bottom:
            1px solid
            rgba(31,42,68,0.06);

          background: #fff;
        }

        .research-content-card__title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .research-content-card__count-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .research-content-card__count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-width: 22px;
          height: 22px;

          padding:
            0 7px;

          background:
            var(--beige-light);

          border:
            1px solid
            var(--beige-dark);

          border-radius: 20px;

          font-size: 11px;
          font-weight: 700;

          color:
            var(--navy);
        }

        .research-content-card__search {
          position: relative;
        }

        .research-content-card__search svg {
          position: absolute;

          left: 12px;
          top: 50%;

          transform:
            translateY(-50%);

          color:
            var(--text-muted);

          pointer-events: none;
        }

        .research-search-input {
          height: 36px;

          padding:
            0
            14px
            0
            36px;

          border:
            1px solid
            rgba(31,42,68,0.12);

          border-radius:
            var(--radius-sm);

          font-size: 13px;

          color:
            var(--navy);

          background:
            var(--beige-warm);

          outline: none;

          width: 240px;

          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .research-search-input:focus {
          border-color:
            var(--gold);

          box-shadow:
            0 0 0 3px
            rgba(200,167,94,0.15);

          background: #fff;
        }

        .research-search-input::placeholder {
          color:
            var(--text-muted);
        }

        /* ── Table ── */
        .research-table-wrapper {
          overflow-x: auto;
        }

        .research-table {
          width: 100%;

          border-collapse:
            collapse;

          text-align: left;

          table-layout:
            fixed;
        }

        .research-table th {
          background:
            var(--beige-warm);

          padding:
            13px
            28px;

          font-size: 10.5px;
          font-weight: 700;

          text-transform:
            uppercase;

          letter-spacing:
            0.08em;

          color:
            var(--text-muted);

          border-bottom:
            1px solid
            rgba(31,42,68,0.07);
        }

        .research-table td {
          padding:
            15px
            28px;

          border-bottom:
            1px solid
            rgba(31,42,68,0.04);

          vertical-align:
            middle;

          font-size: 13px;

          color:
            var(--navy-mid);

          text-overflow:
            ellipsis;

          overflow:
            hidden;

          white-space:
            nowrap;
        }

        .research-table tbody tr {
          transition:
            background 0.15s;
        }

        .research-table tbody tr:hover {
          background-color:
            var(--beige-warm);
        }

        .research-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* Column controls */
        .col-date {
          width: 13%;
          color: var(--text-muted);
          font-size: 12px;
        }

        .col-title {
          font-weight: 600;
          color: var(--navy);
          width: 34%;
        }

        .col-title__row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
        }

        .col-title__text {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .col-title__badges {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .col-authors {
          width: 22%;
          color: var(--text-muted);
          font-size: 12.5px;
        }

        .col-category {
          width: 15%;
        }

        .col-status {
          width: 14%;
        }

        .col-actions {
          width: 6%;
          text-align: right;
        }

        /* Badges & Pills */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;

          font-size: 9px;
          font-weight: 700;

          text-transform:
            uppercase;

          letter-spacing:
            0.06em;

          padding:
            2px 6px;

          border-radius: 4px;
        }

        .badge--draft {
          background:
            rgba(107,122,150,0.1);

          color:
            var(--text-muted);

          border:
            1px solid
            rgba(107,122,150,0.18);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          font-size: 11px;
          font-weight: 600;

          padding:
            3px 10px;

          border-radius: 20px;

          border:
            1px solid
            transparent;

          letter-spacing:
            0.01em;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;

          font-size: 11px;
          font-weight: 600;

          padding:
            3px 9px;

          border-radius: 20px;

          color:
            var(--navy-mid);

          background:
            rgba(31,42,68,0.06);

          border:
            1px solid
            rgba(31,42,68,0.10);

          letter-spacing:
            0.01em;
        }

        /* ── Action Menu Dropdown ── */
        .action-menu-wrap {
          position: relative;
          display: inline-block;
        }

        .action-menu-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          width: 28px;
          height: 28px;

          background: none;
          border: none;

          border-radius:
            var(--radius-sm);

          color:
            var(--text-muted);

          cursor: pointer;

          transition:
            background 0.15s,
            color 0.15s;
        }

        .action-menu-btn:hover {
          background:
            var(--beige-light);

          color:
            var(--navy);
        }

        .dropdown-menu {
          position: fixed;

          background: #fff;

          border:
            1px solid
            rgba(31,42,68,0.08);

          border-radius:
            var(--radius-md);

          box-shadow:
            0 8px 32px
            rgba(15,23,42,0.10);

          overflow: hidden;

          z-index: 9999;

          min-width: 130px;

          animation:
            dropIn
            0.15s
            ease
            both;
        }

        @keyframes dropIn {
          from {
            opacity: 0;
            transform:
              translateY(-4px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 9px;

          width: 100%;

          text-align: left;

          padding:
            9px 14px;

          background: none;
          border: none;

          cursor: pointer;

          font-size: 12.5px;
          font-weight: 500;

          color:
            var(--navy);

          transition:
            background 0.12s;
        }

        .dropdown-item:hover {
          background:
            var(--beige-warm);
        }

        .dropdown-item--danger {
          color:
            #c0392b;
        }

        .dropdown-item--danger:hover {
          background:
            #fff5f5;
        }

        .dropdown-divider {
          height: 1px;

          background:
            rgba(31,42,68,0.06);

          margin:
            3px 0;
        }

        /* ── Empty & Loading States ── */
        .research-empty {
          padding:
            64px 24px;

          text-align:
            center;

          color:
            var(--text-muted);

          font-size:
            13.5px;
        }

        .research-empty svg {
          display: block;

          margin:
            0 auto 16px;

          color:
            var(--beige-dark);
        }

        .research-empty p {
          margin: 0;
          line-height: 1.6;
        }

        .research-loading {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          padding:
            64px 24px;

          color:
            var(--text-muted);

          font-size:
            13.5px;
        }

        .research-loading svg {
          animation:
            spin
            1s
            linear
            infinite;

          color:
            var(--gold);
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* ── Modal Overlay ── */
        .modal-overlay {
          position: fixed;
          inset: 0;

          background:
            rgba(12,18,32,0.45);

          backdrop-filter:
            blur(3px);

          z-index: 100;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          padding: 24px;
        }

        .modal-panel {
          background: #fff;

          border:
            1px solid
            rgba(31,42,68,0.10);

          border-radius:
            var(--radius-lg);

          width: 100%;

          max-width:
            760px;

          max-height:
            calc(100vh - 48px);

          display: flex;

          flex-direction:
            column;

          box-shadow:
            0 24px 64px
            rgba(15,23,42,0.16),
            0 4px 16px
            rgba(15,23,42,0.08);

          animation:
            modalScaleIn
            0.22s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            )
            both;
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform:
              scale(0.96)
              translateY(8px);
          }

          to {
            opacity: 1;
            transform:
              scale(1)
              translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          padding:
            26px
            28px
            18px;

          border-bottom:
            1px solid
            rgba(31,42,68,0.07);

          background:
            var(--beige-warm);

          border-top-left-radius:
            var(--radius-lg);

          border-top-right-radius:
            var(--radius-lg);
        }

        .modal-header__title {
          margin: 0;

          font-size: 18px;
          font-weight: 700;

          color:
            var(--navy);

          letter-spacing:
            -0.01em;
        }

        .modal-header__sub {
          font-size: 12.5px;

          color:
            var(--text-muted);

          margin-top: 4px;

          line-height:
            1.5;
        }

        .modal-header__actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
          margin-left: 16px;
        }

        .modal-body {
          padding:
            24px 28px;

          overflow-y: auto;

          flex: 1;
        }

        .btn-modal-cancel {
          height: 38px;

          padding:
            0 16px;

          background: #fff;

          border:
            1px solid
            rgba(31,42,68,0.15);

          border-radius:
            var(--radius-sm);

          color:
            var(--navy);

          font-size: 13px;
          font-weight: 500;

          cursor: pointer;

          transition:
            background 0.15s,
            border-color 0.15s;
        }

        .btn-modal-cancel:hover {
          background:
            var(--beige-light);

          border-color:
            rgba(31,42,68,0.22);
        }

        .btn-modal-save {
          height: 38px;

          padding:
            0 20px;

          background:
            var(--navy);

          color: #fff;

          border: none;

          border-radius:
            var(--radius-sm);

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          display: flex;

          align-items: center;

          gap: 7px;

          transition:
            var(--transition);

          letter-spacing:
            0.01em;
        }

        .btn-modal-save:hover:not(:disabled) {
          background:
            var(--navy-dark);

          transform:
            translateY(-1px);
        }

        .btn-modal-save:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .form-error {
          display: flex;
          align-items: center;
          gap: 9px;

          background:
            #fff5f5;

          border:
            1px solid
            rgba(220,38,38,0.2);

          border-radius:
            var(--radius-sm);

          padding:
            10px 14px;

          color:
            #c0392b;

          font-size: 13px;

          margin-bottom:
            20px;
        }

        /* ── Form Sections ── */
        .form-section {
          border:
            1px solid
            rgba(31,42,68,0.07);

          border-radius:
            var(--radius-md);

          padding:
            18px 20px;

          margin-bottom:
            16px;

          background:
            var(--beige-warm);
        }

        .form-section__label {
          font-size: 10px;
          font-weight: 700;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;

          color:
            var(--gold-dark);

          margin-bottom:
            14px;
        }

        .field {
          margin-bottom:
            14px;
        }

        .field:last-child {
          margin-bottom:
            0;
        }

        .field__label {
          display: block;

          font-size: 12px;
          font-weight: 600;

          color:
            var(--navy);

          margin-bottom:
            5px;

          letter-spacing:
            0.02em;
        }

        .field__required {
          color:
            #c0392b;

          margin-left:
            2px;
        }

        .field__hint {
          font-size:
            11.5px;

          color:
            var(--text-muted);

          margin-top:
            4px;
        }

        .field__hint span {
          color:
            var(--gold-dark);

          font-weight:
            600;
        }

        /* ── Form Inputs ── */
        .ev-input,
        .ev-select,
        .ev-textarea {
          width: 100%;

          height: 42px;

          padding:
            0 12px;

          background: #fff;

          border:
            1px solid
            rgba(31,42,68,0.14);

          border-radius:
            var(--radius-sm);

          color:
            var(--navy);

          font-size:
            13px;

          outline: none;

          box-sizing:
            border-box;

          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .ev-textarea {
          height: auto;

          padding:
            10px 12px;

          resize:
            vertical;

          line-height:
            1.6;
        }

        .ev-input:focus,
        .ev-select:focus,
        .ev-textarea:focus {
          border-color:
            var(--gold);

          box-shadow:
            0 0 0 3px
            rgba(200,167,94,0.15);
        }

        .ev-input::placeholder,
        .ev-textarea::placeholder {
          color:
            var(--text-muted);
        }

        /* Tags */
        .form-tag {
          display: inline-flex;
          align-items: center;

          gap: 5px;

          padding:
            3px 10px;

          background:
            var(--beige-light);

          border:
            1px solid
            var(--beige-dark);

          border-radius:
            20px;

          font-size:
            11.5px;

          font-weight:
            500;

          color:
            var(--navy);
        }

        .form-tag__remove {
          background: none;
          border: none;

          color:
            var(--text-muted);

          cursor: pointer;

          font-size:
            13px;

          line-height:
            1;

          padding: 0;

          display: flex;
          align-items: center;
        }

        .form-tag__remove:hover {
          color:
            #c0392b;
        }

        .author-remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 28px;
          height: 28px;

          background: none;
          border: none;

          color:
            var(--text-muted);

          cursor: pointer;

          font-size:
            18px;

          border-radius:
            var(--radius-sm);

          transition:
            background 0.12s,
            color 0.12s;
        }

        .author-remove-btn:hover:not(:disabled) {
          color:
            #c0392b;

          background:
            #fff5f5;
        }

        .btn-add-dashed {
          display: flex;
          align-items: center;

          gap: 6px;

          background: none;

          border:
            1px dashed
            rgba(31,42,68,0.18);

          border-radius:
            var(--radius-sm);

          color:
            var(--text-muted);

          padding:
            7px 12px;

          cursor: pointer;

          font-size:
            12px;

          font-weight:
            500;

          transition:
            border-color 0.15s,
            color 0.15s,
            background 0.15s;
        }

        .btn-add-dashed:hover {
          border-color:
            var(--gold);

          color:
            var(--gold-dark);

          background:
            rgba(200,167,94,0.05);
        }

        /* Toggle */
        .toggle {
          display: flex;
          align-items: center;

          gap: 10px;

          cursor: pointer;
        }

        .toggle__track {
          width: 36px;
          height: 20px;

          border-radius:
            10px;

          position:
            relative;

          background:
            rgba(31,42,68,0.15);

          transition:
            background 0.2s;

          flex-shrink:
            0;
        }

        .toggle__track--on {
          background:
            var(--navy);
        }

        .toggle__thumb {
          position:
            absolute;

          top: 3px;

          width: 14px;
          height: 14px;

          border-radius:
            50%;

          background:
            #fff;

          transition:
            left
            0.18s
            cubic-bezier(
              0.25,
              0.46,
              0.45,
              0.94
            );

          box-shadow:
            0 1px 4px
            rgba(0,0,0,0.15);
        }

        .toggle__label {
          font-size:
            13px;

          color:
            var(--navy);

          font-weight:
            500;
        }

        /* Modal Footer */
        .modal-footer {
          display: flex;

          justify-content:
            flex-end;

          gap: 10px;

          padding:
            16px 28px 22px;

          border-top:
            1px solid
            rgba(31,42,68,0.07);

          background:
            var(--beige-warm);

          border-bottom-left-radius:
            var(--radius-lg);

          border-bottom-right-radius:
            var(--radius-lg);
        }

        /* ── PDF Upload ── */
        .pdf-upload-box {
          display: flex;
          align-items: center;

          flex-wrap: wrap;

          gap: 10px;

          min-height:
            48px;

          padding:
            10px;

          border:
            1px dashed
            rgba(200,167,94,0.55);

          border-radius:
            var(--radius-sm);

          background:
            var(--beige-light);
        }

        .pdf-upload-button {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          min-height:
            38px;

          padding:
            0 14px;

          border-radius:
            7px;

          background:
            var(--navy);

          color:
            #fff;

          font-size:
            12px;

          font-weight:
            700;

          cursor:
            pointer;

          transition:
            opacity .2s,
            transform .2s;
        }

        .pdf-upload-button:hover {
          opacity:
            .92;

          transform:
            translateY(-1px);
        }

        .pdf-upload-button--disabled {
          opacity:
            .6;

          cursor:
            wait;

          transform:
            none;
        }

        .pdf-upload-link {
          display: inline-flex;
          align-items: center;

          gap: 6px;

          min-height:
            38px;

          padding:
            0 12px;

          border:
            1px solid
            rgba(31,42,68,0.12);

          border-radius:
            7px;

          color:
            var(--navy);

          background:
            #fff;

          font-size:
            12px;

          font-weight:
            600;

          text-decoration:
            none;
        }

        .pdf-upload-link:hover {
          border-color:
            var(--gold);
        }

        .pdf-upload-hint {
          margin-top:
            7px;

          color:
            var(--text-muted);

          font-size:
            10.5px;
        }

        .pdf-upload-error {
          display: flex;
          align-items: center;

          gap: 5px;

          margin-top:
            7px;

          color:
            #b42318;

          font-size:
            11px;
        }

        @media (max-width: 768px) {
          .research-page {
            padding:
              20px 20px;
          }

          .research-header {
            flex-direction:
              column;

            align-items:
              flex-start;

            gap:
              16px;
          }

          .btn-add-research {
            align-self:
              flex-start;
          }

          .research-content-card__header {
            flex-direction:
              column;

            align-items:
              flex-start;

            gap:
              12px;
          }

          .research-search-input {
            width:
              100%;
          }

          .modal-panel {
            max-height:
              calc(100vh - 20px);
          }

          .research-header__title {
            font-size:
              24px;
          }
        }
      `}</style>

      <div className="research-page">

        {/* ── Page Header ── */}
        <div className="research-header">
          <div className="research-header__left">

            <div className="research-header__icon-box">
              <FileText
                size={22}
                strokeWidth={1.5}
              />
            </div>

            <div className="research-header__title-container">
              <div className="research-header__eyebrow">
                Publications
              </div>

              <h1 className="research-header__title">
                Research
              </h1>

              <p className="research-header__subtitle">
                Manage YVU research publications and academic papers.
              </p>
            </div>
          </div>

          <button
            className="btn-add-research"
            onClick={openCreate}
          >
            <Plus
              size={15}
              strokeWidth={2.5}
            />

            Add Research
          </button>
        </div>

        {/* ── Unified Table Card ── */}
        <div className="research-content-card">

          <div className="research-content-card__header">

            <div className="research-content-card__title-area">
              <span className="research-content-card__count-label">
                Records
              </span>

              <span className="research-content-card__count-badge">
                {loading
                  ? '—'
                  : filtered.length}
              </span>
            </div>

            <div className="research-content-card__search">
              <Search
                size={13}
                strokeWidth={2}
              />

              <input
                className="research-search-input"
                value={search}
                onChange={e =>
                  setSearch(e.target.value)
                }
                placeholder="Search publications…"
              />
            </div>
          </div>

          <div>
            {loading ? (
              <div className="research-loading">
                <Loader2
                  size={16}
                  strokeWidth={2}
                />

                Loading research records…
              </div>
            ) : filtered.length === 0 ? (
              <div className="research-empty">

                <FileText
                  size={32}
                  strokeWidth={1.5}
                />

                <p>
                  {search
                    ? 'No publications match your search.'
                    : 'No research entries yet. Add your first publication.'
                  }
                </p>
              </div>
            ) : (
              <div className="research-table-wrapper">

                <table className="research-table">

                  <thead>
                    <tr>
                      <th className="col-date">
                        Date
                      </th>

                      <th className="col-title">
                        Title
                      </th>

                      <th className="col-authors">
                        Authors
                      </th>

                      <th className="col-category">
                        Category
                      </th>

                      <th className="col-status">
                        Status
                      </th>

                      <th className="col-actions"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map(item => {

                      const statusConf =
                        STATUS_CONFIG[item.status] ||
                        STATUS_CONFIG.Draft

                      const StatusIcon =
                        statusConf.Icon

                      const rowDate =
                        item.published_at
                          ? new Date(
                              item.published_at
                            ).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }
                            )
                          : '—'

                      const authorList =
                        Array.isArray(item.authors)
                          ? item.authors
                              .map(a => a.name)
                              .filter(Boolean)
                              .join(', ')
                          : '—'

                      return (
                        <tr key={item.id}>

                          <td className="col-date">
                            {rowDate}
                          </td>

                          <td className="col-title">

                            <div className="col-title__row">

                              <span className="col-title__text">
                                {item.title}
                              </span>

                              <div className="col-title__badges">

                                {!item.is_published &&
                                  item.status !== 'Published' && (
                                    <span className="badge badge--draft">

                                      <EyeOff
                                        size={8}
                                        strokeWidth={2}
                                      />

                                      Draft
                                    </span>
                                  )}

                              </div>
                            </div>
                          </td>

                          <td
                            className="col-authors"
                            title={authorList}
                          >
                            {authorList || '—'}
                          </td>

                          <td className="col-category">
                            <span className="category-pill">
                              {item.category ||
                                'General'}
                            </span>
                          </td>

                          <td className="col-status">

                            <span
                              className="status-pill"
                              style={{
                                color:
                                  statusConf.color,

                                background:
                                  statusConf.bg,

                                borderColor:
                                  statusConf.border,
                              }}
                            >
                              <StatusIcon
                                size={9}
                                strokeWidth={2.5}
                              />

                              {item.status ||
                                'Draft'}
                            </span>
                          </td>

                          <td className="col-actions">

                            <div className="action-menu-wrap">

                              <button
                                className="action-menu-btn"
                                onClick={e => {

                                  if (
                                    activeMenuId ===
                                    item.id
                                  ) {
                                    setActiveMenuId(
                                      null
                                    )
                                  } else {

                                    const rect =
                                      e.currentTarget
                                        .getBoundingClientRect()

                                    setMenuPos({
                                      top:
                                        rect.bottom +
                                        5,

                                      right:
                                        window.innerWidth -
                                        rect.right
                                    })

                                    setActiveMenuId(
                                      item.id
                                    )
                                  }
                                }}
                                aria-label="Actions"
                              >
                                <MoreVertical
                                  size={14}
                                  strokeWidth={1.5}
                                />
                              </button>

                              {activeMenuId ===
                                item.id && (
                                <>

                                  <div
                                    onClick={() =>
                                      setActiveMenuId(
                                        null
                                      )
                                    }
                                    style={{
                                      position:
                                        'fixed',

                                      inset: 0,

                                      zIndex: 10
                                    }}
                                  />

                                  <div
                                    className="dropdown-menu"
                                    style={{
                                      top:
                                        menuPos.top,

                                      right:
                                        menuPos.right
                                    }}
                                  >

                                    <button
                                      className="dropdown-item"
                                      onClick={() => {

                                        if (
                                          item.slug
                                        ) {
                                          window.open(
                                            `/research/${item.slug}`,
                                            '_blank'
                                          )
                                        }

                                        setActiveMenuId(
                                          null
                                        )
                                      }}
                                    >
                                      <ExternalLink
                                        size={12}
                                        strokeWidth={2}
                                      />

                                      View
                                    </button>

                                    <button
                                      className="dropdown-item"
                                      onClick={() => {
                                        openEdit(item)
                                        setActiveMenuId(
                                          null
                                        )
                                      }}
                                    >
                                      <Pencil
                                        size={12}
                                        strokeWidth={2}
                                      />

                                      Edit
                                    </button>

                                    <div className="dropdown-divider" />

                                    <button
                                      className="dropdown-item dropdown-item--danger"
                                      onClick={() => {
                                        setDeleteItem(
                                          item
                                        )

                                        setActiveMenuId(
                                          null
                                        )
                                      }}
                                    >
                                      <Trash2
                                        size={12}
                                        strokeWidth={2}
                                      />

                                      Delete
                                    </button>

                                  </div>
                                </>
                              )}

                            </div>
                          </td>

                        </tr>
                      )
                    })}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Add / Edit Modal ── */}
        {showModal && (
          <div
            className="modal-overlay"
            onClick={e => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowModal(false)
              }
            }}
          >

            <div className="modal-panel">

              {/* Sticky Header */}
              <div className="modal-header">

                <div>

                  <h2 className="modal-header__title">
                    {editItem
                      ? 'Edit Research'
                      : 'Add Research'}
                  </h2>

                  <div className="modal-header__sub">
                    {editItem
                      ? `Editing: ${editItem.title}`
                      : 'Fill in the fields to include a new publication record.'
                    }
                  </div>

                </div>

                <div className="modal-header__actions">

                  <button
                    className="btn-modal-cancel"
                    onClick={() =>
                      setShowModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-modal-save"
                    onClick={handleSubmit}
                    disabled={saving}
                  >

                    {saving && (
                      <Loader2
                        size={13}
                        strokeWidth={2.5}
                        style={{
                          animation:
                            'spin 1s linear infinite'
                        }}
                      />
                    )}

                    {saving
                      ? 'Saving…'
                      : 'Save'}

                  </button>

                </div>
              </div>

              {/* Scrollable Content */}
              <div className="modal-body">

                {formError && (
                  <div className="form-error">

                    <AlertCircle
                      size={14}
                      strokeWidth={2}
                    />

                    {formError}
                  </div>
                )}

                {/* Basic Information */}
                <Section title="Basic Information">

                  <Field
                    label="Title"
                    required
                  >
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleInput}
                      placeholder="Research publication title"
                      className="ev-input"
                    />
                  </Field>

                  <Field label="URL Slug">

                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleInput}
                      placeholder="auto-generated-from-title"
                      className="ev-input"
                    />

                    {form.slug && (
                      <div className="field__hint">
                        Preview:{' '}
                        <span>
                          /research/{form.slug}
                        </span>
                      </div>
                    )}

                  </Field>

                  <Field label="Abstract">

                    <textarea
                      name="abstract"
                      value={form.abstract}
                      onChange={handleInput}
                      placeholder="Brief summary or context of the research report…"
                      className="ev-textarea"
                      rows={4}
                    />

                  </Field>

                </Section>

                {/* Authors */}
                <Section title="Authors">

                  {form.authors.map(
                    (author, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '2fr 1.5fr 2fr auto',
                          gap: '8px',
                          marginBottom: '8px',
                          alignItems:
                            'center'
                        }}
                      >

                        <input
                          value={
                            author.name
                          }
                          onChange={e =>
                            setAuthorField(
                              i,
                              'name',
                              e.target.value
                            )
                          }
                          placeholder="Full name"
                          className="ev-input"
                        />

                        <input
                          value={
                            author.role
                          }
                          onChange={e =>
                            setAuthorField(
                              i,
                              'role',
                              e.target.value
                            )
                          }
                          placeholder="Role (e.g. Lead)"
                          className="ev-input"
                        />

                        <input
                          value={
                            author.affiliation
                          }
                          onChange={e =>
                            setAuthorField(
                              i,
                              'affiliation',
                              e.target.value
                            )
                          }
                          placeholder="Affiliation"
                          className="ev-input"
                        />

                        <button
                          onClick={() =>
                            removeAuthor(i)
                          }
                          disabled={
                            form.authors
                              .length === 1
                          }
                          className="author-remove-btn"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                  <button
                    onClick={addAuthor}
                    className="btn-add-dashed"
                  >
                    <Plus
                      size={12}
                      strokeWidth={2.5}
                    />

                    Add Author
                  </button>

                </Section>

                {/* Tags */}
                <Section title="Tags / Keywords">

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom:
                        '12px'
                    }}
                  >

                    {form.tags.map(
                      (tag, i) => (
                        <span
                          key={i}
                          className="form-tag"
                        >

                          {tag}

                          <button
                            onClick={() =>
                              removeTag(tag)
                            }
                            className="form-tag__remove"
                          >
                            ×
                          </button>

                        </span>
                      )
                    )}

                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px'
                    }}
                  >

                    <input
                      value={tagInput}
                      onChange={e =>
                        setTagInput(
                          e.target.value
                        )
                      }
                      onKeyDown={e => {
                        if (
                          e.key ===
                            'Enter' ||
                          e.key === ','
                        ) {
                          e.preventDefault()
                          addTag(tagInput)
                        }
                      }}
                      placeholder="Type keyword and press Enter"
                      className="ev-input"
                      style={{
                        flex: 1
                      }}
                    />

                    <button
                      onClick={() =>
                        addTag(tagInput)
                      }
                      className="btn-add-research"
                      style={{
                        height: 42,
                        padding:
                          '0 16px',
                        fontSize: 12
                      }}
                    >
                      + Add
                    </button>

                  </div>

                </Section>

                {/* Publishing */}
                <Section title="Publishing">

                  <Field label="Status">

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInput}
                      className="ev-select"
                    >
                      {[
                        'Draft',
                        'Under Review',
                        'Published'
                      ].map(s => (
                        <option
                          key={s}
                          value={s}
                        >
                          {s}
                        </option>
                      ))}
                    </select>

                  </Field>

                  <div
                    style={{
                      marginTop:
                        '14px'
                    }}
                  >
                    <Toggle
                      checked={
                        form.is_published
                      }
                      onChange={v =>
                        setField(
                          'is_published',
                          v
                        )
                      }
                      label="Published (visible on public site)"
                    />
                  </div>

                </Section>

                {/* Details */}
                <Section title="Details">

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr 1fr',
                      gap: '14px'
                    }}
                  >

                    <Field label="Category">

                      <input
                        name="category"
                        value={
                          form.category
                        }
                        onChange={
                          handleInput
                        }
                        placeholder="e.g. Education, Policy, Health"
                        className="ev-input"
                      />

                    </Field>

                    <Field label="Publication Date">

                      <input
                        name="published_at"
                        type="date"
                        value={
                          form.published_at
                        }
                        onChange={
                          handleInput
                        }
                        className="ev-input"
                      />

                    </Field>

                  </div>

                </Section>

                {/* Links & Resources */}
                <Section title="Links &amp; Resources">

                  {/* PDF Upload */}
                  <Field label="Research Paper PDF">

                    <div className="pdf-upload-box">

                      <label
                        className={
                          `pdf-upload-button${
                            uploadingPdf
                              ? ' pdf-upload-button--disabled'
                              : ''
                          }`
                        }
                      >

                        <Upload
                          size={15}
                          strokeWidth={2}
                        />

                        {uploadingPdf
                          ? 'Uploading PDF…'
                          : (
                              form.pdf_url
                                ? 'Replace PDF'
                                : 'Upload PDF'
                            )
                        }

                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={
                            handlePdfUpload
                          }
                          disabled={
                            uploadingPdf
                          }
                          style={{
                            display:
                              'none'
                          }}
                        />

                      </label>

                      {form.pdf_url && (
                        <a
                          href={
                            form.pdf_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-upload-link"
                        >

                          <FileText
                            size={14}
                            strokeWidth={1.8}
                          />

                          View uploaded PDF

                          <ExternalLink
                            size={12}
                            strokeWidth={1.8}
                          />

                        </a>
                      )}

                    </div>

                    <div className="pdf-upload-hint">
                      PDF only · Maximum 25 MB · Stored securely in Supabase Storage
                    </div>

                    {uploadError && (
                      <div className="pdf-upload-error">

                        <AlertCircle
                          size={13}
                        />

                        {uploadError}

                      </div>
                    )}

                  </Field>

                  {/* Manual PDF URL */}
                  <Field label="PDF Link (Optional Manual URL)">

                    <input
                      name="pdf_url"
                      value={
                        form.pdf_url
                      }
                      onChange={
                        handleInput
                      }
                      placeholder="https://…"
                      className="ev-input"
                    />

                  </Field>

                  {/* External URL */}
                  <Field label="External URL Link">

                    <input
                      name="external_url"
                      value={
                        form.external_url
                      }
                      onChange={
                        handleInput
                      }
                      placeholder="https://…"
                      className="ev-input"
                    />

                  </Field>

                </Section>

              </div>

              {/* Footer */}
              <div className="modal-footer">

                <button
                  className="btn-modal-cancel"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="btn-modal-save"
                  onClick={handleSubmit}
                  disabled={saving}
                >

                  {saving && (
                    <Loader2
                      size={13}
                      strokeWidth={2.5}
                      style={{
                        animation:
                          'spin 1s linear infinite'
                      }}
                    />
                  )}

                  {saving
                    ? 'Saving…'
                    : 'Save'}

                </button>

              </div>

            </div>
          </div>
        )}

        {/* ── Delete Confirm ── */}
        {deleteItem && (
          <DeleteConfirm
            itemName={
              `"${deleteItem.title}"`
            }
            onConfirm={
              handleDelete
            }
            onCancel={() =>
              setDeleteItem(null)
            }
          />
        )}

      </div>
    </>
  )
}