'use client'

import { useState, useEffect } from 'react'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useActivityLog } from '@/hooks/useActivityLog'
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/services/events.service'
import DeleteConfirm from '@/components/admin/DeleteConfirm'
import {
  CalendarDays, MapPin, Users, Trophy, Search, Plus,
  MoreVertical, ExternalLink, Pencil, Trash2, Star,
  EyeOff, ChevronRight, Loader2, AlertCircle, Tag,
  Link2, FileText, Globe, CheckCircle2, Clock, Circle
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
const EMPTY_FORM = {
  title: '',
  slug: '',
  event_type: 'Competition',
  event_type_other: '',
  status: 'Upcoming',
  short_description: '',
  full_description: '',
  highlights: [''],
  is_published: false,
  is_featured: false,
  format: '',
  event_date: '',
  display_date: '',
  location_name: '',
  location_city: '',
  location_country: 'Bangladesh',
  registration_url_bd: '',
  registration_url_intl: '',
  results_pdf_url: '',
}

// ── Main Dashboard View Component ───────────────────────────
export default function EventsPage() {
  const { data: events, loading, error } = useRealtimeTable(getEvents, 'events')
  const { log } = useActivityLog()

  // State controls
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editEvt, setEditEvt] = useState(null)
  const [deleteEvt, setDeleteEvt] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  // Form payload configuration parameters
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Automatic title slug sync binding listener hook
  useEffect(() => {
    if (!editEvt) {
      setForm((prev) => ({ ...prev, slug: toSlug(prev.title) }))
    }
  }, [form.title, editEvt])

  // Computed data calculations matching criteria queries
  const filtered = (events || []).filter((evt) =>
    evt.title?.toLowerCase().includes(search.toLowerCase()) ||
    evt.location_city?.toLowerCase().includes(search.toLowerCase())
  )

  // Field manipulation input controller context
  function handleInput(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Dynamic variable field mutations array items modifier values
  function handleHighlightChange(index, val) {
    const next = [...form.highlights]
    next[index] = val
    setForm((prev) => ({ ...prev, highlights: next }))
  }

  function addHighlightField() {
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, ''] }))
  }

  function removeHighlightField(index) {
    if (form.highlights.length <= 1) return
    const next = form.highlights.filter((_, i) => i !== index)
    setForm((prev) => ({ ...prev, highlights: next }))
  }

  // Crud modification trigger pipeline blocks
  function openCreate() {
    setForm(EMPTY_FORM)
    setEditEvt(null)
    setShowModal(true)
  }

  function openEdit(evt) {
    setForm({
      title: evt.title || '',
      slug: evt.slug || '',
      event_type: evt.event_type || 'Competition',
      event_type_other: evt.event_type_other || '',
      status: evt.status || 'Upcoming',
      short_description: evt.short_description || '',
      full_description: evt.full_description || '',
      highlights: evt.highlights && evt.highlights.length ? evt.highlights : [''],
      is_published: !!evt.is_published,
      is_featured: !!evt.is_featured,
      format: evt.format || '',
      event_date: evt.event_date || '',
      display_date: evt.display_date || '',
      location_name: evt.location_name || '',
      location_city: evt.location_city || '',
      location_country: evt.location_country || 'Bangladesh',
      registration_url_bd: evt.registration_url_bd || '',
      registration_url_intl: evt.registration_url_intl || '',
      results_pdf_url: evt.results_pdf_url || '',
    })
    setEditEvt(evt)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.slug.trim()) {
      alert('Title and Slug parameters are strictly required validation items.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        highlights: form.highlights.filter((h) => h.trim() !== ''),
      }

      if (editEvt) {
        await updateEvent(editEvt.id, payload)
        await log({
          action: 'update',
          entity: 'events',
          entityId: editEvt.id,
          description: `Updated event configuration: "${payload.title}"`,
        })
      } else {
        const res = await createEvent(payload)
        await log({
          action: 'create',
          entity: 'events',
          entityId: res?.id,
          description: `Created new database event item: "${payload.title}"`,
        })
      }
      setShowModal(false)
    } catch (err) {
      console.error('Event operation transaction trace error state:', err)
      alert(`Transaction rejected: ${err.message || 'System error response.'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteEvt) return
    try {
      await deleteEvent(deleteEvt.id)
      await log({
        action: 'delete',
        entity: 'events',
        entityId: deleteEvt.id,
        description: `Permanently expunged calendar index event item: "${deleteEvt.title}"`,
      })
      setDeleteEvt(null)
    } catch (err) {
      console.error('Delete execution pipeline tracing failure status:', err)
    }
  }

  if (error) return <div className="dash-error">Failed to synchronize active cloud matrix repository.</div>

  return (
    <>
      <style>{`
        /* ── Page Layout Setup Configuration ── */
        .events-page {
          animation: pageFadeIn 0.2s ease both;
          background-color: #f7f4eb;
          min-height: 100vh;
          padding: 40px 48px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        @keyframes pageFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Top Header Navigation Dashboard Content Layout */
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 36px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .icon-square {
          width: 46px;
          height: 46px;
          background-color: #1a2333;
          color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .title-area {
          display: flex;
          flex-direction: column;
        }
        .main-title {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          color: #1a2333;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .subtitle {
          margin: 3px 0 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 16px;
          background: #1a2333;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #0f172a; }

        /* Summary Panel Workspace Container Grid Box */
        .content-card {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 12px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.015);
          overflow: visible; 
        }
        .card-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          background: #fff;
        }
        .counter-badge {
          font-size: 13.5px;
          color: #64748b;
          font-weight: 500;
        }
        .search-container { position: relative; }
        .search-container svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          z-index: 1;
        }
        .search-field {
          height: 32px;
          padding: 0 12px 0 32px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 6px;
          font-size: 12.5px;
          color: #1a2333;
          background: #fff;
          outline: none;
          width: 240px;
          transition: border-color 0.15s;
        }
        .search-field:focus { border-color: #1a2333; }

        /* ── Structured Content Tabular Data Matrices ── */
        .table-view-scroller { 
          overflow-x: auto;
          overflow-y: visible;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .data-table th {
          background: #fcfbfa;
          padding: 14px 24px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8a99ad;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          white-space: nowrap;
          vertical-align: middle;
        }
        .data-table td {
          padding: 14px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          vertical-align: middle;
          font-size: 13px;
          color: #334155;
        }
        .data-table td.col-title-cell {
          font-weight: 600;
          color: #1a2333;
        }
        .data-table td.col-actions {
          overflow: visible;
          white-space: nowrap;
          text-align: right;
          width: 60px;
          min-width: 60px;
        }
        .data-table tbody tr:hover { background-color: #faf9f6; }
        .data-table tbody tr:last-child td { border-bottom: none; }

        .title-flex-block { display: flex; align-items: center; gap: 8px; }
        .badge-list { display: flex; gap: 4px; flex-shrink: 0; }

        .meta-stack-block { display: flex; flex-direction: column; gap: 2px; }
        .meta-primary { font-weight: 600; color: #1a2333; }
        .meta-secondary { font-size: 11.5px; color: #64748b; }

        /* Visual Label Pill Elements Styles definitions */
        .label-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .pill-active   { color: #166534; background: rgba(22, 101, 52, 0.06); border-color: rgba(22, 101, 52, 0.1); }
        .pill-pending  { color: #b45309; background: rgba(180, 83, 9, 0.06); border-color: rgba(180, 83, 9, 0.1); }
        .pill-archived { color: #4b5563; background: rgba(107, 122, 150, 0.06); border-color: rgba(107, 122, 150, 0.15); }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 1px 5px;
          border-radius: 3px;
        }
        .tag-featured { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
        .tag-draft { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        /* ── Absolute Floating Popover Dropdown Elements Styles ── */
        .action-menu-container { 
          position: relative; 
          display: inline-block;
        }
        .action-trigger-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px; height: 26px;
          background: none;
          border: none;
          border-radius: 4px;
          color: #94a3b8;
          cursor: pointer;
          transition: background 0.1s, color 0.1s;
        }
        .action-trigger-btn:hover { background: #f1f5f9; color: #1a2333; }

        .popover-dropdown {
          position: fixed;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          z-index: 9999;
          min-width: 140px;
        }
        .popover-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          color: #334155;
        }
        .popover-item:hover { background: #f8fafc; }
        .popover-item-danger { color: #df4747; }
        .popover-item-danger:hover { background: #fef2f2; }
        .popover-line-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.04);
          margin: 2px 0;
        }

        /* Workspace Intermediary Loading Display State */
        .workspace-empty-view {
          padding: 60px 24px;
          text-align: center;
          color: #94a3b8;
          font-size: 13.5px;
        }
        .workspace-empty-view svg { display: block; margin: 0 auto 16px; opacity: 0.4; }
        .workspace-loading-view {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          color: #64748b;
          font-size: 13.5px;
        }
        .workspace-loading-view svg { animation: spinnerAnim 1s linear infinite; }
        @keyframes spinnerAnim { to { transform: rotate(360deg); } }

        /* ── Centered Modal Layout Forms Elements Styles ── */
        .modal-blur-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(2px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .modal-content-panel {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          width: 100%;
          max-width: 680px;
          max-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
          animation: modalSheetIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes modalSheetIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .modal-sticky-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .modal-headline-group { display: flex; flex-direction: column; }
        .modal-title-text { margin: 0; font-size: 16px; font-weight: 700; color: #1a2333; }
        .modal-subtitle-text { font-size: 12px; color: #64748b; margin-top: 2px; }
        .modal-header-actions { display: flex; gap: 8px; align-items: center; }

        .modal-scrollable-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .btn-modal-cancel {
          height: 34px;
          padding: 0 12px;
          background: none;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          color: #334155;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-modal-cancel:hover { background: #f8fafc; }
        
        .btn-modal-save {
          height: 34px;
          padding: 0 14px;
          background: #1a2333;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-modal-save:hover:not(:disabled) { background: #0f172a; }
        .btn-modal-save:disabled { opacity: 0.6; cursor: wait; }

        /* Modal Internal Structure Forms Elements Styles configuration */
        .form-fieldset-box {
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          background: #faf9f6;
        }
        .fieldset-legend-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #8a99ad;
          margin-bottom: 12px;
        }

        .form-row-field { margin-bottom: 12px; }
        .form-row-field:last-child { margin-bottom: 0; }
        .field-label-text {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #1a2333;
          margin-bottom: 4px;
        }
        .field-required-marker { color: #dc2626; margin-left: 2px; }

        .ev-input, .ev-textarea, .ev-select {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          color: #1a2333;
          font-size: 12.5px;
          outline: none;
          box-sizing: border-box;
        }
        .ev-textarea { height: auto; padding: 6px 10px; resize: vertical; }
        .ev-input:focus, .ev-textarea:focus, .ev-select:focus { border-color: #1a2333; }

        /* Special Nested Multiple Parameter Lists Item Fields */
        .dynamic-item-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .dynamic-item-row:last-child { margin-bottom: 0; }
        .btn-row-action {
          width: 36px; height: 36px;
          border-radius: 6px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          flex-shrink: 0;
        }
        .btn-row-action:hover { color: #1a2333; border-color: #1a2333; }

        .checkbox-container-row {
          display: flex;
          gap: 16px;
          padding: 4px 0;
        }
        .checkbox-label-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
        }
        .checkbox-label-wrapper input { cursor: pointer; }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 16px 24px 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        /* Responsive Mobile Layout Intermediaries viewport definitions */
        @media (max-width: 768px) {
          .events-page { padding: 20px 24px; }
          .header-section { flex-direction: column; align-items: flex-start; gap: 14px; }
          .btn-primary { align-self: flex-end; }
          .card-header-row { flex-direction: column; align-items: flex-start; gap: 12px; }
          .search-field { width: 100%; }
          .modal-content-panel { max-height: calc(100vh - 20px); }
        }
      `}</style>

      <div className="events-page">
        {/* Top Banner layout segment */}
        <div className="header-section">
          <div className="header-left">
            <div className="icon-square">
              <CalendarDays size={20} strokeWidth={1.5} />
            </div>
            <div className="title-area">
              <h1 className="main-title">Events Directory</h1>
              <p className="subtitle">Configure public calendar schedules, competitions and global youth summits.</p>
            </div>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={14} strokeWidth={2.5} />
            Create Event Record
          </button>
        </div>

        {/* Central Searchable Table Card panel wrapper */}
        <div className="content-card">
          <div className="card-header-row">
            <span className="counter-badge">
              {loading ? '0 items loaded' : `${filtered.length} matching events indexed`}
            </span>
            <div className="search-container">
              <Search size={13} strokeWidth={2} />
              <input
                className="search-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event title or city index…"
              />
            </div>
          </div>

          <div>
            {loading ? (
              <div className="workspace-loading-view">
                <Loader2 size={14} strokeWidth={2} />
                Synchronizing core cloud database assets…
              </div>
            ) : filtered.length === 0 ? (
              <div className="workspace-empty-view">
                <CalendarDays size={32} strokeWidth={1.5} />
                <p>{search ? 'No catalog entries fulfill your parameter query criteria.' : 'The registry is vacant. Click create above to generate items.'}</p>
              </div>
            ) : (
              <div className="table-view-scroller">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Schedule Date</th>
                      <th>Classification</th>
                      <th>Venue/Location</th>
                      <th>Visibility</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((evt) => {
                      return (
                        <tr key={evt.id}>
                          <td className="col-title-cell">
                            <div className="title-flex-block">
                              <span title={evt.title}>
                                {evt.title}
                              </span>
                              <div className="badge-list">
                                {evt.is_featured && (
                                  <span className="tag-pill tag-featured">
                                    <Star size={7} style={{ fill: 'currentColor' }} /> Featured
                                  </span>
                                )}
                                {!evt.is_published && (
                                  <span className="tag-pill tag-draft">
                                    <EyeOff size={7} /> Draft
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="meta-stack-block">
                              <span className="meta-primary">{evt.display_date || '—'}</span>
                              {evt.event_date && (
                                <span className="meta-secondary">
                                  {new Date(evt.event_date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {evt.event_type === 'Other' ? evt.event_type_other || 'Other' : evt.event_type}
                            </span>
                          </td>
                          <td>
                            <div className="meta-stack-block">
                              <span className="meta-primary" title={evt.location_name || ''}>
                                {evt.location_name || '—'}
                              </span>
                              {(evt.location_city || evt.location_country) && (
                                <span className="meta-secondary">
                                  {[evt.location_city, evt.location_country].filter(Boolean).join(', ')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`label-pill ${
                                evt.status === 'Upcoming'
                                  ? 'pill-active'
                                  : evt.status === 'Ongoing'
                                  ? 'pill-pending'
                                  : 'pill-archived'
                              }`}
                            >
                              <Circle size={5} style={{ fill: 'currentColor' }} />
                              {evt.status}
                            </span>
                          </td>
                          <td className="col-actions">
                            <div className="action-menu-container">
                              <button
                                className="action-trigger-btn"
                                onClick={(e) => {
                                  if (activeMenuId === evt.id) {
                                    setActiveMenuId(null)
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                                    setActiveMenuId(evt.id)
                                  }
                                }}
                                aria-label="Actions Menu"
                              >
                                <MoreVertical size={13} strokeWidth={2} />
                              </button>

                              {activeMenuId === evt.id && (
                                <>
                                  <div
                                    onClick={() => setActiveMenuId(null)}
                                    style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                                  />
                                  <div className="popover-dropdown" style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}>
                                    <button className="popover-item" onClick={() => { openEdit(evt); setActiveMenuId(null); }}>
                                      <Pencil size={12} /> Modify Details
                                    </button>
                                    {evt.results_pdf_url && (
                                      <a
                                        href={evt.results_pdf_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="popover-item"
                                        style={{ textDecoration: 'none' }}
                                      >
                                        <FileText size={12} /> Inspect Results
                                      </a>
                                    )}
                                    <div className="popover-line-divider" />
                                    <button
                                      className="popover-item popover-item-danger"
                                      onClick={() => { setDeleteEvt(evt); setActiveMenuId(null); }}
                                    >
                                      <Trash2 size={12} /> Expunge Record
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

        {/* ── Central Focus Configuration Modal Sheet Window ── */}
        {showModal && (
          <div className="modal-blur-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
            <div className="modal-content-panel">
              {/* Sticky Top Header block layout */}
              <div className="modal-sticky-header">
                <div className="modal-headline-group">
                  <h2 className="modal-title-text">{editEvt ? 'Edit Event Configuration' : 'Publish New Calendar Event'}</h2>
                  <div className="modal-subtitle-text">
                    Provide the core taxonomy credentials and venue location properties below.
                  </div>
                </div>
                <div className="modal-header-actions">
                  <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-modal-save" onClick={handleSubmit} disabled={saving}>
                    {saving ? <Loader2 size={12} strokeWidth={2.5} style={{ animation: 'spinnerAnim 1s linear infinite' }} /> : null}
                    {saving ? 'Saving…' : 'Save Event'}
                  </button>
                </div>
              </div>

              {/* Central Scrollable Core Content Body Input Matrix */}
              <div className="modal-scrollable-body">
                {/* Section One: Identity Mapping values layout */}
                <Section title="Event Metadata Mapping">
                  <Field label="Main Event Title" required>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleInput}
                      placeholder="e.g. National Astro-Physics Olympiad 2026"
                      className="ev-input"
                    />
                  </Field>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <Field label="URL Routing Slug (Autogenerated)" required>
                      <input
                        name="slug"
                        value={form.slug}
                        onChange={handleInput}
                        placeholder="national-olympiad-2026"
                        className="ev-input"
                        disabled={!!editEvt}
                        style={editEvt ? { background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' } : {}}
                      />
                    </Field>
                    <Field label="Operational Status Label">
                      <select name="status" value={form.status} onChange={handleInput} className="ev-select">
                        <option value="Upcoming">Upcoming (Awaiting Start)</option>
                        <option value="Ongoing">Ongoing (In Progress)</option>
                        <option value="Completed">Completed (Past Event)</option>
                      </select>
                    </Field>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <Field label="Event Classification Category">
                      <select name="event_type" value={form.event_type} onChange={handleInput} className="ev-select">
                        <option value="Competition">Competition / Tournament</option>
                        <option value="Summit">Global Summit / Conference</option>
                        <option value="Workshop">Educational Workshop</option>
                        <option value="Camp">National Selection Camp</option>
                        <option value="Other">Other Category Specifier</option>
                      </select>
                    </Field>

                    {form.event_type === 'Other' && (
                      <Field label="Specify Category Classification Name">
                        <input
                          name="event_type_other"
                          value={form.event_type_other}
                          onChange={handleInput}
                          placeholder="e.g. Research Symposium"
                          className="ev-input"
                        />
                      </Field>
                    )}
                  </div>
                </Section>

                {/* Section Two: Chronology and Logistics variables values config row */}
                <Section title="Scheduling & Geographic Placement">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="System Calendar Timestamp Date Picker">
                      <input
                        name="event_date"
                        type="date"
                        value={form.event_date}
                        onChange={handleInput}
                        className="ev-input"
                      />
                    </Field>
                    <Field label="Public Text Display Date Summary">
                      <input
                        name="display_date"
                        value={form.display_date}
                        onChange={handleInput}
                        placeholder="e.g. Oct 24 - Oct 28, 2026"
                        className="ev-input"
                      />
                    </Field>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <Field label="Venue Location Facility/Building Complex Name">
                      <input
                        name="location_name"
                        value={form.location_name}
                        onChange={handleInput}
                        placeholder="e.g. Muktijuddho Auditorium, Main Campus"
                        className="ev-input"
                      />
                    </Field>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <Field label="Metropolitan Area / City Name">
                      <input
                        name="location_city"
                        value={form.location_city}
                        onChange={handleInput}
                        placeholder="e.g. Dhaka"
                        className="ev-input"
                      />
                    </Field>
                    <Field label="Sovereign State Country Designation">
                      <input
                        name="location_country"
                        value={form.location_country}
                        onChange={handleInput}
                        placeholder="Bangladesh"
                        className="ev-input"
                      />
                    </Field>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <Field label="Event Attendance Structure Format">
                      <input
                        name="format"
                        value={form.format}
                        onChange={handleInput}
                        placeholder="e.g. Hybrid (In-Person Sessions with Global Virtual Streams)"
                        className="ev-input"
                      />
                    </Field>
                  </div>
                </Section>

                {/* Section Three: Comprehensive Descriptive Copy write textboxes */}
                <Section title="Descriptive Copy Narratives">
                  <Field label="Short Abstract Summary Description">
                    <textarea
                      name="short_description"
                      value={form.short_description}
                      onChange={handleInput}
                      placeholder="Brief overview highlight synopsis line for directory card lists…"
                      className="ev-textarea"
                      rows={2}
                    />
                  </Field>

                  <div style={{ marginTop: '12px' }}>
                    <Field label="Full In-Depth Narrative Description text specifications">
                      <textarea
                        name="full_description"
                        value={form.full_description}
                        onChange={handleInput}
                        placeholder="Comprehensive core text layout detailing scope, prerequisites and itinerary details…"
                        className="ev-textarea"
                        rows={5}
                      />
                    </Field>
                  </div>
                </Section>

                {/* Section Four: Dynamic Highlighting Features lists matrix input configurations */}
                <Section title="Key Milestone Highlights Bullet List Items">
                  {form.highlights.map((item, index) => (
                    <div key={index} className="dynamic-item-row">
                      <input
                        value={item}
                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                        placeholder="e.g. 50+ Global Universities delegation present"
                        className="ev-input"
                      />
                      <button
                        type="button"
                        className="btn-row-action"
                        onClick={() => removeHighlightField(index)}
                        disabled={form.highlights.length <= 1}
                        style={form.highlights.length <= 1 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                        title="Remove highlight entry item row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHighlightField}
                    style={{
                      marginTop: '8px',
                      background: 'none',
                      border: '1px dashed rgba(0,0,0,0.15)',
                      borderRadius: '6px',
                      color: '#1a2333',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={12} /> Add Complementary Highlights Item
                  </button>
                </Section>

                {/* Section Five: Access Credentials Portal Link Connections config inputs row */}
                <Section title="External Links & Assets Resource Bindings">
                  <Field label="Registration URL — Resident Domestic Registrants (Optional)">
                    <input
                      name="registration_url_bd"
                      value={form.registration_url_bd}
                      onChange={handleInput}
                      placeholder="https://…"
                      className="ev-input"
                    />
                  </Field>
                  <div style={{ marginTop: '12px' }}>
                    <Field label="Registration URL — International Registrants (Optional)">
                      <input
                        name="registration_url_intl"
                        value={form.registration_url_intl}
                        onChange={handleInput}
                        placeholder="https://…"
                        className="ev-input"
                      />
                    </Field>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <Field label="Official Scoreboard/Results Document PDF URL Bundle">
                      <input
                        name="results_pdf_url"
                        value={form.results_pdf_url}
                        onChange={handleInput}
                        placeholder="https://…"
                        className="ev-input"
                      />
                    </Field>
                  </div>
                </Section>

                {/* Section Six: Core Visibility System Matrix Toggles elements box */}
                <Section title="Publishing Core Flag Variables System Rules">
                  <div className="checkbox-container-row">
                    <label className="checkbox-label-wrapper">
                      <input
                        type="checkbox"
                        name="is_published"
                        checked={form.is_published}
                        onChange={handleInput}
                      />
                      <span>Make Live Public (Publish Directly to Production Streams)</span>
                    </label>
                  </div>
                  <div className="checkbox-container-row" style={{ marginTop: '8px' }}>
                    <label className="checkbox-label-wrapper">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={form.is_featured}
                        onChange={handleInput}
                      />
                      <span>Elevate to Featured Showcases (Prioritize positioning layout blocks)</span>
                    </label>
                  </div>
                </Section>
              </div>

              {/* Fixed Footer Row inside popup modal sheet component box */}
              <div className="modal-footer">
                <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-modal-save" onClick={handleSubmit} disabled={saving}>
                  {saving ? <Loader2 size={12} strokeWidth={2.5} style={{ animation: 'spinnerAnim 1s linear infinite' }} /> : null}
                  {saving ? 'Saving…' : 'Save Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Overlay dialog panel anchor */}
        {deleteEvt && (
          <DeleteConfirm
            itemName={`"${deleteEvt.title}"`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteEvt(null)}
          />
        )}
      </div>
    </>
  )
}

// ── Shared Sublevel Presentational Component Layout Structures ──
function Section({ title, children }) {
  return (
    <div className="form-fieldset-box">
      <div className="fieldset-legend-title">{title}</div>
      {children}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="form-row-field">
      <label className="field-label-text">
        {label}
        {required && <span className="field-required-marker">*</span>}
      </label>
      {children}
    </div>
  )
}