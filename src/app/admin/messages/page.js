'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import DeleteConfirm from '@/components/admin/DeleteConfirm'
import { useActivityLog } from '@/hooks/useActivityLog'
import {
  Mail, MailOpen, MailCheck, Trash2, Reply,
  Search, Inbox, CheckCheck, Circle, RefreshCw,
  ChevronDown, ChevronUp, Clock, User, AtSign, Tag,
} from 'lucide-react'

// ─── relative time ────────────────────────────────────────────────────────────

function relativeTime(dateStr) {
  if (!dateStr) return '—'
  var now  = Date.now()
  var then = new Date(dateStr).getTime()
  var diff = Math.floor((now - then) / 1000)
  if (diff < 60)  return 'Just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  if (diff < 172800) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── tab filter ───────────────────────────────────────────────────────────────

var TABS = [
  { key: 'all',    label: 'All Messages', Icon: Inbox      },
  { key: 'unread', label: 'Unread',       Icon: Mail       },
  { key: 'read',   label: 'Read',         Icon: MailCheck  },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const supabase    = createClient()
  const { log }     = useActivityLog()

  const [messages,      setMessages]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [loadError,     setLoadError]     = useState(null)
  const [tab,           setTab]           = useState('all')
  const [query,         setQuery]         = useState('')
  const [expanded,      setExpanded]      = useState(null)   // message id
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)
  const [newIds,        setNewIds]        = useState(new Set()) // flash animation

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchMessages = useCallback(async function () {
    var { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setLoadError(error.message)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(function () { fetchMessages() }, [fetchMessages])

  // ── realtime subscription ──────────────────────────────────────────────────

  useEffect(function () {
    var channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        function (payload) {
          if (payload.eventType === 'INSERT') {
            setMessages(function (prev) { return [payload.new, ...prev] })
            setNewIds(function (prev) {
              var next = new Set(prev)
              next.add(payload.new.id)
              return next
            })
            // clear flash after 3s
            setTimeout(function () {
              setNewIds(function (prev) {
                var next = new Set(prev)
                next.delete(payload.new.id)
                return next
              })
            }, 3000)
          } else if (payload.eventType === 'UPDATE') {
            setMessages(function (prev) {
              return prev.map(function (m) {
                return m.id === payload.new.id ? payload.new : m
              })
            })
          } else if (payload.eventType === 'DELETE') {
            setMessages(function (prev) {
              return prev.filter(function (m) { return m.id !== payload.old.id })
            })
          }
        }
      )
      .subscribe()
    return function () { supabase.removeChannel(channel) }
  }, [supabase])

  // ── mark read / unread ─────────────────────────────────────────────────────

  async function markRead(id) {
    var msg = messages.find(function (m) { return m.id === id })
    if (!msg || msg.is_read) return
    await supabase.from('messages').update({ is_read: true }).eq('id', id)
    setMessages(function (prev) {
      return prev.map(function (m) {
        return m.id === id ? Object.assign({}, m, { is_read: true }) : m
      })
    })
    await log({
      action:      'update',
      entity:      'messages',
      entityId:    id,
      description: 'Marked message read from: ' + (msg ? msg.name : id),
    })
  }

  async function toggleRead(e, row) {
    e.stopPropagation()
    var next = !row.is_read
    await supabase.from('messages').update({ is_read: next }).eq('id', row.id)
    setMessages(function (prev) {
      return prev.map(function (m) {
        return m.id === row.id ? Object.assign({}, m, { is_read: next }) : m
      })
    })
    await log({
      action:      'update',
      entity:      'messages',
      entityId:    row.id,
      description: (next ? 'Marked read' : 'Marked unread') + ': ' + row.name,
    })
  }

  // ── expand (auto-mark read) ────────────────────────────────────────────────

  async function handleRowClick(msg) {
    if (expanded === msg.id) {
      setExpanded(null)
      return
    }
    setExpanded(msg.id)
    await markRead(msg.id)
  }

  // ── delete ─────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await supabase.from('messages').delete().eq('id', deleteTarget.id)
      await log({
        action:      'delete',
        entity:      'messages',
        entityId:    deleteTarget.id,
        description: 'Deleted message from: ' + deleteTarget.name,
      })
      setMessages(function (prev) {
        return prev.filter(function (m) { return m.id !== deleteTarget.id })
      })
      if (expanded === deleteTarget.id) setExpanded(null)
      setDeleteTarget(null)
    } catch (err) {
      alert('Error deleting: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  // ── filter + search ────────────────────────────────────────────────────────

  var filtered = messages.filter(function (m) {
    if (tab === 'unread' && m.is_read !== false) return false
    if (tab === 'read'   && m.is_read !== true)  return false
    if (query.trim()) {
      var q = query.toLowerCase()
      return (
        (m.name    || '').toLowerCase().includes(q) ||
        (m.email   || '').toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  // ── stats ──────────────────────────────────────────────────────────────────

  var total  = messages.length
  var unread = messages.filter(function (m) { return m.is_read === false }).length
  var read   = messages.filter(function (m) { return m.is_read === true  }).length

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="msg-page">
      <style>{`
        /* ════════════════════════════════════════════════
           PAGE WRAPPER
        ════════════════════════════════════════════════ */
        .msg-page {
          max-width: 1140px;
          margin: 0 auto;
          padding: 24px 20px;
          font-family: inherit;
          animation: msgPageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes msgPageIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        /* ════════════════════════════════════════════════
           TIMELINE SPECIFIC HEADER STRUCTURE
        ════════════════════════════════════════════════ */
        .msg-header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(31,42,68,0.06);
          padding-bottom: 24px;
        }
        .msg-header-left-flex {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .msg-header-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md, 8px);
          background: var(--navy, #1f2a44);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(31,42,68,0.08);
        }
        .msg-header-titles-wrap {}
        .msg-header-titles-wrap h1 {
          font-size: 22px;
          font-weight: 600;
          color: var(--navy, #1f2a44);
          margin: 0 0 2px 0;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .msg-header-sub {
          font-size: 13px;
          color: var(--text-muted, #718096);
          margin: 0;
        }
        
        /* Compact Header Meta Quick-Stats */
        .msg-header-right-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .msg-quick-stat {
          font-size: 12px;
          color: var(--text-muted, #718096);
          background: rgba(31,42,68,0.03);
          padding: 6px 12px;
          border-radius: var(--radius-sm, 6px);
          border: 1px solid rgba(31,42,68,0.05);
          font-weight: 500;
        }
        .msg-quick-stat strong {
          color: var(--navy, #1f2a44);
          font-weight: 600;
        }

        /* ════════════════════════════════════════════════
           MAIN UNIFIED CONTAINER
        ════════════════════════════════════════════════ */
        .msg-main-panel {
          background: #fff;
          border: 1px solid rgba(31,42,68,0.08);
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 4px 20px rgba(15,23,42,0.03);
          overflow: hidden;
          background-color: #fdfdfb; /* Gentle premium beige/white tint surface */
        }

        /* Toolbar controls inside unified container */
        .msg-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(31,42,68,0.06);
          background: #fff;
          gap: 16px;
          flex-wrap: wrap;
        }
        .msg-search-wrap {
          flex: 1;
          max-width: 360px;
          min-width: 240px;
          position: relative;
        }
        .msg-search-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted, #94a3b8);
          pointer-events: none;
        }
        .msg-search {
          width: 100%;
          height: 38px;
          padding: 0 12px 0 36px;
          border: 1px solid rgba(31,42,68,0.12);
          border-radius: var(--radius-sm, 6px);
          font-size: 13.5px;
          background: #fff;
          color: var(--navy, #1f2a44);
          outline: none;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }
        .msg-search:focus {
          border-color: var(--gold, #c8a75e);
          box-shadow: 0 0 0 3px rgba(200,167,94,0.08);
        }

        /* Tab Pills Group */
        .msg-tabs {
          display: flex;
          gap: 2px;
          background: rgba(31,42,68,0.04);
          border-radius: var(--radius-sm, 6px);
          padding: 3px;
          border: 1px solid rgba(31,42,68,0.02);
        }
        .msg-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          background: transparent;
          color: var(--text-muted, #64748b);
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .msg-tab:hover {
          color: var(--navy, #1f2a44);
        }
        .msg-tab.active {
          background: #fff;
          color: var(--navy, #1f2a44);
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(15,23,42,0.06);
        }
        .msg-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1px 6px;
          background: rgba(200,167,94,0.12);
          color: var(--gold-dark, #a1823a);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 2px;
        }

        /* ════════════════════════════════════════════════
           CLEAN STRUCTURAL MESSAGES TABLE-LIST
        ════════════════════════════════════════════════ */
        .msg-list { display: flex; flex-direction: column; background: #fff; }
        
        .msg-row {
          border-bottom: 1px solid rgba(31,42,68,0.05);
          background: #fff;
          cursor: pointer;
          transition: background 0.15s ease;
          position: relative;
        }
        .msg-row:last-child { border-bottom: none; }
        .msg-row:hover { background: rgba(31,42,68,0.01); }
        .msg-row.expanded { background: rgba(200,167,94,0.02); }

        /* Realtime pulse accent instead of full flash */
        @keyframes subtleFlash {
          0%   { background: rgba(200,167,94,0.1); }
          100% { background: transparent; }
        }
        .msg-row.new-flash {
          animation: subtleFlash 3s ease forwards;
        }

        /* Column Layout Structure */
        .msg-row-main {
          display: grid;
          grid-template-columns: 40px 180px 1fr 110px 120px;
          align-items: center;
          padding: 14px 20px;
          gap: 16px;
        }

        /* Status Pills (Unread / Read) */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          width: fit-content;
        }
        .status-pill.unread {
          background: rgba(200,167,94,0.1);
          color: var(--gold-dark, #917235);
          border: 1px solid rgba(200,167,94,0.2);
        }
        .status-pill.read {
          background: rgba(113,128,150,0.06);
          color: #5a6a85;
          border: 1px solid rgba(113,128,150,0.15);
        }
        .status-dot-indicator {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .msg-sender {
          font-size: 13.5px;
          color: var(--navy, #1f2a44);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }
        .msg-sender.bold { font-weight: 600; color: #000; }
        
        .msg-subject-wrap {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .msg-subject {
          font-size: 13.5px;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .msg-row.unread .msg-subject {
          font-weight: 500;
          color: var(--navy, #1f2a44);
        }
        .msg-email {
          font-size: 12px;
          color: var(--text-muted, #718096);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        .msg-time {
          font-size: 12px;
          color: var(--text-muted, #718096);
          white-space: nowrap;
          font-weight: 400;
          text-align: right;
        }

        /* Elegant Table Action Buttons */
        .msg-row-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .msg-row:hover .msg-row-actions,
        .msg-row.expanded .msg-row-actions {
          opacity: 1;
        }

        .msg-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(31,42,68,0.1);
          background: #fff;
          border-radius: 4px;
          width: 28px;
          height: 28px;
          cursor: pointer;
          transition: all 0.15s ease;
          color: #64748b;
        }
        .msg-action-btn:hover {
          border-color: var(--gold, #c8a75e);
          color: var(--navy, #1f2a44);
          background: rgba(200,167,94,0.05);
        }

        .msg-delete-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(192,57,43,0.12);
          background: #fff;
          border-radius: 4px;
          width: 28px; height: 28px;
          cursor: pointer;
          transition: all 0.15s ease;
          color: #c0392b;
        }
        .msg-delete-btn:hover {
          background: #fff5f5;
          border-color: #e74c3c;
        }

        /* ── INLINE EXPANDED CONTENT ──────────── */
        .msg-expand {
          border-top: 1px solid rgba(31,42,68,0.05);
          border-bottom: 1px solid rgba(31,42,68,0.05);
          padding: 24px 32px;
          background: #fafaf9; /* Elegant timeline-matching muted background container */
          animation: expandIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes expandIn {
          from { opacity: 0; transform: translateY(-2px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .msg-expand-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 20px;
        }
        .msg-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .msg-meta-item strong {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #8898aa);
        }
        .msg-meta-item span { color: var(--navy, #1f2a44); font-weight: 500; }
        .msg-meta-item a {
          color: var(--gold-dark, #a1823a);
          text-decoration: none;
          font-weight: 500;
        }
        .msg-meta-item a:hover { text-decoration: underline; }

        .msg-expand-body {
          font-size: 14px;
          color: #334155;
          line-height: 1.65;
          white-space: pre-wrap;
          background: #fff;
          border: 1px solid rgba(31,42,68,0.06);
          border-radius: 6px;
          padding: 18px 22px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .msg-expand-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-reply {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          height: 34px;
          background: var(--navy, #1f2a44);
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.15s ease;
        }
        .btn-reply:hover {
          opacity: 0.95;
        }
        .btn-text-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 34px;
          background: transparent;
          border: 1px solid rgba(31,42,68,0.15);
          color: #475569;
          font-size: 12.5px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.15s ease;
        }
        .btn-text-action:hover {
          background: #fff;
          border-color: var(--gold, #c8a75e);
          color: var(--navy, #1f2a44);
        }

        /* ════════════════════════════════════════════════
           STATES & NO RESULTS
        ════════════════════════════════════════════════ */
        .msg-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 20px;
          color: var(--text-muted, #718096);
          text-align: center;
          background: #fff;
        }
        .msg-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--navy, #1f2a44);
          margin: 0 0 4px 0;
        }
        .msg-empty p { font-size: 13px; margin: 0; color: #94a3b8; }

        .msg-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 20px;
          color: var(--text-muted, #718096);
          gap: 10px;
          background: #fff;
          font-size: 14px;
        }
        .msg-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(31,42,68,0.10);
          border-top-color: var(--gold, #c8a75e);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-banner {
          background: #fff5f5;
          border: 1px solid rgba(192,57,43,0.15);
          color: #c0392b;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        /* ════════════════════════════════════════════════
           RESPONSIVE RE-MAPPING
        ════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .msg-row-main {
            grid-template-columns: 40px 120px 1fr 100px;
          }
          .msg-time { display: none; }
          .msg-header-container { flex-direction: column; align-items: flex-start; gap: 16px; }
          .msg-header-right-meta { width: 100%; justify-content: flex-start; }
          .msg-expand { padding: 16px 20px; }
        }
        @media (max-width: 580px) {
          .msg-row-main {
            grid-template-columns: 1fr auto;
            row-gap: 8px;
          }
          .status-pill { grid-column: 1; }
          .msg-sender { grid-column: 1; }
          .msg-subject-wrap { grid-column: 1 / -1; }
          .msg-row-actions { grid-column: 2; grid-row: 1 / 3; }
        }
      `}</style>

      {/* ── Page Header (Visual Timeline Aesthetic Container Matching) ───────── */}
      <div className="msg-header-container">
        <div className="msg-header-left-flex">
          <div className="msg-header-icon-box">
            <Inbox size={22} strokeWidth={2} />
          </div>
          <div className="msg-header-titles-wrap">
            <h1>Messages</h1>
            <p className="msg-header-sub">Contact form submissions from your website visitors</p>
          </div>
        </div>
        
        {/* Compact Premium Summary Metrics */}
        <div className="msg-header-right-meta">
          <div className="msg-quick-stat">
            Total: <strong>{total}</strong>
          </div>
          <div className="msg-quick-stat">
            Unread: <strong style={{ color: 'var(--gold-dark)' }}>{unread}</strong>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="error-banner">
          Error loading messages: {loadError}
        </div>
      )}

      {/* ── Main Panel Wrapper ────────────────────────────────────────────────── */}
      <div className="msg-main-panel">
        
        {/* ── Unified Filter Toolbar ── */}
        <div className="msg-toolbar">
          <div className="msg-search-wrap">
            <Search className="msg-search-icon" size={15} strokeWidth={2} />
            <input
              className="msg-search"
              placeholder="Search by name, email or subject…"
              value={query}
              onChange={function (e) { setQuery(e.target.value) }}
            />
          </div>

          <div className="msg-tabs">
            {TABS.map(function (t) {
              var count = t.key === 'unread' ? unread : t.key === 'read' ? read : total
              return (
                <button
                  key={t.key}
                  className={'msg-tab' + (tab === t.key ? ' active' : '')}
                  onClick={function () { setTab(t.key) }}
                >
                  <t.Icon size={13} strokeWidth={2} />
                  {t.label}
                  {t.key === 'unread' && unread > 0 && (
                    <span className="msg-tab-count">{unread}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Table / List Presentation ── */}
        {loading ? (
          <div className="msg-loading">
            <div className="msg-spinner" />
            <p>Loading messages…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="msg-empty">
            <p className="msg-empty-title">{query ? 'No results found' : 'No messages yet'}</p>
            <p>{query ? 'No messages match your search criteria.' : 'Contact form submissions will appear here.'}</p>
          </div>
        ) : (
          <div className="msg-list">
            {filtered.map(function (msg) {
              var isExpanded = expanded === msg.id
              var isNew      = newIds.has(msg.id)
              var rowClass   = 'msg-row'
                + (isExpanded ? ' expanded' : '')
                + (isNew      ? ' new-flash' : '')

              return (
                <div key={msg.id} className={rowClass}>
                  
                  {/* ── Message Tabular Structure Row ── */}
                  <div className="msg-row-main" onClick={function () { handleRowClick(msg) }}>
                    
                    {/* Status Pillar Column */}
                    <div>
                      {msg.is_read === false ? (
                        <span className="status-pill unread">
                          <span className="status-dot-indicator" /> New
                        </span>
                      ) : (
                        <span className="status-pill read">
                          Read
                        </span>
                      )}
                    </div>

                    {/* Sender Column */}
                    <div className={'msg-sender' + (msg.is_read === false ? ' bold' : '')}>
                      {msg.name || '(no name)'}
                    </div>

                    {/* Subject Wrap Column */}
                    <div className="msg-subject-wrap">
                      <span className="msg-subject">
                        {msg.subject
                          ? (msg.subject.length > 70 ? msg.subject.slice(0, 70) + '…' : msg.subject)
                          : '(no subject)'}
                      </span>
                      <span className="msg-email">{msg.email}</span>
                    </div>

                    {/* Relative Time Column */}
                    <div className="msg-time">
                      {relativeTime(msg.created_at)}
                    </div>

                    {/* Compact Interactive Action Suite Column */}
                    <div className="msg-row-actions" onClick={function (e) { e.stopPropagation() }}>
                      <button
                        className="msg-action-btn"
                        title={msg.is_read ? 'Mark unread' : 'Mark read'}
                        onClick={function (e) { toggleRead(e, msg) }}
                      >
                        {msg.is_read ? <MailOpen size={13} /> : <CheckCheck size={13} />}
                      </button>
                      <button
                        className="msg-delete-btn"
                        title="Delete"
                        onClick={function (e) {
                          e.stopPropagation()
                          setDeleteTarget(msg)
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* ── Elegant Expanded Details Workspace ── */}
                  {isExpanded && (
                    <div className="msg-expand">
                      <div className="msg-expand-meta">
                        <div className="msg-meta-item">
                          <strong>From:</strong>
                          <span>{msg.name}</span>
                        </div>
                        <div className="msg-meta-item">
                          <strong>Email:</strong>
                          <a href={'mailto:' + msg.email}>{msg.email}</a>
                        </div>
                        {msg.subject && (
                          <div className="msg-meta-item">
                            <strong>Subject:</strong>
                            <span>{msg.subject}</span>
                          </div>
                        )}
                        <div className="msg-meta-item">
                          <strong>Received:</strong>
                          <span style={{ color: '#64748b' }}>
                            {new Date(msg.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>

                      <div className="msg-expand-body">{msg.message}</div>

                      <div className="msg-expand-actions">
                        <a
                          href={'mailto:' + msg.email + '?subject=Re: ' + (msg.subject || '')}
                          className="btn-reply"
                        >
                          <Reply size={13} />
                          Reply via Email
                        </a>
                        <button
                          className="btn-text-action"
                          onClick={function (e) { toggleRead(e, msg) }}
                        >
                          {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          className="btn-text-action"
                          style={{ color: '#c0392b', borderColor: 'rgba(192,57,43,0.15)' }}
                          onClick={function () { setDeleteTarget(msg) }}
                        >
                          Delete Message
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Overlay Portal ────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirm
          itemName={'message from ' + deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={function () { setDeleteTarget(null) }}
          loading={deleting}
        />
      )}
    </div>
  )
}