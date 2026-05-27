'use client'

import { useSearch } from '@/hooks/useSearch'
import SearchBar from '@/components/admin/SearchBar'
import { useState } from 'react'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '@/lib/services/team.service'
import DataTable from '@/components/admin/DataTable'
import FormModal from '@/components/admin/FormModal'
import DeleteConfirm from '@/components/admin/DeleteConfirm'
import StatusBadge from '@/components/admin/StatusBadge'
import FileUpload from '@/components/admin/FileUpload'
import { useActivityLog } from '@/hooks/useActivityLog'
import { Users, UserPlus, Crown, Globe, Mail, ExternalLink, Share2, AtSign, Link, UserCheck } from 'lucide-react'

const EMPTY_FORM = {
  name:           '',
  role:           '',
  bio:            '',
  image_url:      '',
  email:          '',
  linkedin_url:   '',
  facebook_url:   '',
  instagram_url:  '',
  portfolio_url:  '',
  department:     'general',
  country:        '',
  team_group:     'Founding Leadership Team',
  is_active:      true,
  display_order:  0,
}

const DEPARTMENTS = ['general', 'leadership', 'research', 'communications', 'events', 'technology', 'finance']

const TEAM_GROUPS = ['Founding Leadership Team', 'Global Operations Team']

const GROUP_TAG_STYLE = {
  'Founding Leadership Team': { background: 'rgba(200,167,94,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,167,94,0.3)' },
  'Global Operations Team':   { background: 'rgba(31,42,68,0.12)',   color: 'var(--navy)', border: '1px solid rgba(31,42,68,0.2)'   },
}

export default function TeamPage() {
  const { data, loading, error } = useRealtimeTable(getTeamMembers, 'team_members')
  const { query, setQuery, activeFilters, setFilter, reset, results } = useSearch(data, {
    searchFields: ['name', 'role', 'email', 'department', 'country', 'team_group'],
    filters: { status: '', department: '', team_group: '' },
  })
  const { log } = useActivityLog()

  const [showForm, setShowForm]     = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editing, setEditing]       = useState(null)
  const [deleting, setDeleting]     = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: function(row) {
        return (
          <div className="tm-member-cell">
            {row && row.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={row.image_url}
                alt={row.name}
                className="tm-avatar tm-avatar--photo"
              />
            ) : (
              <div className="tm-avatar tm-avatar--initials">
                {row && row.name ? row.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="tm-member-info">
              <div className="tm-member-name">{row && row.name ? row.name : '—'}</div>
              {row && row.role && <div className="tm-member-role">{row.role}</div>}
              {row && row.country && <div className="tm-member-country">{row.country}</div>}
            </div>
          </div>
        )
      },
    },
    {
      key: 'team_group',
      label: 'Team',
      render: function(row) {
        var group = row && row.team_group ? row.team_group : ''
        var style = GROUP_TAG_STYLE[group] || { background: 'rgba(107,122,150,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(107,122,150,0.2)' }
        var short = group === 'Founding Leadership Team' ? 'Founding' : group === 'Global Operations Team' ? 'Global Ops' : group
        return (
          <span className="tm-group-tag" style={style}>
            {group === 'Founding Leadership Team'
              ? <Crown size={10} strokeWidth={2} />
              : <Globe size={10} strokeWidth={2} />
            }
            {short}
          </span>
        )
      },
    },
    {
      key: 'department',
      label: 'Department',
      render: function(row) {
        return (
          <span className="tm-dept-label">
            {row && row.department ? row.department.charAt(0).toUpperCase() + row.department.slice(1) : '—'}
          </span>
        )
      },
    },
    {
      key: 'email',
      label: 'Contact',
      render: function(row) {
        return (
          <div className="tm-contact-cell">
            {row && row.email ? (
              <a href={'mailto:' + row.email} className="tm-contact-link">
                <Mail size={12} strokeWidth={1.75} />
                {row.email}
              </a>
            ) : (
              <span className="tm-contact-empty">—</span>
            )}
            {row && row.linkedin_url && (
              <a href={row.linkedin_url} target="_blank" rel="noreferrer" className="tm-contact-link tm-contact-link--social">
                <ExternalLink size={12} strokeWidth={1.75} />
                LinkedIn
              </a>
            )}
          </div>
        )
      },
    },
    {
      key: 'display_order',
      label: 'Order',
      render: function(row) {
        return (
          <span className="tm-order-badge">
            {row && row.display_order != null ? row.display_order : '—'}
          </span>
        )
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      render: function(row) {
        return <StatusBadge status={row && row.is_active ? 'active' : 'inactive'} />
      },
    },
  ]

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({
      name:          row.name || '',
      role:          row.role || '',
      bio:           row.bio || '',
      image_url:     row.image_url || '',
      email:         row.email || '',
      linkedin_url:  row.linkedin_url || '',
      facebook_url:  row.facebook_url || '',
      instagram_url: row.instagram_url || '',
      portfolio_url: row.portfolio_url || '',
      department:    row.department || 'general',
      country:       row.country || '',
      team_group:    row.team_group || 'Founding Leadership Team',
      is_active:     row.is_active != null ? row.is_active : true,
      display_order: row.display_order != null ? row.display_order : 0,
    })
    setFormError('')
    setShowForm(true)
  }

  function openDelete(row) {
    setDeleting(row)
    setShowDelete(true)
  }

  async function handleToggleActive(row) {
    try {
      await updateTeamMember(row.id, { is_active: !row.is_active })
      await log({
        action:      'update',
        entity:      'team_members',
        entityId:    row.id,
        description: (row.is_active ? 'Deactivated' : 'Activated') + ' team member: ' + row.name,
      })
    } catch (err) {
      console.error(err)
    }
  }

  function handleChange(e) {
    var name    = e.target.name
    var value   = e.target.value
    var type    = e.target.type
    var checked = e.target.checked
    setForm(function(prev) {
      var next = {}
      var keys = Object.keys(prev)
      for (var i = 0; i < keys.length; i++) {
        next[keys[i]] = prev[keys[i]]
      }
      next[name] = type === 'checkbox' ? checked : value
      return next
    })
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setFormError('Name is required.')
      return
    }
    if (!form.role.trim()) {
      setFormError('Role is required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      var payload = {
        name:          form.name.trim(),
        role:          form.role.trim(),
        bio:           form.bio.trim() || null,
        image_url:     form.image_url.trim() || null,
        email:         form.email.trim() || null,
        linkedin_url:  form.linkedin_url.trim() || null,
        facebook_url:  form.facebook_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        portfolio_url: form.portfolio_url.trim() || null,
        department:    form.department,
        country:       form.country.trim() || null,
        team_group:    form.team_group,
        is_active:     form.is_active,
        display_order: parseInt(form.display_order) || 0,
      }
      if (editing) {
        await updateTeamMember(editing.id, payload)
        await log({
          action:      'update',
          entity:      'team_members',
          entityId:    editing.id,
          description: 'Updated team member: ' + form.name,
        })
      } else {
        var result = await createTeamMember(payload)
        await log({
          action:      'create',
          entity:      'team_members',
          entityId:    result && result.id ? result.id : null,
          description: 'Added team member: ' + form.name,
        })
      }
      setShowForm(false)
    } catch (err) {
      setFormError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteTeamMember(deleting.id)
      await log({
        action:      'delete',
        entity:      'team_members',
        entityId:    deleting.id,
        description: 'Removed team member: ' + deleting.name,
      })
      setShowDelete(false)
      setDeleting(null)
    } catch (err) {
      console.error(err)
    }
  }

  var customActions = [
    {
      label: function(row) { return row && row.is_active ? 'Deactivate' : 'Activate' },
      onClick: handleToggleActive,
    },
  ]

  // Derived stats from live data
  var totalMembers   = data ? data.length : 0
  var activeMembers  = data ? data.filter(function(m) { return m.is_active }).length : 0
  var foundingCount  = data ? data.filter(function(m) { return m.team_group === 'Founding Leadership Team' }).length : 0
  var globalCount    = data ? data.filter(function(m) { return m.team_group === 'Global Operations Team' }).length : 0

  return (
    <div className="admin-content tm-page">
      <style>{`
        /* ═══════════════════════════════════════════
           TEAM PAGE — Premium Executive UI
           Prefix: tm- (team)
        ═══════════════════════════════════════════ */

        .tm-page {
          animation: tm-fade-in 0.3s ease both;
          max-width: 1200px;
        }

        @keyframes tm-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Page Header ── */
        .tm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .tm-header__left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .tm-header__icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--navy);
          color: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tm-header__title {
          font-size: 28px;
          font-weight: 700;
          color: var(--navy);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .tm-header__subtitle {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.875rem;
        }

        .tm-btn-add {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 22px;
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tm-btn-add:hover {
          background: var(--navy-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(31,42,68,0.24);
        }

        /* ── Stat Cards ── */
        .tm-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .tm-stat {
          background: #fff;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(31,42,68,0.08);
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 24px rgba(15,23,42,0.06);
          transition: var(--transition);
        }

        .tm-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(15,23,42,0.10);
        }

        .tm-stat__icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: rgba(200,167,94,0.1);
          color: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tm-stat__value {
          font-size: 32px;
          font-weight: 700;
          color: var(--navy);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .tm-stat__label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-top: 4px;
        }

        /* ── Table cell styles ── */
        .tm-member-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tm-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .tm-avatar--photo {
          object-fit: cover;
          border: 2px solid var(--beige);
        }

        .tm-avatar--initials {
          background: var(--navy);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .tm-member-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .tm-member-name {
          font-weight: 600;
          color: var(--navy);
          font-size: 0.875rem;
        }

        .tm-member-role {
          font-size: 0.775rem;
          color: var(--text-muted);
        }

        .tm-member-country {
          font-size: 0.72rem;
          color: var(--text-muted);
          opacity: 0.8;
        }

        .tm-group-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }

        .tm-dept-label {
          font-size: 0.845rem;
          color: var(--navy);
          font-weight: 500;
        }

        .tm-contact-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tm-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.815rem;
          color: var(--gold-dark);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .tm-contact-link:hover {
          color: var(--gold);
        }

        .tm-contact-link--social {
          color: var(--text-muted);
          font-size: 0.775rem;
        }

        .tm-contact-link--social:hover {
          color: var(--navy);
        }

        .tm-contact-empty {
          color: rgba(107,122,150,0.4);
          font-size: 0.875rem;
        }

        .tm-order-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(31,42,68,0.05);
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
        }

        /* ── Form modal sections ── */
        .tm-form-section {
          border: 1px solid rgba(31,42,68,0.1);
          border-radius: var(--radius-md);
          padding: 20px 22px;
          margin-bottom: 16px;
        }

        .tm-form-section:last-child {
          margin-bottom: 0;
        }

        .tm-form-section-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(31,42,68,0.07);
        }

        .tm-form-section-icon {
          display: inline-flex;
          align-items: center;
          color: var(--gold);
        }

        .tm-active-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        .tm-active-row input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--gold);
          cursor: pointer;
        }

        .tm-active-row label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--navy);
          cursor: pointer;
          margin-bottom: 0;
          text-transform: none;
          letter-spacing: normal;
        }

        @media (max-width: 900px) {
          .tm-stats { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .tm-stats { grid-template-columns: 1fr 1fr; }
          .tm-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="tm-header">
        <div className="tm-header__left">
          <div className="tm-header__icon">
            <Users size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="tm-header__title">Team</h1>
            <p className="tm-header__subtitle">Manage team members and their profiles</p>
          </div>
        </div>
        <button className="tm-btn-add" onClick={openCreate}>
          <UserPlus size={16} strokeWidth={2} />
          Add Member
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="tm-stats">
        <div className="tm-stat">
          <div className="tm-stat__icon"><Users size={20} strokeWidth={1.5} /></div>
          <div>
            <div className="tm-stat__value">{totalMembers}</div>
            <div className="tm-stat__label">Total Members</div>
          </div>
        </div>
        <div className="tm-stat">
          <div className="tm-stat__icon"><UserCheck size={20} strokeWidth={1.5} /></div>
          <div>
            <div className="tm-stat__value">{activeMembers}</div>
            <div className="tm-stat__label">Active</div>
          </div>
        </div>
        <div className="tm-stat">
          <div className="tm-stat__icon"><Crown size={20} strokeWidth={1.5} /></div>
          <div>
            <div className="tm-stat__value">{foundingCount}</div>
            <div className="tm-stat__label">Founding Team</div>
          </div>
        </div>
        <div className="tm-stat">
          <div className="tm-stat__icon"><Globe size={20} strokeWidth={1.5} /></div>
          <div>
            <div className="tm-stat__value">{globalCount}</div>
            <div className="tm-stat__label">Global Ops</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">Failed to load team: {error.message}</div>}

      {/* ── Search / Filters ── */}
      <SearchBar
        query={query}
        onSearch={setQuery}
        filters={[
          {
            key: 'status',
            label: 'All Statuses',
            options: [
              { value: 'active',   label: 'Active'   },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
          {
            key: 'team_group',
            label: 'All Teams',
            options: [
              { value: 'Founding Leadership Team', label: 'Founding Leadership' },
              { value: 'Global Operations Team',   label: 'Global Operations'  },
            ],
          },
          {
            key: 'department',
            label: 'All Departments',
            options: [
              { value: 'general',        label: 'General'        },
              { value: 'leadership',     label: 'Leadership'     },
              { value: 'research',       label: 'Research'       },
              { value: 'communications', label: 'Communications' },
              { value: 'events',         label: 'Events'         },
              { value: 'technology',     label: 'Technology'     },
              { value: 'finance',        label: 'Finance'        },
            ],
          },
        ]}
        activeFilters={activeFilters}
        onFilter={setFilter}
        onReset={reset}
        placeholder="Search by name, role, country or department…"
        resultCount={results.length}
        totalCount={data ? data.length : 0}
      />

      {/* ── Data Table ── */}
      <DataTable
        columns={columns}
        data={results}
        loading={loading}
        onEdit={openEdit}
        onDelete={openDelete}
        extraActions={customActions}
        emptyMessage="No team members yet. Add your first one."
      />

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <FormModal
          title={editing ? 'Edit Member' : 'Add Member'}
          onClose={function() { setShowForm(false) }}
          onSubmit={handleSubmit}
          loading={saving}
        >
          {formError && <div className="alert alert-error">{formError}</div>}

          {/* ── Basic Information ── */}
          <div className="tm-form-section">
            <div className="tm-form-section-heading">
              <span className="tm-form-section-icon"><Users size={12} strokeWidth={2} /></span>
              Basic Information
            </div>

            <div className="form-group">
              <FileUpload
                folder="yvu-assets/team"
                currentUrl={form.image_url}
                onUpload={function(url) { setForm(function(prev) {
                  var next = {}
                  var keys = Object.keys(prev)
                  for (var i = 0; i < keys.length; i++) next[keys[i]] = prev[keys[i]]
                  next.image_url = url
                  return next
                }) }}
                accept="image/*"
                label="Profile Photo"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Saneyat Ahmed"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role / Title *</label>
              <input
                className="form-input"
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Vice President"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                className="form-input"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="e.g. Bangladesh"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Team</label>
              <select
                className="form-input form-select"
                name="team_group"
                value={form.team_group}
                onChange={handleChange}
              >
                {TEAM_GROUPS.map(function(g) {
                  return <option key={g} value={g}>{g}</option>
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-input form-select"
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                {DEPARTMENTS.map(function(d) {
                  return <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Short Bio</label>
              <textarea
                className="form-input form-textarea"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Short biography..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input
                  className="form-input"
                  name="display_order"
                  type="number"
                  value={form.display_order}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                <div className="tm-active-row">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_active_check">Active member</label>
                </div>
              </div>
            </div>
          </div>

          {/* ── Social Links ── */}
          <div className="tm-form-section">
            <div className="tm-form-section-heading">
              <span className="tm-form-section-icon"><Link size={12} strokeWidth={2} /></span>
              Social Links
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={11} strokeWidth={2} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Email
              </label>
              <input
                className="form-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="member@youthverse.org"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Share2 size={11} strokeWidth={2} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Facebook URL
              </label>
              <input
                className="form-input"
                name="facebook_url"
                value={form.facebook_url}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <AtSign size={11} strokeWidth={2} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Instagram URL
              </label>
              <input
                className="form-input"
                name="instagram_url"
                value={form.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <ExternalLink size={11} strokeWidth={2} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                LinkedIn URL
              </label>
              <input
                className="form-input"
                name="linkedin_url"
                value={form.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Link size={11} strokeWidth={2} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Personal Portfolio URL
              </label>
              <input
                className="form-input"
                name="portfolio_url"
                value={form.portfolio_url}
                onChange={handleChange}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </FormModal>
      )}

      {/* ── Delete Confirm ── */}
      {showDelete && deleting && (
        <DeleteConfirm
          itemName={deleting.name}
          onConfirm={handleDelete}
          onCancel={function() { setShowDelete(false); setDeleting(null) }}
        />
      )}
    </div>
  )
}