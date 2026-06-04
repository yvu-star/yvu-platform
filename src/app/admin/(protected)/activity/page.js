'use client';

import { useState } from 'react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import { getActivityLogs, pruneOldLogs } from '@/lib/services/activity.service';
import StatusBadge from '@/components/admin/StatusBadge';

const ACTION_ICONS = {
  create: '✦',
  update: '✎',
  delete: '✕',
  login:  '⇢',
  upload: '↑',
};

const ACTION_COLORS = {
  create: '#22c55e',
  update: '#6366f1',
  delete: '#ef4444',
  login:  '#c8a75e',
  upload: '#0ea5e9',
};

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ActivityPage() {
  const { data: logs, loading, error, refetch } = useRealtimeTable(
    () => getActivityLogs(100),
    'activity_logs'
  );

  const [pruning, setPruning] = useState(false);
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  const entities = ['all', ...new Set((logs || []).map(l => l.entity))];
  const actions  = ['all', 'create', 'update', 'delete', 'login', 'upload'];

  const filtered = (logs || []).filter(log => {
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchEntity = filterEntity === 'all' || log.entity === filterEntity;
    return matchAction && matchEntity;
  });

  async function handlePrune() {
    if (!confirm('Delete all logs older than 90 days?')) return;
    setPruning(true);
    try {
      await pruneOldLogs();
      refetch();
    } catch (e) {
      alert('Failed to prune: ' + e.message);
    } finally {
      setPruning(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--navy)', fontSize: 24, fontWeight: 700 }}>
            Activity Log
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <button
          onClick={handlePrune}
          disabled={pruning}
          style={{
            background: '#fee2e2', color: '#dc2626', border: 'none',
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
          }}
        >
          {pruning ? 'Pruning…' : '🗑 Prune Old Logs'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
            ACTION
          </label>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' }}
          >
            {actions.map(a => (
              <option key={a} value={a}>{a === 'all' ? 'All Actions' : a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
            SECTION
          </label>
          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' }}
          >
            {entities.map(e => (
              <option key={e} value={e}>{e === 'all' ? 'All Sections' : e.charAt(0).toUpperCase() + e.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log feed */}
      {loading && <p style={{ color: '#64748b' }}>Loading logs…</p>}
      {error   && <p style={{ color: '#ef4444' }}>Error: {error.message}</p>}

      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#f8fafc', borderRadius: 12,
          color: '#94a3b8', fontSize: 15,
        }}>
          No activity logs yet. Actions you take in the admin panel will appear here.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(log => (
          <div
            key={log.id}
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${ACTION_COLORS[log.action] || '#cbd5e1'}`,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `${ACTION_COLORS[log.action]}18`,
              color: ACTION_COLORS[log.action] || '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}>
              {ACTION_ICONS[log.action] || '•'}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
                {log.description || `${log.action} on ${log.entity}`}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {log.admin_email || 'Unknown admin'}
                </span>
                {log.entity_id && (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    ID: {log.entity_id}
                  </span>
                )}
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {formatTime(log.created_at)}
                </span>
              </div>
            </div>

            {/* Action badge */}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 8px',
              borderRadius: 20, flexShrink: 0,
              background: `${ACTION_COLORS[log.action]}18`,
              color: ACTION_COLORS[log.action] || '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {log.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}