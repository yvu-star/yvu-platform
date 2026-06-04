'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useActivityLog } from '@/hooks/useActivityLog'
import {
  getTimeline,
  createTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry,
} from '@/lib/services/timeline.service'
import DeleteConfirm from '@/components/admin/DeleteConfirm'
import {
  Clock, Plus, Pin, Trophy, Rocket, Sparkles, Target,
  Megaphone, CheckSquare, FlaskConical, Search, MoreVertical,
  Pencil, Trash2, EyeOff, Loader2
} from 'lucide-react'

// ── constants ────────────────────────────────────────────────────────────────

const ICON_PRESETS = [
  { key: 'pin',       label: 'Pin',        Icon: Pin          },
  { key: 'trophy',    label: 'Trophy',     Icon: Trophy       },
  { key: 'rocket',    label: 'Rocket',     Icon: Rocket       },
  { key: 'sparkles',  label: 'Sparkles',   Icon: Sparkles     },
  { key: 'target',    label: 'Target',     Icon: Target       },
  { key: 'megaphone', label: 'Megaphone',  Icon: Megaphone    },
  { key: 'check',     label: 'Check',      Icon: CheckSquare  },
  { key: 'flask',     label: 'Flask',      Icon: FlaskConical },
]

const ICON_MAP = Object.fromEntries(ICON_PRESETS.map(({ key, Icon }) => [key, Icon]))

const DEFAULT_ICON = 'pin'

const EMPTY_FORM = {
  year:                 '',
  month:                '',
  display_order:        0,
  title:                '',
  short_description:    '',
  expanded_description: '',
  icon:                 DEFAULT_ICON,
  is_active:            true,
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(row) {
  const month = row.month ? row.month + ' ' : ''
  const year  = row.year  ? String(row.year) : '—'
  return month + year
}

function RowIcon({ iconKey }) {
  const LucideIcon = ICON_MAP[iconKey] || Pin
  return (
    <span className="tl-row-icon-wrap">
      <LucideIcon size={13} strokeWidth={2} />
    </span>
  )
}

// ── Form Components ─────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="tl-form-section">
      <div className="tl-form-section__label">{title}</div>
      {children}
    </div>
  )
}

// Fixed validation naming constraint by directly binding label properties safely
function Field({ label, required, children }) {
  return (
    <div className="tl-field">
      <label className="tl-field__label">
        {label}{required && <span className="tl-field__required">*</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <div className="tl-toggle-container">
      <div>
        <div className="tl-toggle-label">{label}</div>
        {sublabel && <div className="tl-toggle-sublabel">{sublabel}</div>}
      </div>
      <label className="tl-toggle">
        <div
          className={`tl-toggle__track${checked ? ' tl-toggle__track--on' : ''}`}
          onClick={() => onChange(!checked)}
        >
          <div className="tl-toggle__thumb" style={{ left: checked ? 21 : 3 }} />
        </div>
      </label>
    </div>
  )
}

function IconPicker({ value, onChange }) {
  return (
    <div className="tl-icon-picker">
      <div className="tl-icon-presets">
        {ICON_PRESETS.map(function ({ key, label, Icon }) {
          const isActive = value === key
          return (
            <button
              key={key}
              type="button"
              className={isActive ? 'tl-icon-btn tl-icon-btn--active' : 'tl-icon-btn'}
              onClick={function () { onChange(key) }}
              title={label}
              aria-label={label}
            >
              <Icon size={16} strokeWidth={1.75} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const { data, loading, error } = useRealtimeTable(getTimeline, 'timeline')
  const { log } = useActivityLog()

  const [search, setSearch]           = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [editEntry, setEditEntry]     = useState(null)
  const [deleteEntry, setDeleteEntry] = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Filter functionality mapping public search inputs
  const filtered = (data || []).filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.year?.toString().includes(search)
  )

  const handleToggleActive = useCallback(async function (row) {
    const next = !row.is_active
    try {
      await updateTimelineEntry(row.id, { is_active: next })
      await log({
        action:      'update',
        entity:      'timeline',
        entityId:    row.id,
        description: 'Set timeline entry "' + row.title + '" to ' + (next ? 'active' : 'inactive'),
      })
    } catch (err) {
      console.error('Toggle active failed:', err)
    }
  }, [log])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditEntry(null)
    setShowForm(true)
  }

  function openEdit(row) {
    setForm({
      year:                 row.year                 ?? '',
      month:                row.month                ?? '',
      display_order:        row.display_order        ?? 0,
      title:                row.title                ?? '',
      short_description:    row.short_description    ?? '',
      expanded_description: row.expanded_description ?? '',
      icon:                 row.icon                 ?? DEFAULT_ICON,
      is_active:            row.is_active            ?? true,
    })
    setEditEntry(row)
    setShowForm(true)
  }

  function handleField(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit() {
    const yearStr = String(form.year).trim()
    if (!yearStr || !form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        year:                 Number(form.year) || form.year,
        month:                form.month                || null,
        display_order:        Number(form.display_order) || 0,
        title:                form.title.trim(),
        short_description:    form.short_description    || null,
        expanded_description: form.expanded_description || null,
        icon:                 form.icon                 || DEFAULT_ICON,
        is_active:            form.is_active,
      }
      if (editEntry) {
        await updateTimelineEntry(editEntry.id, payload)
        await log({
          action:      'update',
          entity:      'timeline',
          entityId:    editEntry.id,
          description: 'Updated timeline entry: ' + form.title + ' (' + yearStr + ')',
        })
      } else {
        const result = await createTimelineEntry(payload)
        await log({
          action:      'create',
          entity:      'timeline',
          entityId:    result?.id,
          description: 'Created timeline entry: ' + form.title + ' (' + yearStr + ')',
        })
      }
      setShowForm(false)
    } catch (err) {
      console.error('Timeline save error:', err)
      alert('Save failed: ' + (err?.message || err?.code || JSON.stringify(err)))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteTimelineEntry(deleteEntry.id)
      await log({
        action:      'delete',
        entity:      'timeline',
        entityId:    deleteEntry.id,
        description: 'Deleted timeline entry: ' + deleteEntry.title + ' (' + deleteEntry.year + ')',
      })
      setDeleteEntry(null)
    } catch (err) {
      console.error('Timeline delete error:', err)
    }
  }

  if (error) return <div className="dash-error">Failed to load timeline.</div>

  return (
    <>
      <style>{`
        /* ── Page Setup & Premium Executive Palette ── */
        .tl-page { 
          animation: tlPageIn 0.2s ease both;
          background-color: #f7f4eb; 
          min-height: 100vh;
          padding: 40px 48px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        @keyframes tlPageIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Page Header layout ── */
        .tl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 36px;
        }
        .tl-header__left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .tl-header__icon-box {
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
        .tl-header__title-container {
          display: flex;
          flex-direction: column;
        }
        .tl-header__title {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          color: #1a2333;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .tl-header__subtitle {
          margin: 3px 0 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
        }
        .tl-btn-primary {
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
        .tl-btn-primary:hover {
          background: #0f172a;
        }

        /* ── Content Card Wrapper ── */
        .tl-content-card {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 12px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.015);
          overflow: visible; 
        }
        .tl-content-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          background: #fff;
        }
        .tl-content-card__title-area {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tl-content-card__title {
          font-size: 13.5px;
          color: #64748b;
          font-weight: 500;
        }
        .tl-content-card__search {
          position: relative;
        }
        .tl-content-card__search svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .tl-search-input {
          height: 32px;
          padding: 0 12px 0 32px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 6px;
          font-size: 12.5px;
          color: #1a2333;
          background: #fff;
          outline: none;
          width: 220px;
          transition: border-color 0.15s;
        }
        .tl-search-input:focus {
          border-color: #1a2333;
        }

        /* ── Compact Tabular View ── */
        .tl-table-wrapper {
          overflow: visible;
        }
        .tl-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          table-layout: fixed;
        }
        .tl-table th {
          background: #fcfbfa;
          padding: 12px 24px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8a99ad;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .tl-table td {
          padding: 14px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          vertical-align: middle;
          font-size: 13px;
          color: #334155;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .tl-table td.col-actions {
          overflow: visible;
          white-space: normal;
        }
        .tl-table tbody tr:hover {
          background-color: #faf9f6;
        }
        .tl-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* Column Config Layout */
        .col-date { width: 16%; }
        .col-title { font-weight: 500; color: #1a2333; width: 26%; }
        .col-title__row { display: flex; align-items: center; gap: 8px; overflow: hidden; }
        .col-title__text { text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
        .col-title__badges { display: flex; gap: 4px; flex-shrink: 0; }
        .col-desc { width: 36%; color: #64748b; }
        .col-status { width: 12%; }
        .col-actions { width: 10%; text-align: right; }

        .tl-date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tl-row-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(26, 35, 51, 0.05);
          color: #1a2333;
          flex-shrink: 0;
        }
        .tl-date-text {
          font-weight: 600;
          color: #1a2333;
        }

        /* Status Pills & Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 1px 5px;
          border-radius: 3px;
        }
        .badge--draft {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .status-pill--active {
          color: #166534;
          background: rgba(22, 101, 52, 0.06);
          border-color: rgba(22, 101, 52, 0.1);
        }
        .status-pill--inactive {
          color: #4b5563;
          background: rgba(107, 122, 150, 0.06);
          border-color: rgba(107, 122, 150, 0.15);
        }

        /* Dropdown Action Menu Controls */
        .action-menu-wrap { 
          position: relative; 
          display: inline-block;
        }
        .action-menu-btn {
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
        .action-menu-btn:hover {
          background: #f1f5f9;
          color: #1a2333;
        }
        .dropdown-menu {
          position: absolute;
          right: 0; top: calc(100% + 4px);
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          overflow: hidden;
          z-index: 50; 
          min-width: 130px;
        }
        .dropdown-item {
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
        .dropdown-item:hover { background: #f8fafc; }
        .dropdown-item--danger { color: #df4747; }
        .dropdown-item--danger:hover { background: #fef2f2; }
        .dropdown-divider {
          height: 1px;
          background: rgba(0,0,0,0.04);
          margin: 2px 0;
        }

        /* State Intermediaries */
        .tl-empty {
          padding: 50px 24px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
        }
        .tl-empty svg {
          display: block;
          margin: 0 auto 12px;
          opacity: 0.4;
        }
        .tl-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 50px 24px;
          color: #64748b;
          font-size: 13px;
        }
        .tl-loading svg { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Centered Premium Popup Form Sheet ── */
        .tl-modal-overlay {
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
        .tl-modal-panel {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          width: 100%;
          max-width: 640px;
          max-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 45px rgba(0,0,0,0.12);
          animation: tlModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes tlModalIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .tl-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          background: #fff;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        .tl-modal-header__title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1a2333;
        }
        .tl-modal-header__sub {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
          white-space: normal;
        }
        .tl-modal-header__actions { display: flex; gap: 8px; align-items: center; }
        
        .tl-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        
        .tl-btn-modal-cancel {
          height: 34px;
          padding: 0 12px;
          background: none;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          color: #334155;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
        }
        .tl-btn-modal-cancel:hover { background: #f8fafc; }
        
        .tl-btn-modal-save {
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
        .tl-btn-modal-save:hover:not(:disabled) { background: #0f172a; }
        .tl-btn-modal-save:disabled { opacity: 0.6; cursor: wait; }

        .tl-form-section {
          border: 1px solid rgba(0,0,0,0.03);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          background: #faf9f6;
        }
        .tl-form-section__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #8a99ad;
          margin-bottom: 12px;
        }

        .tl-field { margin-bottom: 12px; }
        .tl-field:last-child { margin-bottom: 0; }
        .tl-field__label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #1a2333;
          margin-bottom: 4px;
          }
        .tl-field__required { color: #dc2626; margin-left: 1px; }

        .ev-input, .ev-textarea {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          color: #1a2333;
          font-size: 12.5px;
          outline: none;
          box-sizing: border-box;
        }
        .ev-textarea { height: auto; padding: 6px 10px; resize: vertical; }
        .ev-input:focus, .ev-textarea:focus { border-color: #1a2333; }

        /* Dynamic Preset Pickers */
        .tl-icon-picker {
          display: flex;
          flex-direction: column;
        }
        .tl-icon-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tl-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .tl-icon-btn:hover {
          border-color: #1a2333;
          color: #1a2333;
          background: rgba(26, 35, 51, 0.02);
        }
        .tl-icon-btn--active {
          border-color: #1a2333 !important;
          background: rgba(26, 35, 51, 0.05) !important;
          color: #1a2333 !important;
          font-weight: bold;
        }

        /* Switch Toggles styles */
        .tl-toggle-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 0;
        }
        .tl-toggle-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #1a2333;
        }
        .tl-toggle-sublabel {
          font-size: 11.5px;
          color: #64748b;
          margin-top: 1px;
        }
        .tl-toggle {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .tl-toggle__track {
          width: 34px; height: 18px;
          border-radius: 9px;
          position: relative;
          background: #e2e8f0;
          transition: background 0.15s;
        }
        .tl-toggle__track--on { background: #1a2333; }
        .tl-toggle__thumb {
          position: absolute;
          top: 2px;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #fff;
          transition: left 0.15s;
        }

        .tl-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 16px 24px 24px;
          border-top: 1px solid rgba(0,0,0,0.05);
          background: #fff;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        @media (max-width: 768px) {
          .tl-page { padding: 20px 24px; }
          .tl-header { flex-direction: column; align-items: flex-start; gap: 14px; }
          .tl-btn-primary { align-self: flex-end; }
          .tl-content-card__header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .tl-search-input { width: 100%; }
          .tl-modal-panel { max-height: calc(100vh - 20px); }
        }
      `}</style>

      <div className="tl-page">
        {/* Unified Top Banner */}
        <div className="tl-header">
          <div className="tl-header__left">
            <div className="tl-header__icon-box">
              <Clock size={20} strokeWidth={1.5} />
            </div>
            <div className="tl-header__title-container">
              <h1 className="tl-header__title">Timeline</h1>
              <p className="tl-header__subtitle">Manage YouthVerse Union&apos;s history and milestones.</p>
            </div>
          </div>
          <button className="tl-btn-primary" onClick={openCreate}>
            <Plus size={14} strokeWidth={2.5} />
            Add Timeline Item
          </button>
        </div>

        {/* Unified Searchable Card Block */}
        <div className="tl-content-card">
          <div className="tl-content-card__header">
            <div className="tl-content-card__title-area">
              <span className="tl-content-card__title">
                {loading ? '0 records' : `${filtered.length} records`}
              </span>
            </div>
            <div className="tl-content-card__search">
              <Search size={13} strokeWidth={2} />
              <input
                className="tl-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search milestones..."
              />
            </div>
          </div>

          <div>
            {loading ? (
              <div className="tl-loading">
                <Loader2 size={14} strokeWidth={2} />
                Loading timeline entries...
              </div>
            ) : filtered.length === 0 ? (
              <div className="tl-empty">
                <Clock size={28} strokeWidth={1.5} />
                <p>{search ? 'No milestones found matching your criteria.' : 'No timeline entries yet. Add your first milestone.'}</p>
              </div>
            ) : (
              <div className="tl-table-wrapper">
                <table className="tl-table">
                  <thead>
                    <tr>
                      <th className="col-date">Date</th>
                      <th className="col-title">Title</th>
                      <th className="col-desc">Short Description</th>
                      <th className="col-status">Status</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      return (
                        <tr key={item.id}>
                          <td className="col-date">
                            <span className="tl-date-cell">
                              {item.icon ? <RowIcon iconKey={item.icon} /> : null}
                              <span className="tl-date-text">{formatDate(item)}</span>
                            </span>
                          </td>
                          <td className="col-title">
                            <div className="col-title__row">
                              <span className="col-title__text">{item.title}</span>
                              <div className="col-title__badges">
                                {!item.is_active && (
                                  <span className="badge badge--draft">
                                    <EyeOff size={8} strokeWidth={2} />
                                    Hidden
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="col-desc" title={item.short_description || ''}>
                            {item.short_description || '—'}
                          </td>
                          <td className="col-status">
                            <span className={`status-pill ${item.is_active ? 'status-pill--active' : 'status-pill--inactive'}`}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="col-actions">
                            <div className="action-menu-wrap">
                              <button
                                className="action-menu-btn"
                                onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                                aria-label="Actions"
                              >
                                <MoreVertical size={13} strokeWidth={2} />
                              </button>
                              
                              {activeMenuId === item.id && (
                                <>
                                  <div onClick={() => setActiveMenuId(null)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                                  <div className="dropdown-menu">
                                    <button className="dropdown-item" onClick={() => { handleToggleActive(item); setActiveMenuId(null); }}>
                                      <Clock size={12} strokeWidth={2} /> Toggle State
                                    </button>
                                    <button className="dropdown-item" onClick={() => { openEdit(item); setActiveMenuId(null); }}>
                                      <Pencil size={12} strokeWidth={2} /> Edit
                                    </button>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item dropdown-item--danger" onClick={() => { setDeleteEntry(item); setActiveMenuId(null); }}>
                                      <Trash2 size={12} strokeWidth={2} /> Delete
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

        {/* ── Centered Add / Edit Form Modal ── */}
        {showForm && (
          <div
            className="tl-modal-overlay"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <div className="tl-modal-panel">
              {/* Sticky Top Header Section */}
              <div className="tl-modal-header">
                <div>
                  <h2 className="tl-modal-header__title">{editEntry ? 'Edit Timeline Item' : 'Add Timeline Item'}</h2>
                  <div className="tl-modal-header__sub">
                    {editEntry ? `Editing milestone entry from ${editEntry.year}` : 'Fill out the specifications below to publish a new record.'}
                  </div>
                </div>
                <div className="tl-modal-header__actions">
                  <button className="tl-btn-modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="tl-btn-modal-save" onClick={handleSubmit} disabled={saving}>
                    {saving ? <Loader2 size={12} strokeWidth={2.5} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Central Scrollable Area */}
              <div className="tl-modal-body">
                
                {/* Date Setting Structure */}
                <Section title="Chronology Setting">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Year" required>
                      <input
                        name="year"
                        type="number"
                        value={form.year}
                        onChange={handleField}
                        placeholder="e.g. 2025"
                        className="ev-input"
                        min="1900"
                        max="2100"
                      />
                    </Field>
                    <Field label="Month (Optional)">
                      <input
                        name="month"
                        type="text"
                        value={form.month}
                        onChange={handleField}
                        placeholder="e.g. October"
                        className="ev-input"
                      />
                    </Field>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <Field label="Display / Sort Order Weight">
                      <input
                        name="display_order"
                        type="number"
                        value={form.display_order}
                        onChange={handleField}
                        placeholder="0"
                        className="ev-input"
                      />
                    </Field>
                  </div>
                </Section>

                {/* Core Context Content Fields */}
                <Section title="Milestone Context">
                  <Field label="Title" required>
                    <input
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleField}
                      placeholder="Enter milestone title"
                      className="ev-input"
                    />
                  </Field>

                  <Field label="Short Summary Description">
                    <textarea
                      name="short_description"
                      value={form.short_description}
                      onChange={handleField}
                      placeholder="Brief context displayed default in historical charts…"
                      className="ev-textarea"
                      rows={2}
                    />
                  </Field>

                  <Field label="Expanded Deep-Dive Narrative">
                    <textarea
                      name="expanded_description"
                      value={form.expanded_description}
                      onChange={handleField}
                      placeholder="Comprehensive details made visible upon interactive expanding events…"
                      className="ev-textarea"
                      rows={4}
                    />
                  </Field>
                </Section>

                {/* Visual Preset Selection */}
                <Section title="Interface Branding">
                  <Field label="Select Theme Icon Preset">
                    <IconPicker 
                      value={form.icon} 
                      onChange={key => setForm(prev => ({ ...prev, icon: key }))} 
                    />
                  </Field>
                </Section>

                {/* Visibility Controls */}
                <Section title="Visibility Settings">
                  <Toggle
                    checked={form.is_active}
                    onChange={val => setForm(prev => ({ ...prev, is_active: val }))}
                    label="Active State Status"
                    sublabel="Inactive configuration criteria hiddenly excludes records on live user interfaces"
                  />
                </Section>
              </div>

              {/* Modal Sticky Bottom Action Footer */}
              <div className="tl-modal-footer">
                <button className="tl-btn-modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="tl-btn-modal-save" onClick={handleSubmit} disabled={saving}>
                  {saving ? <Loader2 size={12} strokeWidth={2.5} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Trigger confirmation container */}
        {deleteEntry && (
          <DeleteConfirm
            itemName={`\"${deleteEntry.title}\" (${deleteEntry.year})`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteEntry(null)}
          />
        )}
      </div>
    </>
  )
}