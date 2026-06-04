'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// ─── helpers ────────────────────────────────────────────────────────────────

function getMonthLabel(date) {
  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
}

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: getMonthLabel(d),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CATEGORY_COLORS = [
  '#c8a75e',
  '#e2c07a',
  '#a07c3a',
  '#2e4266',
  '#6b7a96',
  '#26354f',
  '#1f2a44',
  '#d5c9b0',
];

const ACTION_LABELS = {
  INSERT: 'Items Added',
  UPDATE: 'Items Updated',
  DELETE: 'Items Deleted',
};

// ─── sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card" style={{ borderTop: '3px solid ' + (accent || 'var(--gold)') }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value === null ? '…' : value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
    </div>
  );
}

function BarChart({ months, counts }) {
  const max = Math.max(...counts, 1);
  return (
    <div className="bar-chart-wrap">
      <div className="bar-chart-bars">
        {months.map(function (m, i) {
          const pct = Math.round((counts[i] / max) * 100);
          return (
            <div key={m.label} className="bar-col">
              <div className="bar-count">{counts[i]}</div>
              <div className="bar-outer">
                <div
                  className="bar-inner"
                  style={{ height: pct + '%' }}
                  title={counts[i] + ' messages'}
                />
              </div>
              <div className="bar-label">{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryRow({ name, count, total, colorIndex }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
  return (
    <div className="cat-row">
      <div className="cat-name" style={{ color: color }}>{name || 'Uncategorized'}</div>
      <div className="cat-bar-wrap">
        <div className="cat-bar-track">
          <div className="cat-bar-fill" style={{ width: pct + '%', background: color }} />
        </div>
        <span className="cat-count">{count}</span>
        <span className="cat-pct">{pct}%</span>
      </div>
    </div>
  );
}

function ContentTable({ rows }) {
  return (
    <div className="content-table-wrap">
      <table className="content-table">
        <thead>
          <tr>
            <th>Content Type</th>
            <th>Total</th>
            <th>Published / Active</th>
            <th>Draft / Inactive</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(function (r) {
            return (
              <tr key={r.type}>
                <td className="ct-type">{r.type}</td>
                <td className="ct-num">{r.total}</td>
                <td className="ct-num ct-pub">{r.published}</td>
                <td className="ct-num ct-draft">{r.draft}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MessageRow({ msg, onClick }) {
  const isUnread = !msg.read_at;
  return (
    <button className="msg-row" onClick={onClick} type="button">
      <div className="msg-sender">{msg.name || 'Unknown'}</div>
      <div className="msg-subject">{msg.subject || '(no subject)'}</div>
      <div className="msg-meta">
        <span className="msg-date">{formatDate(msg.created_at)}</span>
        <span className={isUnread ? 'badge badge-unread' : 'badge badge-read'}>
          {isUnread ? 'Unread' : 'Read'}
        </span>
      </div>
    </button>
  );
}

function ActivityStatCard({ label, value, color }) {
  return (
    <div className="act-stat-card" style={{ borderLeft: '3px solid ' + color }}>
      <div className="act-stat-value" style={{ color: color }}>{value}</div>
      <div className="act-stat-label">{label}</div>
    </div>
  );
}

function LogRow({ entry }) {
  const actionColor = {
    INSERT: '#c8a75e',
    UPDATE: '#e2c07a',
    DELETE: '#e87070',
  };
  const action = (entry.action || '').toUpperCase();
  return (
    <div className="log-row">
      <span
        className="log-action"
        style={{ color: actionColor[action] || 'var(--text-muted)' }}
      >
        {action}
      </span>
      <span className="log-table">{entry.table_name || '—'}</span>
      <span className="log-user">{entry.performed_by || 'system'}</span>
      <span className="log-date">{formatDate(entry.created_at)}</span>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    eventsPublished: null,
    researchPublished: null,
    messagesTotal: null,
    activeTeam: null,
  });
  const [msgMonths, setMsgMonths] = useState(getLast6Months());
  const [msgCounts, setMsgCounts] = useState([0, 0, 0, 0, 0, 0]);
  const [eventCategories, setEventCategories] = useState([]);
  const [contentSummary, setContentSummary] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [activityCounts, setActivityCounts] = useState({ INSERT: 0, UPDATE: 0, DELETE: 0 });
  const [recentLogs, setRecentLogs] = useState([]);

  const fetchAll = useCallback(async function () {
    setLoading(true);
    try {
      const [
        eventsRes,
        researchRes,
        messagesRes,
        teamRes,
        allEventsRes,
        allResearchRes,
        allTeamRes,
        rolesRes,
        recentMsgRes,
        logsRes,
      ] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('research').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('messages').select('id, created_at', { count: 'exact' }),
        supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('events').select('category, status'),
        supabase.from('research').select('status'),
        supabase.from('team_members').select('is_active'),
        supabase.from('roles').select('status'),
        supabase.from('messages').select('id, name, subject, created_at, read_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('activity_logs').select('id, action, table_name, performed_by, created_at').order('created_at', { ascending: false }).limit(50),
      ]);

      // ── Section 1: Key metrics
      setMetrics({
        eventsPublished: eventsRes.count ?? 0,
        researchPublished: researchRes.count ?? 0,
        messagesTotal: messagesRes.count ?? 0,
        activeTeam: teamRes.count ?? 0,
      });

      // ── Section 2: Messages by month
      const months = getLast6Months();
      const counts = months.map(function (m) {
        return (messagesRes.data || []).filter(function (msg) {
          const d = new Date(msg.created_at);
          return d.getFullYear() === m.year && d.getMonth() === m.month;
        }).length;
      });
      setMsgMonths(months);
      setMsgCounts(counts);

      // ── Section 3: Events by category
      const catMap = {};
      (allEventsRes.data || []).forEach(function (ev) {
        const key = ev.category || 'Uncategorized';
        catMap[key] = (catMap[key] || 0) + 1;
      });
      const catArr = Object.entries(catMap)
        .map(function (entry) { return { name: entry[0], count: entry[1] }; })
        .sort(function (a, b) { return b.count - a.count; });
      setEventCategories(catArr);

      // ── Section 4: Content summary
      const evTotal = (allEventsRes.data || []).length;
      const evPub = (allEventsRes.data || []).filter(function (e) { return e.status === 'published'; }).length;

      const reTotal = (allResearchRes.data || []).length;
      const rePub = (allResearchRes.data || []).filter(function (e) { return e.status === 'published'; }).length;

      const tmTotal = (allTeamRes.data || []).length;
      const tmActive = (allTeamRes.data || []).filter(function (e) { return e.is_active; }).length;

      const roTotal = (rolesRes.data || []).length;
      const roActive = (rolesRes.data || []).filter(function (e) { return e.status === 'active'; }).length;

      setContentSummary([
        { type: 'Events', total: evTotal, published: evPub, draft: evTotal - evPub },
        { type: 'Research Papers', total: reTotal, published: rePub, draft: reTotal - rePub },
        { type: 'Team Members', total: tmTotal, published: tmActive, draft: tmTotal - tmActive },
        { type: 'Roles / Positions', total: roTotal, published: roActive, draft: roTotal - roActive },
      ]);

      // ── Section 5: Recent messages
      setRecentMessages(recentMsgRes.data || []);

      // ── Section 6: Activity log
      const actionCounts = { INSERT: 0, UPDATE: 0, DELETE: 0 };
      const allLogs = logsRes.data || [];
      allLogs.forEach(function (log) {
        const act = (log.action || '').toUpperCase();
        if (actionCounts[act] !== undefined) {
          actionCounts[act]++;
        }
      });
      setActivityCounts(actionCounts);
      setRecentLogs(allLogs.slice(0, 5));
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(function () {
    fetchAll();
  }, [fetchAll]);

  const eventsTotal = eventCategories.reduce(function (s, c) { return s + c.count; }, 0);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-pulse">Loading analytics…</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── layout ── */
        .analytics-page {
          padding: 2rem 2.5rem;
          max-width: 1280px;
        }
        .page-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gold);
          margin: 0 0 0.25rem;
          letter-spacing: -0.01em;
        }
        .page-sub {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin: 0 0 2.25rem;
        }
        .analytics-loading {
          padding: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-pulse {
          color: var(--text-muted);
          font-size: 1rem;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

        /* ── section ── */
        .analytics-section {
          margin-bottom: 2.5rem;
        }
        .section-header {
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(200,167,94,0.18);
          padding-bottom: 0.5rem;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }

        /* ── stat cards ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        .stat-card {
          background: var(--navy-mid);
          border-radius: var(--radius-md);
          padding: 1.4rem 1.5rem 1.2rem;
          position: relative;
          box-shadow: 0 2px 12px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--beige);
          line-height: 1;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── two col ── */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .panel {
          background: var(--navy-mid);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .panel-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gold-light);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin: 0 0 1.25rem;
        }

        /* ── bar chart ── */
        .bar-chart-wrap {
          height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .bar-chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 100%;
          padding-top: 1.5rem;
        }
        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        .bar-count {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 3px;
          min-height: 1rem;
        }
        .bar-outer {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          background: rgba(255,255,255,0.04);
          border-radius: 4px 4px 0 0;
        }
        .bar-inner {
          width: 100%;
          background: linear-gradient(to top, var(--gold-dark), var(--gold-light));
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          transition: var(--transition);
        }
        .bar-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 6px;
          white-space: nowrap;
        }

        /* ── category rows ── */
        .cat-row {
          margin-bottom: 0.9rem;
        }
        .cat-name {
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 4px;
          text-transform: capitalize;
        }
        .cat-bar-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cat-bar-track {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
        }
        .cat-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .cat-count {
          font-size: 0.75rem;
          color: var(--beige);
          min-width: 1.5rem;
          text-align: right;
        }
        .cat-pct {
          font-size: 0.7rem;
          color: var(--text-muted);
          min-width: 2.5rem;
          text-align: right;
        }

        /* ── content table ── */
        .content-table-wrap {
          overflow-x: auto;
        }
        .content-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .content-table th {
          text-align: left;
          padding: 0.6rem 1rem;
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          font-weight: 500;
        }
        .content-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .ct-type {
          color: var(--beige);
          font-weight: 500;
        }
        .ct-num {
          color: var(--beige-dark);
          font-variant-numeric: tabular-nums;
          font-size: 0.95rem;
        }
        .ct-pub { color: #7ecb9c; }
        .ct-draft { color: var(--text-muted); }
        .content-table tr:last-child td { border-bottom: none; }

        /* ── messages ── */
        .msg-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .msg-row {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-sm);
          padding: 0.7rem 1rem;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: var(--transition);
          color: inherit;
        }
        .msg-row:hover {
          background: rgba(200,167,94,0.07);
          border-color: rgba(200,167,94,0.2);
        }
        .msg-sender {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--beige);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .msg-subject {
          font-size: 0.82rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .msg-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .msg-date {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .badge {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-unread {
          background: rgba(200,167,94,0.18);
          color: var(--gold-light);
        }
        .badge-read {
          background: rgba(107,122,150,0.18);
          color: var(--text-muted);
        }

        /* ── activity ── */
        .act-stat-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .act-stat-card {
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-sm);
          padding: 1rem 1.25rem;
        }
        .act-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1;
        }
        .act-stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 4px;
        }
        .log-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .log-row {
          display: grid;
          grid-template-columns: 70px 1fr 1fr auto;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.025);
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
        }
        .log-action {
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 0.06em;
        }
        .log-table {
          color: var(--beige-dark);
        }
        .log-user {
          color: var(--text-muted);
          font-size: 0.72rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .log-date {
          color: var(--text-muted);
          white-space: nowrap;
          font-size: 0.72rem;
        }
        .log-empty {
          color: var(--text-muted);
          font-size: 0.82rem;
          padding: 0.5rem 0;
        }

        /* ── responsive ── */
        @media (max-width: 1100px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr; }
          .analytics-page { padding: 1.25rem 1rem; }
        }
        @media (max-width: 600px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .msg-row { grid-template-columns: 1fr auto; }
          .msg-subject { display: none; }
          .log-row { grid-template-columns: 60px 1fr auto; }
          .log-user { display: none; }
          .act-stat-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="analytics-page">
        <h1 className="page-heading">Analytics</h1>
        <p className="page-sub">Platform overview — drawn live from your Supabase tables</p>

        {/* ── Section 1: Key Metrics ── */}
        <div className="analytics-section">
          <SectionHeader title="Key Metrics" />
          <div className="stat-grid">
            <StatCard
              label="Events Published"
              value={metrics.eventsPublished}
              icon="📅"
              accent="var(--gold)"
            />
            <StatCard
              label="Research Published"
              value={metrics.researchPublished}
              icon="📄"
              accent="#7ecb9c"
            />
            <StatCard
              label="Messages Received"
              value={metrics.messagesTotal}
              icon="✉️"
              accent="var(--gold-light)"
            />
            <StatCard
              label="Active Team Members"
              value={metrics.activeTeam}
              icon="👥"
              accent="#a07c3a"
            />
          </div>
        </div>

        {/* ── Section 2 + 3: Charts row ── */}
        <div className="analytics-section">
          <SectionHeader title="Trends & Distribution" />
          <div className="two-col">
            <div className="panel">
              <div className="panel-title">Messages per Month</div>
              <BarChart months={msgMonths} counts={msgCounts} />
            </div>
            <div className="panel">
              <div className="panel-title">Events by Category</div>
              {eventCategories.length === 0 ? (
                <div className="log-empty">No event data yet.</div>
              ) : (
                eventCategories.map(function (cat, i) {
                  return (
                    <CategoryRow
                      key={cat.name}
                      name={cat.name}
                      count={cat.count}
                      total={eventsTotal}
                      colorIndex={i}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Section 4: Content Summary ── */}
        <div className="analytics-section">
          <SectionHeader title="Content Summary" />
          <div className="panel">
            <ContentTable rows={contentSummary} />
          </div>
        </div>

        {/* ── Section 5 + 6: Messages + Activity ── */}
        <div className="analytics-section">
          <SectionHeader title="Recent Activity" />
          <div className="two-col">
            <div className="panel">
              <div className="panel-title">Recent Messages</div>
              {recentMessages.length === 0 ? (
                <div className="log-empty">No messages yet.</div>
              ) : (
                <div className="msg-list">
                  {recentMessages.map(function (msg) {
                    return (
                      <MessageRow
                        key={msg.id}
                        msg={msg}
                        onClick={function () { router.push('/admin/messages'); }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-title">Activity Log</div>
              <div className="act-stat-row">
                <ActivityStatCard label="Items Added" value={activityCounts.INSERT} color="var(--gold)" />
                <ActivityStatCard label="Items Updated" value={activityCounts.UPDATE} color="#e2c07a" />
                <ActivityStatCard label="Items Deleted" value={activityCounts.DELETE} color="#e87070" />
              </div>
              {recentLogs.length === 0 ? (
                <div className="log-empty">No activity logged yet.</div>
              ) : (
                <div className="log-list">
                  {recentLogs.map(function (entry) {
                    return <LogRow key={entry.id} entry={entry} />;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}