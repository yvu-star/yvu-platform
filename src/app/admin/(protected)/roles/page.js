'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useActivityLog } from '@/hooks/useActivityLog'
import {
  Users, Star, Loader2,
  CheckCircle2, AlertCircle, Hand, Megaphone,
  ClipboardList, Plus
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────

function arrayToText(arr) {
  if (!arr || !Array.isArray(arr)) return ''
  return arr.join('\n')
}

function textToArray(text) {
  if (!text || !text.trim()) return []
  return text
    .split('\n')
    .map(function (l) { return l.trim() })
    .filter(function (l) { return l.length > 0 })
}

// ─── empty form shapes ───────────────────────────────────────────────────────

function emptyRole(roleType) {
  return {
    id:                   null,
    role_type:            roleType,
    title:                '',
    description:          '',
    time_commitment:      '',
    application_form_link:'',
    responsibilities:     '',
    benefits:             '',
    display_order:        0,
    is_active:            true,
  }
}

function emptyCta(ctaType) {
  return {
    id:                   null,
    cta_type:             ctaType,
    title:                '',
    application_form_link:'',
    sort_order:           0,
    is_active:            true,
  }
}

// ─── small sub-components ────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <label className="gi-toggle" title={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={function (e) { onChange(e.target.checked) }}
      />
      <span className="gi-toggle__track">
        <span className="gi-toggle__thumb" />
      </span>
      <span className="gi-toggle__label">{checked ? 'Active' : 'Inactive'}</span>
    </label>
  )
}

function SaveBtn({ saving, onClick }) {
  return (
    <button
      className="btn-primary gi-save-btn"
      onClick={onClick}
      disabled={saving}
    >
      {saving
        ? <><Loader2 size={13} strokeWidth={2.5} className="gi-spin" /> Saving…</>
        : 'Save'}
    </button>
  )
}

function Notice({ type, message, onClose }) {
  if (!message) return null
  return (
    <div className={'gi-notice gi-notice--' + type}>
      <span className="gi-notice__inner">
        {type === 'success'
          ? <CheckCircle2 size={14} strokeWidth={2} />
          : <AlertCircle size={14} strokeWidth={2} />}
        {message}
      </span>
      <button className="gi-notice__close" onClick={onClose}>×</button>
    </div>
  )
}

// ─── RoleBox ─────────────────────────────────────────────────────────────────

function RoleBox({ roleType, label, initialData, onSaved }) {
  const supabase = createClient()
  const { log } = useActivityLog()

  const [form, setForm] = useState(function () {
    return initialData || emptyRole(roleType)
  })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState({ type: '', message: '' })

  useEffect(function () {
    if (initialData) {
      setForm({
        id:                    initialData.id                    || null,
        role_type:             roleType,
        title:                 initialData.title                 || '',
        description:           initialData.description           || '',
        time_commitment:       initialData.time_commitment       || '',
        application_form_link: initialData.application_form_link || '',
        responsibilities:      arrayToText(initialData.responsibilities),
        benefits:              arrayToText(initialData.benefits),
        display_order:         initialData.display_order         ?? 0,
        is_active:             initialData.is_active             ?? true,
      })
    }
  }, [initialData, roleType])

  function change(e) {
    const { name, value } = e.target
    setForm(function (prev) { return Object.assign({}, prev, { [name]: value }) })
  }

  async function save() {
    if (!form.title.trim()) {
      setNotice({ type: 'error', message: 'Title is required.' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        role_type:             roleType,
        title:                 form.title.trim(),
        description:           form.description.trim(),
        time_commitment:       form.time_commitment.trim(),
        application_form_link: form.application_form_link.trim(),
        responsibilities:      textToArray(form.responsibilities),
        benefits:              textToArray(form.benefits),
        display_order:         parseInt(form.display_order) || 0,
        is_active:             form.is_active,
        // keep legacy columns happy
        category:              roleType,
        status:                form.is_active ? 'open' : 'closed',
      }

      let result
      if (form.id) {
        const { data, error } = await supabase
          .from('roles')
          .update(payload)
          .eq('id', form.id)
          .select()
          .single()
        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('roles')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        result = data
        setForm(function (prev) { return Object.assign({}, prev, { id: result.id }) })
      }

      await log({
        action:      form.id ? 'update' : 'create',
        entity:      'roles',
        entityId:    result.id,
        description: (form.id ? 'Updated' : 'Created') + ' ' + roleType + ' role: ' + form.title,
      })

      setNotice({ type: 'success', message: 'Saved successfully.' })
      if (onSaved) onSaved(result)
    } catch (err) {
      setNotice({ type: 'error', message: 'Error saving: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  const BoxIcon = roleType === 'volunteer' ? Hand : Star

  return (
    <div className="gi-box">
      <div className="gi-box__header">
        <div className="gi-box__heading">
          <div className="gi-box__icon-wrap">
            <BoxIcon size={16} strokeWidth={1.5} />
          </div>
          <div>
            <div className="gi-box__eyebrow">{roleType === 'volunteer' ? 'Volunteer' : 'Ambassador'}</div>
            <h2 className="gi-box__title">{label}</h2>
          </div>
          {form.id && <span className="gi-box__id">Saved</span>}
        </div>
        <div className="gi-box__controls">
          <Toggle
            checked={form.is_active}
            onChange={function (val) {
              setForm(function (prev) { return Object.assign({}, prev, { is_active: val }) })
            }}
            label="Toggle active state"
          />
          <SaveBtn saving={saving} onClick={save} />
        </div>
      </div>

      <Notice
        type={notice.type}
        message={notice.message}
        onClose={function () { setNotice({ type: '', message: '' }) }}
      />

      <div className="gi-box__body">
        <div className="gi-field">
          <label className="gi-label">Title <span className="gi-required">*</span></label>
          <input
            name="title"
            value={form.title}
            onChange={change}
            placeholder={'e.g. ' + (roleType === 'volunteer' ? 'Communications Volunteer' : 'Youth Ambassador')}
            className="gi-input"
          />
        </div>

        <div className="gi-row">
          <div className="gi-field">
            <label className="gi-label">Time Commitment</label>
            <input
              name="time_commitment"
              value={form.time_commitment}
              onChange={change}
              placeholder="e.g. 5–10 hours/week"
              className="gi-input"
            />
          </div>
          <div className="gi-field gi-field--narrow">
            <label className="gi-label">Sort Order</label>
            <input
              type="number"
              name="display_order"
              value={form.display_order}
              onChange={change}
              min={0}
              className="gi-input"
            />
          </div>
        </div>

        <div className="gi-field">
          <label className="gi-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            rows={3}
            placeholder="What does this role involve?"
            className="gi-textarea"
          />
        </div>

        <div className="gi-field">
          <label className="gi-label">Application Form Link</label>
          <input
            name="application_form_link"
            value={form.application_form_link}
            onChange={change}
            placeholder="https://forms.example.com/…"
            type="url"
            className="gi-input"
          />
        </div>

        <div className="gi-row gi-row--equal">
          <div className="gi-field">
            <label className="gi-label">
              Responsibilities
              <span className="gi-hint">One per line</span>
            </label>
            <textarea
              name="responsibilities"
              value={form.responsibilities}
              onChange={change}
              rows={4}
              placeholder={'Organise events\nWrite social media content\nAttend weekly meetings'}
              className="gi-textarea"
            />
          </div>
          <div className="gi-field">
            <label className="gi-label">
              Benefits
              <span className="gi-hint">One per line</span>
            </label>
            <textarea
              name="benefits"
              value={form.benefits}
              onChange={change}
              rows={4}
              placeholder={'Leadership experience\nNetworking opportunities\nReference letter'}
              className="gi-textarea"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CtaBox ───────────────────────────────────────────────────────────────────

function CtaBox({ ctaType, label, initialData, onSaved }) {
  const supabase = createClient()
  const { log } = useActivityLog()

  const [form, setForm] = useState(function () {
    return initialData || emptyCta(ctaType)
  })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState({ type: '', message: '' })

  useEffect(function () {
    if (initialData) {
      setForm({
        id:                    initialData.id                    || null,
        cta_type:              ctaType,
        title:                 initialData.title                 || '',
        application_form_link: initialData.application_form_link || '',
        sort_order:            initialData.sort_order            ?? 0,
        is_active:             initialData.is_active             ?? true,
      })
    }
  }, [initialData, ctaType])

  function change(e) {
    const { name, value } = e.target
    setForm(function (prev) { return Object.assign({}, prev, { [name]: value }) })
  }

  async function save() {
    setSaving(true)
    try {
      const payload = {
        cta_type:              ctaType,
        title:                 form.title.trim(),
        application_form_link: form.application_form_link.trim(),
        sort_order:            parseInt(form.sort_order) || 0,
        is_active:             form.is_active,
        updated_at:            new Date().toISOString(),
      }

      let result
      if (form.id) {
        const { data, error } = await supabase
          .from('gi_cta')
          .update(payload)
          .eq('id', form.id)
          .select()
          .single()
        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('gi_cta')
          .upsert(payload, { onConflict: 'cta_type' })
          .select()
          .single()
        if (error) throw error
        result = data
        setForm(function (prev) { return Object.assign({}, prev, { id: result.id }) })
      }

      await log({
        action:      'update',
        entity:      'gi_cta',
        entityId:    result.id,
        description: 'Updated CTA box: ' + ctaType,
      })

      setNotice({ type: 'success', message: 'Saved successfully.' })
      if (onSaved) onSaved(result)
    } catch (err) {
      setNotice({ type: 'error', message: 'Error saving: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  const CtaIcon = ctaType === 'volunteer' ? ClipboardList : Megaphone

  return (
    <div className="gi-box gi-box--cta">
      <div className="gi-box__header">
        <div className="gi-box__heading">
          <div className="gi-box__icon-wrap gi-box__icon-wrap--gold">
            <CtaIcon size={16} strokeWidth={1.5} />
          </div>
          <div>
            <div className="gi-box__eyebrow">CTA Button</div>
            <h2 className="gi-box__title">{label}</h2>
          </div>
        </div>
        <div className="gi-box__controls">
          <Toggle
            checked={form.is_active}
            onChange={function (val) {
              setForm(function (prev) { return Object.assign({}, prev, { is_active: val }) })
            }}
            label="Toggle active state"
          />
          <SaveBtn saving={saving} onClick={save} />
        </div>
      </div>

      <Notice
        type={notice.type}
        message={notice.message}
        onClose={function () { setNotice({ type: '', message: '' }) }}
      />

      <div className="gi-box__body">
        <div className="gi-row">
          <div className="gi-field">
            <label className="gi-label">Button / Card Title</label>
            <input
              name="title"
              value={form.title}
              onChange={change}
              placeholder={'e.g. ' + (ctaType === 'volunteer' ? 'Become a Volunteer' : 'Become an Ambassador')}
              className="gi-input"
            />
          </div>
          <div className="gi-field gi-field--narrow">
            <label className="gi-label">Sort Order</label>
            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={change}
              min={0}
              className="gi-input"
            />
          </div>
        </div>

        <div className="gi-field">
          <label className="gi-label">Application Form Link</label>
          <input
            name="application_form_link"
            value={form.application_form_link}
            onChange={change}
            placeholder="https://forms.example.com/…"
            type="url"
            className="gi-input"
          />
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const supabase = createClient()

  const [volunteerRole,   setVolunteerRole]   = useState(null)
  const [ambassadorRole,  setAmbassadorRole]  = useState(null)
  const [volunteerCta,    setVolunteerCta]    = useState(null)
  const [ambassadorCta,   setAmbassadorCta]   = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [loadError,       setLoadError]       = useState(null)

  const load = useCallback(async function () {
    setLoading(true)
    try {
      const [rolesRes, ctaRes] = await Promise.all([
        supabase.from('roles').select('*').in('role_type', ['volunteer', 'ambassador']),
        supabase.from('gi_cta').select('*').in('cta_type', ['volunteer', 'ambassador']),
      ])
      if (rolesRes.error) throw rolesRes.error
      if (ctaRes.error)   throw ctaRes.error

      const roles = rolesRes.data || []
      const ctas  = ctaRes.data   || []

      setVolunteerRole(roles.find(function (r) { return r.role_type === 'volunteer' }) || null)
      setAmbassadorRole(roles.find(function (r) { return r.role_type === 'ambassador' }) || null)
      setVolunteerCta(ctas.find(function (c) { return c.cta_type === 'volunteer' }) || null)
      setAmbassadorCta(ctas.find(function (c) { return c.cta_type === 'ambassador' }) || null)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(function () { load() }, [load])

  if (loading) {
    return (
      <>
        <style>{GI_STYLES}</style>
        <div className="gi-loading">
          <div className="gi-loading__spinner" />
          <p>Loading Get Involved data…</p>
        </div>
      </>
    )
  }

  return (
    <div className="gi-page">
      <style>{GI_STYLES}</style>

      {/* ── Page Header ── */}
      <div className="gi-page-header">
        <div className="gi-page-header__left">
          <div className="gi-page-header__icon-box">
            <Users size={22} strokeWidth={1.5} />
          </div>
          <div>
            <div className="gi-page-header__eyebrow">Community</div>
            <h1 className="gi-page-header__title">Get Involved</h1>
            <p className="gi-page-header__subtitle">
              Manage the Volunteer and Ambassador role details, and the CTA buttons shown on the public site.
            </p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="gi-error-banner">
          <AlertCircle size={14} strokeWidth={2} />
          Error loading data: {loadError}
        </div>
      )}

      {/* ── Role Details ── */}
      <div className="gi-section-header">
        <div className="gi-section-header__line" />
        <span className="gi-section-label">Role Details</span>
        <div className="gi-section-header__line" />
      </div>
      <div className="gi-grid-2">
        <RoleBox
          roleType="volunteer"
          label="Volunteer Role"
          initialData={volunteerRole}
          onSaved={setVolunteerRole}
        />
        <RoleBox
          roleType="ambassador"
          label="Ambassador Role"
          initialData={ambassadorRole}
          onSaved={setAmbassadorRole}
        />
      </div>

      {/* ── CTA Buttons ── */}
      <div className="gi-section-header">
        <div className="gi-section-header__line" />
        <span className="gi-section-label">Call-to-Action Buttons</span>
        <div className="gi-section-header__line" />
      </div>
      <div className="gi-grid-2">
        <CtaBox
          ctaType="volunteer"
          label="Become a Volunteer CTA"
          initialData={volunteerCta}
          onSaved={setVolunteerCta}
        />
        <CtaBox
          ctaType="ambassador"
          label="Become an Ambassador CTA"
          initialData={ambassadorCta}
          onSaved={setAmbassadorCta}
        />
      </div>
    </div>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const GI_STYLES = `
  .gi-page {
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
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --transition: all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
  }

  .gi-page {
    animation: giPageIn 0.3s ease both;
    background-color: var(--beige-warm);
    min-height: 100vh;
    padding: 32px 40px;
    font-family: system-ui, -apple-system, sans-serif;
    box-sizing: border-box;
  }
  @keyframes giPageIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .gi-page-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 36px;
  }
  .gi-page-header__left {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .gi-page-header__icon-box {
    width: 52px;
    height: 52px;
    background: var(--navy);
    color: var(--gold-light);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(31,42,68,0.18);
  }
  .gi-page-header__eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold-dark);
    margin-bottom: 4px;
  }
  .gi-page-header__title {
    font-size: 30px;
    font-weight: 700;
    color: var(--navy);
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0;
  }
  .gi-page-header__subtitle {
    margin: 5px 0 0;
    font-size: 13.5px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .gi-section-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 36px 0 16px;
  }
  .gi-section-header__line {
    flex: 1;
    height: 1px;
    background: rgba(31,42,68,0.10);
  }
  .gi-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .gi-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 700px) {
    .gi-grid-2 { grid-template-columns: 1fr; }
    .gi-page { padding: 20px 20px; }
    .gi-page-header__title { font-size: 24px; }
  }

  .gi-box {
    background: #fff;
    border: 1px solid rgba(31,42,68,0.08);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 24px rgba(15,23,42,0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .gi-box--cta {
    border-top: 3px solid var(--gold);
  }

  .gi-box__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--beige-warm);
    border-bottom: 1px solid rgba(31,42,68,0.07);
    gap: 12px;
    flex-wrap: wrap;
  }
  .gi-box__heading {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .gi-box__icon-wrap {
    width: 36px;
    height: 36px;
    background: var(--navy);
    color: var(--gold-light);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .gi-box__icon-wrap--gold {
    background: rgba(200,167,94,0.12);
    color: var(--gold-dark);
    border: 1px solid rgba(200,167,94,0.25);
  }
  .gi-box__eyebrow {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold-dark);
    margin-bottom: 2px;
  }
  .gi-box__title {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--navy);
    margin: 0;
    line-height: 1.2;
  }
  .gi-box__id {
    font-size: 10px;
    background: rgba(31,42,68,0.07);
    color: var(--navy-mid);
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: 1px solid rgba(31,42,68,0.12);
  }
  .gi-box__controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .gi-box__body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  .gi-save-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    background: var(--navy);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition);
    letter-spacing: 0.01em;
  }
  .gi-save-btn:hover:not(:disabled) {
    background: var(--navy-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(31,42,68,0.2);
  }
  .gi-save-btn:disabled { opacity: 0.55; cursor: wait; }
  .gi-spin { animation: giSpin 1s linear infinite; }
  @keyframes giSpin { to { transform: rotate(360deg); } }

  .gi-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }
  .gi-toggle input { display: none; }
  .gi-toggle__track {
    width: 38px;
    height: 22px;
    background: rgba(31,42,68,0.15);
    border-radius: 11px;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .gi-toggle input:checked + .gi-toggle__track {
    background: var(--navy);
  }
  .gi-toggle__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94);
    box-shadow: 0 1px 4px rgba(0,0,0,0.18);
  }
  .gi-toggle input:checked ~ .gi-toggle__track .gi-toggle__thumb,
  .gi-toggle input:checked + .gi-toggle__track .gi-toggle__thumb {
    transform: translateX(16px);
  }
  .gi-toggle__label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--text-muted);
    min-width: 50px;
    letter-spacing: 0.02em;
  }

  .gi-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 12.5px;
    font-weight: 500;
    border-left: 3px solid transparent;
  }
  .gi-notice__inner {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .gi-notice--success {
    background: rgba(31,42,68,0.04);
    border-color: var(--navy);
    color: var(--navy);
  }
  .gi-notice--error {
    background: #fff5f5;
    border-color: #c0392b;
    color: #c0392b;
  }
  .gi-notice__close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    color: inherit;
    opacity: 0.5;
    padding: 0 4px;
    transition: opacity 0.15s;
  }
  .gi-notice__close:hover { opacity: 1; }

  .gi-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .gi-field--narrow { max-width: 110px; }
  .gi-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--navy);
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .gi-required { color: #c0392b; }
  .gi-hint {
    font-size: 10.5px;
    font-weight: 400;
    color: var(--text-muted);
    letter-spacing: 0;
  }
  .gi-input, .gi-textarea {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    background: #fff;
    border: 1px solid rgba(31,42,68,0.14);
    border-radius: var(--radius-sm);
    color: var(--navy);
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .gi-textarea {
    height: auto;
    padding: 10px 12px;
    resize: vertical;
    line-height: 1.6;
  }
  .gi-input:focus, .gi-textarea:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(200,167,94,0.15);
  }
  .gi-input::placeholder, .gi-textarea::placeholder {
    color: var(--text-muted);
    opacity: 1;
  }

  .gi-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: start;
  }
  .gi-row--equal {
    grid-template-columns: 1fr 1fr;
  }

  .gi-error-banner {
    display: flex;
    align-items: center;
    gap: 9px;
    background: #fff5f5;
    border: 1px solid rgba(192,57,43,0.2);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    color: #c0392b;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 28px;
  }

  .gi-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: var(--text-muted);
    gap: 16px;
    font-size: 13.5px;
    background: var(--beige-warm);
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .gi-loading__spinner {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(31,42,68,0.10);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: giSpin 0.9s linear infinite;
  }
`