'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// ─── Icons (preserved inline for portability) ────────────────────────────────

function IcoEvent() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IcoBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function IcoUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IcoMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function IcoPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IcoChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function IcoActivity() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function actionLabel(a) {
  if (!a) return 'Action';
  const l = a.toLowerCase();
  if (l === 'insert' || l === 'create' || l === 'created') return 'Added';
  if (l === 'update' || l === 'updated') return 'Updated';
  if (l === 'delete' || l === 'deleted') return 'Deleted';
  return a.charAt(0).toUpperCase() + a.slice(1);
}

function actionDot(a) {
  if (!a) return 'var(--text-muted)';
  const l = a.toLowerCase();
  if (l === 'insert' || l === 'create' || l === 'created') return '#4caf86';
  if (l === 'update' || l === 'updated') return 'var(--gold)';
  if (l === 'delete' || l === 'deleted') return '#e06060';
  return 'var(--text-muted)';
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}

function truncateEmail(e) {
  if (!e) return '—';
  if (e.length <= 28) return e;
  return e.slice(0, 24) + '…';
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, count, href, index }) {
  return (
    <Link href={href} className="sc-wrap" style={{ '--i': index }}>
      <div className="sc">
        <div className="sc-top">
          <span className="sc-icon">{icon}</span>
          <span className="sc-arrow"><IcoChevron /></span>
        </div>
        <div className="sc-count">{count === null ? <span className="sc-loading">—</span> : count}</div>
        <div className="sc-label">{label}</div>
        <div className="sc-line" />
      </div>
    </Link>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

function QA({ icon, label, href, badge, index }) {
  return (
    <Link href={href} className="qa" style={{ '--i': index }}>
      <span className="qa-icon">{icon}</span>
      <span className="qa-label">{label}</span>
      {badge > 0 && <span className="qa-badge">{badge}</span>}
      <span className="qa-arrow"><IcoChevron /></span>
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({ events: null, research: null, team: null, messages: null });
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchStats = useCallback(async function() {
    const [ev, re, tm, ms] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('research').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    ]);
    setStats({ events: ev.count ?? 0, research: re.count ?? 0, team: tm.count ?? 0, messages: ms.count ?? 0 });
  }, [supabase]);

  const fetchLogs = useCallback(async function() {
    setLoadingLogs(true);
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setLogs(data ?? []);
    setLoadingLogs(false);
  }, [supabase]);

  useEffect(function() {
    fetchStats();
    fetchLogs();
    const tables = ['events', 'research', 'team_members', 'messages', 'activity_logs'];
    const channels = tables.map(function(t) {
      return supabase
        .channel('db-' + t)
        .on('postgres_changes', { event: '*', schema: 'public', table: t }, function() {
          fetchStats();
          if (t === 'activity_logs') fetchLogs();
        })
        .subscribe();
    });
    return function() { channels.forEach(function(c) { supabase.removeChannel(c); }); };
  }, [fetchStats, fetchLogs, supabase]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <style>{`
        /* ── Base ───────────────────────────────────────────────── */
        .dash {
          padding: 36px 40px;
          min-height: 100vh;
          background: var(--beige-warm, #faf6ef);
          font-family: 'Geist', 'DM Sans', system-ui, sans-serif;
        }

        /* ── Page Header ───────────────────────────────────────── */
        .dash-hd {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeUp 0.4s 0.05s forwards;
        }
        .dash-hd-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold, #c8a75e);
          margin-bottom: 8px;
        }
        .dash-hd-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--gold, #c8a75e);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.65); }
        }
        .dash-hd-title {
          font-size: 2rem;
          font-weight: 300;
          color: var(--navy, #1f2a44);
          margin: 0;
          letter-spacing: -0.025em;
          line-height: 1.1;
        }
        .dash-hd-title strong { font-weight: 800; }
        .dash-hd-right { text-align: right; }
        .dash-hd-date {
          font-size: 0.72rem;
          color: var(--text-muted, #6b7a96);
          letter-spacing: 0.04em;
        }
        .dash-hd-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4caf86;
          margin-top: 6px;
        }
        .dash-hd-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4caf86;
          animation: pulse 1.5s ease-in-out infinite;
        }

        /* ── Divider ───────────────────────────────────────────── */
        .dash-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(31,42,68,0.12) 0%, transparent 80%);
          margin-bottom: 32px;
        }

        /* ── Section Header ────────────────────────────────────── */
        .dash-sec {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .dash-sec-label {
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted, #6b7a96);
          white-space: nowrap;
        }
        .dash-sec-line {
          flex: 1;
          height: 1px;
          background: rgba(31,42,68,0.08);
        }

        /* ── Stat Cards ─────────────────────────────────────────── */
        .sc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        @media(max-width:900px) { .sc-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:520px) { .sc-grid { grid-template-columns: 1fr; } }

        .sc-wrap {
          text-decoration: none;
          display: block;
          opacity: 0;
          animation: fadeUp 0.4s forwards;
          animation-delay: calc(0.1s + var(--i,0) * 0.06s);
        }
        .sc {
          background: #fff;
          border: 1px solid rgba(31,42,68,0.08);
          border-radius: var(--radius-lg, 20px);
          padding: 24px 24px 20px;
          height: 100%;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94),
                      box-shadow 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
          box-shadow: 0 4px 24px rgba(15,23,42,0.06);
        }
        .sc-wrap:hover .sc {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(15,23,42,0.1);
        }
        .sc::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--gold), var(--gold-light));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .sc-wrap:hover .sc::after { transform: scaleX(1); }

        .sc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .sc-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm, 6px);
          background: rgba(200,167,94,0.1);
          border: 1px solid rgba(200,167,94,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold, #c8a75e);
          transition: background 0.25s, border-color 0.25s;
        }
        .sc-wrap:hover .sc-icon {
          background: rgba(200,167,94,0.18);
          border-color: rgba(200,167,94,0.3);
        }
        .sc-arrow {
          color: var(--text-muted, #6b7a96);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .sc-wrap:hover .sc-arrow { opacity: 1; transform: translateX(0); }

        .sc-count {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--navy, #1f2a44);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .sc-loading { color: var(--text-muted); font-size: 1.5rem; }
        .sc-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted, #6b7a96);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .sc-line { display: none; }

        /* ── Lower Grid ─────────────────────────────────────────── */
        .dash-lower {
          display: grid;
          grid-template-columns: 1fr 288px;
          gap: 20px;
          align-items: start;
        }
        @media(max-width:900px) { .dash-lower { grid-template-columns: 1fr; } }

        /* ── Activity Log ───────────────────────────────────────── */
        .al {
          background: #fff;
          border: 1px solid rgba(31,42,68,0.08);
          border-radius: var(--radius-lg, 20px);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(15,23,42,0.06);
          opacity: 0;
          animation: fadeUp 0.4s 0.4s forwards;
        }
        .al-hd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(31,42,68,0.06);
        }
        .al-hd-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .al-hd-icon {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm, 6px);
          background: rgba(200,167,94,0.1);
          border: 1px solid rgba(200,167,94,0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold, #c8a75e);
          flex-shrink: 0;
        }
        .al-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--navy, #1f2a44);
          letter-spacing: 0.01em;
        }
        .al-pill {
          font-size: 0.62rem;
          font-weight: 600;
          color: var(--text-muted, #6b7a96);
          background: rgba(31,42,68,0.05);
          border: 1px solid rgba(31,42,68,0.08);
          border-radius: 20px;
          padding: 3px 10px;
          letter-spacing: 0.04em;
        }

        /* Table */
        .al-table { width: 100%; border-collapse: collapse; }
        .al-table thead th {
          padding: 10px 20px;
          text-align: left;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted, #6b7a96);
          background: rgba(31,42,68,0.02);
          border-bottom: 1px solid rgba(31,42,68,0.06);
        }
        .al-table tbody tr {
          border-bottom: 1px solid rgba(31,42,68,0.04);
          transition: background 0.15s;
        }
        .al-table tbody tr:last-child { border-bottom: none; }
        .al-table tbody tr:hover { background: rgba(200,167,94,0.03); }
        .al-table td {
          padding: 14px 20px;
          vertical-align: middle;
        }

        /* Activity cell */
        .al-activity { display: flex; align-items: center; gap: 10px; }
        .al-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .al-action {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--navy, #1f2a44);
        }
        .al-table-name {
          font-size: 0.7rem;
          color: var(--text-muted, #6b7a96);
          margin-top: 2px;
        }
        .al-email {
          font-size: 0.74rem;
          color: var(--text-muted, #6b7a96);
          font-variant-numeric: tabular-nums;
        }
        .al-date {
          font-size: 0.7rem;
          color: var(--text-muted, #6b7a96);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        /* Status chips */
        .al-chip {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .al-chip-added   { background: rgba(76,175,134,0.1);  color: #3a9e73; border: 1px solid rgba(76,175,134,0.18); }
        .al-chip-updated { background: rgba(200,167,94,0.1);  color: var(--gold-dark,#a07c3a); border: 1px solid rgba(200,167,94,0.2); }
        .al-chip-deleted { background: rgba(224,96,96,0.08);  color: #c84444; border: 1px solid rgba(224,96,96,0.14); }
        .al-chip-default { background: rgba(107,122,150,0.08); color: var(--text-muted,#6b7a96); border: 1px solid rgba(107,122,150,0.12); }

        .al-empty {
          padding: 48px 24px;
          text-align: center;
          color: var(--text-muted, #6b7a96);
          font-size: 0.82rem;
        }

        /* ── Quick Actions ──────────────────────────────────────── */
        .qa-card {
          background: #fff;
          border: 1px solid rgba(31,42,68,0.08);
          border-radius: var(--radius-lg, 20px);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(15,23,42,0.06);
          opacity: 0;
          animation: fadeUp 0.4s 0.48s forwards;
        }
        .qa-card-hd {
          display: flex;
          align-items: center;
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(31,42,68,0.06);
        }
        .qa-card-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--navy, #1f2a44);
          letter-spacing: 0.01em;
        }

        .qa {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 20px;
          text-decoration: none;
          border-bottom: 1px solid rgba(31,42,68,0.04);
          transition: background 0.15s;
          position: relative;
          opacity: 0;
          animation: fadeUp 0.35s forwards;
          animation-delay: calc(0.52s + var(--i, 0) * 0.045s);
        }
        .qa:last-child { border-bottom: none; }
        .qa:hover { background: rgba(200,167,94,0.04); }
        .qa:hover .qa-arrow { opacity: 1; transform: translateX(0); }

        .qa-icon {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm, 6px);
          background: rgba(31,42,68,0.04);
          border: 1px solid rgba(31,42,68,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--navy, #1f2a44);
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .qa:hover .qa-icon {
          background: rgba(200,167,94,0.1);
          border-color: rgba(200,167,94,0.2);
          color: var(--gold, #c8a75e);
        }
        .qa-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--navy, #1f2a44);
          flex: 1;
          letter-spacing: 0.01em;
        }
        .qa-badge {
          font-size: 0.6rem;
          font-weight: 800;
          background: #e06060;
          color: #fff;
          border-radius: 10px;
          padding: 2px 7px;
          min-width: 18px;
          text-align: center;
          letter-spacing: 0.02em;
        }
        .qa-arrow {
          color: var(--text-muted, #6b7a96);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
          flex-shrink: 0;
        }

        /* ── Animations ─────────────────────────────────────────── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ─────────────────────────────────────────── */
        @media(max-width:768px) {
          .dash { padding: 24px 20px; }
          .dash-hd { flex-direction: column; align-items: flex-start; gap: 12px; }
          .dash-hd-right { text-align: left; }
        }
      `}</style>

      <div className="dash">

        {/* ── Header ── */}
        <div className="dash-hd">
          <div className="dash-hd-left">
            <div className="dash-hd-tag">
              <span className="dash-hd-tag-dot" />
              YouthVerse Union
            </div>
            <h1 className="dash-hd-title">
              {greeting}, <strong>Admin</strong>
            </h1>
          </div>
          <div className="dash-hd-right">
            <div className="dash-hd-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="dash-hd-live">
              <span className="dash-hd-live-dot" />
              Live data
            </div>
          </div>
        </div>

        <div className="dash-divider" />

        {/* ── Stat Cards ── */}
        <div className="dash-sec">
          <span className="dash-sec-label">Platform Overview</span>
          <span className="dash-sec-line" />
        </div>

        <div className="sc-grid">
          <StatCard icon={<IcoEvent />}  label="Published Events"  count={stats.events}   href="/admin/events"   index={0} />
          <StatCard icon={<IcoBook />}   label="Research Papers"   count={stats.research} href="/admin/research" index={1} />
          <StatCard icon={<IcoUsers />}  label="Active Members"    count={stats.team}     href="/admin/team"     index={2} />
          <StatCard icon={<IcoMail />}   label="Unread Messages"   count={stats.messages} href="/admin/messages" index={3} />
        </div>

        {/* ── Lower ── */}
        <div className="dash-lower">

          {/* Activity Log */}
          <div>
            <div className="dash-sec">
              <span className="dash-sec-label">Recent Activity</span>
              <span className="dash-sec-line" />
            </div>
            <div className="al">
              <div className="al-hd">
                <div className="al-hd-left">
                  <span className="al-hd-icon"><IcoActivity /></span>
                  <span className="al-title">Activity Log</span>
                </div>
                <span className="al-pill">Last 20 actions</span>
              </div>

              {loadingLogs ? (
                <div className="al-empty">Loading…</div>
              ) : logs.length === 0 ? (
                <div className="al-empty">No activity recorded yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="al-table">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(function(row) {
                        const label = actionLabel(row.action);
                        const chipClass =
                          label === 'Added'   ? 'al-chip al-chip-added'   :
                          label === 'Updated' ? 'al-chip al-chip-updated' :
                          label === 'Deleted' ? 'al-chip al-chip-deleted' :
                          'al-chip al-chip-default';
                        return (
                          <tr key={row.id}>
                            <td>
                              <div className="al-activity">
                                <span className="al-dot" style={{ background: actionDot(row.action) }} />
                                <div>
                                  <div className="al-action">{label}{row.table_name ? ' · ' + capitalize(row.table_name) : ''}</div>
                                  {row.record_id && <div className="al-table-name">ID {String(row.record_id).slice(0, 8)}</div>}
                                </div>
                              </div>
                            </td>
                            <td><div className="al-email">{truncateEmail(row.admin_email)}</div></td>
                            <td><div className="al-date">{formatDate(row.created_at)}</div></td>
                            <td><span className={chipClass}>{label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="dash-sec">
              <span className="dash-sec-label">Quick Actions</span>
              <span className="dash-sec-line" />
            </div>
            <div className="qa-card">
              <div className="qa-card-hd">
                <span className="qa-card-title">Jump To</span>
              </div>
              <QA icon={<IcoPlus />}     label="Add New Event"       href="/admin/events?action=new"   index={0} />
              <QA icon={<IcoUsers />}    label="View All Members"    href="/admin/team"                index={1} />
              <QA icon={<IcoMail />}     label="Check Messages"      href="/admin/messages"            badge={stats.messages} index={2} />
              <QA icon={<IcoBook />}     label="Add Research"        href="/admin/research?action=new" index={3} />
              <QA icon={<IcoEvent />}    label="Review Applications" href="/admin/roles"               index={4} />
              <QA icon={<IcoActivity />} label="Site Settings"       href="/admin/settings"            index={5} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}