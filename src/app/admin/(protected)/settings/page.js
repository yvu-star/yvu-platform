'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { upsertSettings } from '@/lib/services/settings.service';
import DeleteConfirm from '@/components/admin/DeleteConfirm';
import FormModal from '@/components/admin/FormModal';
import { Settings, FileText, Target, Gem, Plus, Check, X, ChevronDown, ChevronUp, Loader2, Calendar, Users, BookOpen, Trophy, Globe, Globe2, Star, Zap, Award, Pencil, Trash2, Rocket, Heart, Shield, TrendingUp, Layers, CheckCircle, Briefcase, Feather, Leaf, Code, Compass } from 'lucide-react';

// ─── Toast ─────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return function () { clearTimeout(t); };
  }, [onClose]);
  return (
    <div className={'sp-toast sp-toast--' + type}>
      <span className="sp-toast__icon">
        {type === 'success'
          ? <Check size={14} strokeWidth={2.5} />
          : <X size={14} strokeWidth={2.5} />}
      </span>
      {message}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback(function (message, type) {
    const id = Date.now();
    setToasts(function (prev) { return [...prev, { id, message, type: type || 'success' }]; });
  }, []);
  const remove = useCallback(function (id) {
    setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id; }); });
  }, []);
  return { toasts, show, remove };
}

// ─── Generic field input ────────────────────────────────────────────────────

function SettingField({ label, fieldKey, value, onChange, multiline }) {
  if (multiline) {
    return (
      <div className="sp-field">
        <label className="sp-label">{label}</label>
        <textarea
          className="sp-textarea"
          value={value || ''}
          rows={3}
          onChange={function (e) { onChange(fieldKey, e.target.value); }}
        />
      </div>
    );
  }
  return (
    <div className="sp-field">
      <label className="sp-label">{label}</label>
      <input
        className="sp-input"
        type="text"
        value={value || ''}
        onChange={function (e) { onChange(fieldKey, e.target.value); }}
      />
    </div>
  );
}

// ─── Section block with save button ────────────────────────────────────────

function SectionBlock({ title, prefix, fields, values, onChange, onSave, saving }) {
  return (
    <div className="sp-section-block">
      <div className="sp-section-block__header">
        <h4 className="sp-section-block__title">{title}</h4>
      </div>
      <div className="sp-section-block__fields">
        {fields.map(function (f) {
          const key = prefix + f.key;
          return (
            <SettingField
              key={key}
              label={f.label}
              fieldKey={key}
              value={values[key]}
              onChange={onChange}
              multiline={f.multiline}
            />
          );
        })}
      </div>
      <div className="sp-section-block__footer">
        <button
          className="sp-btn sp-btn--primary"
          onClick={function () { onSave(prefix, fields); }}
          disabled={saving === prefix}
        >
          {saving === prefix
            ? <><Loader2 size={14} strokeWidth={2} className="sp-btn__spinner" /> Saving…</>
            : 'Save Section'}
        </button>
      </div>
    </div>
  );
}

// ─── Field definitions ──────────────────────────────────────────────────────

const HERO_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'badge_text', label: 'Badge Text' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'content', label: 'Content', multiline: true },
  { key: 'btn_text', label: 'Button 1 Text' },
  { key: 'btn_link', label: 'Button 1 Link' },
  { key: 'btn2_text', label: 'Button 2 Text' },
  { key: 'btn2_link', label: 'Button 2 Link' },
];

const CTA_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'badge_text', label: 'Badge Text' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'content', label: 'Content', multiline: true },
  { key: 'btn_text', label: 'Button 1 Text' },
  { key: 'btn_link', label: 'Button 1 Link' },
  { key: 'btn2_text', label: 'Button 2 Text' },
  { key: 'btn2_link', label: 'Button 2 Link' },
];

const TEXT_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'badge_text', label: 'Badge Text' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'content', label: 'Content', multiline: true },
];

const HOME_HERO_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'badge', label: 'Badge' },
  { key: 'text', label: 'Text' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'content', label: 'Content', multiline: true },
  { key: 'btn_text', label: 'Button 1 Text' },
  { key: 'btn_link', label: 'Button 1 Link' },
  { key: 'btn2_text', label: 'Button 2 Text' },
  { key: 'btn2_link', label: 'Button 2 Link' },
];

// ─── Content page sections config ──────────────────────────────────────────

const CONTENT_PAGES = [
  {
    id: 'home',
    label: 'Home',
    sections: [
      { title: 'Hero Section', prefix: 'home_hero_', fields: HOME_HERO_FIELDS },
      { title: 'CTA Section', prefix: 'home_cta_', fields: CTA_FIELDS },
    ],
  },
  {
    id: 'about',
    label: 'About',
    sections: [
      { title: 'Hero Section', prefix: 'about_hero_', fields: HERO_FIELDS },
      { title: 'Story Section', prefix: 'about_story_', fields: TEXT_FIELDS },
      { title: 'Why We Started Section', prefix: 'about_why_', fields: TEXT_FIELDS },
      { title: 'Philosophy Section', prefix: 'about_philosophy_', fields: TEXT_FIELDS },
      { title: 'CTA Section', prefix: 'about_cta_', fields: CTA_FIELDS },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    sections: [
      { title: 'Hero Section', prefix: 'events_hero_', fields: HERO_FIELDS },
      { title: 'Upcoming Section', prefix: 'events_upcoming_', fields: CTA_FIELDS },
      { title: 'Past Section', prefix: 'events_past_', fields: CTA_FIELDS },
      { title: 'CTA Section', prefix: 'events_cta_', fields: CTA_FIELDS },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    sections: [
      { title: 'Hero Section', prefix: 'research_hero_', fields: HERO_FIELDS },
      { title: 'Intro Section', prefix: 'research_intro_', fields: CTA_FIELDS },
      { title: 'CTA Section', prefix: 'research_cta_', fields: CTA_FIELDS },
    ],
  },
  {
    id: 'getinvolved',
    label: 'Get Involved',
    sections: [
      { title: 'Hero Section', prefix: 'gi_hero_', fields: HERO_FIELDS },
      { title: 'Volunteer Section', prefix: 'gi_volunteer_', fields: CTA_FIELDS },
      { title: 'Ambassador Section', prefix: 'gi_ambassador_', fields: CTA_FIELDS },
      { title: 'CTA Section', prefix: 'gi_cta_', fields: CTA_FIELDS },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    sections: [
      { title: 'Hero Section', prefix: 'contact_hero_', fields: HERO_FIELDS },
      { title: 'Form Section', prefix: 'contact_form_', fields: CTA_FIELDS },
      { title: 'Info Section', prefix: 'contact_info_', fields: CTA_FIELDS },
      { title: 'CTA Section', prefix: 'contact_cta_', fields: CTA_FIELDS },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    sections: [
      {
        title: 'Hero Section',
        prefix: 'team_hero_',
        fields: [
          { key: 'kicker',  label: 'Eyebrow / Kicker Text' },
          { key: 'title',   label: 'Title' },
          { key: 'content', label: 'Content', multiline: true },
        ],
      },
      {
        title: 'Call-to-Action Section',
        prefix: 'team_cta_',
        fields: [
          { key: 'title', label: 'CTA Title' },
        ],
      },
    ],
  },
];

// ─── Core Values Icon Set ───────────────────────────────────────────────────

const CV_ICONS = [
  { name: 'BookOpen',    component: <BookOpen    size={18} strokeWidth={1.8} /> },
  { name: 'Globe',       component: <Globe       size={18} strokeWidth={1.8} /> },
  { name: 'Shield',      component: <Shield      size={18} strokeWidth={1.8} /> },
  { name: 'Zap',         component: <Zap         size={18} strokeWidth={1.8} /> },
  { name: 'Award',       component: <Award       size={18} strokeWidth={1.8} /> },
  { name: 'Target',      component: <Target      size={18} strokeWidth={1.8} /> },
  { name: 'Rocket',      component: <Rocket      size={18} strokeWidth={1.8} /> },
  { name: 'Heart',       component: <Heart       size={18} strokeWidth={1.8} /> },
  { name: 'Star',        component: <Star        size={18} strokeWidth={1.8} /> },
  { name: 'Trophy',      component: <Trophy      size={18} strokeWidth={1.8} /> },
  { name: 'Users',       component: <Users       size={18} strokeWidth={1.8} /> },
  { name: 'Globe2',      component: <Globe2      size={18} strokeWidth={1.8} /> },
  { name: 'Compass',     component: <Compass     size={18} strokeWidth={1.8} /> },
  { name: 'TrendingUp',  component: <TrendingUp  size={18} strokeWidth={1.8} /> },
  { name: 'Layers',      component: <Layers      size={18} strokeWidth={1.8} /> },
  { name: 'CheckCircle', component: <CheckCircle size={18} strokeWidth={1.8} /> },
  { name: 'Briefcase',   component: <Briefcase   size={18} strokeWidth={1.8} /> },
  { name: 'Feather',     component: <Feather     size={18} strokeWidth={1.8} /> },
  { name: 'Leaf',        component: <Leaf        size={18} strokeWidth={1.8} /> },
  { name: 'Code',        component: <Code        size={18} strokeWidth={1.8} /> },
];

function CoreValueIconPicker({ value, onChange }) {
  return (
    <div>
      <label className="sp-label">Icon</label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: '6px',
        padding: '12px',
        background: 'var(--beige-warm, #faf6ef)',
        border: '1px solid rgba(200,167,94,0.2)',
        borderRadius: '10px',
        marginTop: '4px',
      }}>
        {CV_ICONS.map(function (ic) {
          var isSelected = value === ic.name;
          return (
            <button
              key={ic.name}
              type="button"
              title={ic.name}
              onClick={function () { onChange('icon', ic.name); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: isSelected ? '2px solid var(--gold, #c8a75e)' : '2px solid transparent',
                background: isSelected ? 'var(--gold, #c8a75e)' : 'rgba(31,42,68,0.06)',
                color: isSelected ? '#fff' : 'var(--navy, #1f2a44)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                padding: 0,
                flexShrink: 0,
              }}
            >
              {ic.component}
            </button>
          );
        })}
      </div>
      {value && (
        <div style={{
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '6px',
            background: 'var(--gold, #c8a75e)', color: '#fff',
          }}>
            {(CV_ICONS.find(function (ic) { return ic.name === value; }) || {}).component}
          </span>
          <span>Selected: <strong>{value}</strong></span>
        </div>
      )}
    </div>
  );
}

// ─── Core Values Modal ──────────────────────────────────────────────────────

function CoreValueModal({ value, onClose, onSave, saving }) {
  const isEdit = Boolean(value && value.id);
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    long_description: '',
    icon: '',
    color: '#c8a75e',
    sort_order: 0,
    is_active: true,
    ...(value || {}),
  });

  function handleChange(field, val) {
    setForm(function (prev) { return { ...prev, [field]: val }; });
  }

  return (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div className="sp-modal" onClick={function (e) { e.stopPropagation(); }}>
        <div className="sp-modal__header">
          <h3 className="sp-modal__title">{isEdit ? 'Edit Core Value' : 'Add Core Value'}</h3>
          <button className="sp-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="sp-modal__body">
          <div className="sp-field">
            <label className="sp-label">Name *</label>
            <input className="sp-input" value={form.name} onChange={function (e) { handleChange('name', e.target.value); }} />
          </div>
          <CoreValueIconPicker value={form.icon} onChange={handleChange} />
          <div className="sp-field">
            <label className="sp-label">Color</label>
            <div className="sp-color-row">
              <input type="color" className="sp-color-input" value={form.color} onChange={function (e) { handleChange('color', e.target.value); }} />
              <input className="sp-input" value={form.color} onChange={function (e) { handleChange('color', e.target.value); }} />
            </div>
          </div>
          <div className="sp-field">
            <label className="sp-label">Short Description</label>
            <input className="sp-input" value={form.short_description} onChange={function (e) { handleChange('short_description', e.target.value); }} />
          </div>
          <div className="sp-field">
            <label className="sp-label">Long Description</label>
            <textarea className="sp-textarea" rows={4} value={form.long_description} onChange={function (e) { handleChange('long_description', e.target.value); }} />
          </div>
          <div className="sp-row">
            <div className="sp-field" style={{ flex: 1 }}>
              <label className="sp-label">Sort Order</label>
              <input className="sp-input" type="number" value={form.sort_order} onChange={function (e) { handleChange('sort_order', parseInt(e.target.value, 10) || 0); }} />
            </div>
            <div className="sp-field" style={{ flex: 1 }}>
              <label className="sp-label">Status</label>
              <div className="sp-toggle-row">
                <button
                  className={'sp-toggle' + (form.is_active ? ' sp-toggle--on' : '')}
                  onClick={function () { handleChange('is_active', !form.is_active); }}
                  type="button"
                  aria-label="Toggle active status"
                >
                  <span className="sp-toggle__thumb" />
                </button>
                <span className="sp-toggle__label">{form.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="sp-modal__footer">
          <button className="sp-btn sp-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="sp-btn sp-btn--primary"
            onClick={function () { onSave(form); }}
            disabled={saving || !form.name.trim()}
          >
            {saving
              ? <><Loader2 size={14} strokeWidth={2} className="sp-btn__spinner" /> Saving…</>
              : isEdit ? 'Update Value' : 'Create Value'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Core Value Card ────────────────────────────────────────────────────────

function CoreValueCard({ coreValue, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={'sp-cv-card' + (expanded ? ' sp-cv-card--expanded' : '')}
      style={{ borderTop: '3px solid ' + (coreValue.color || '#c8a75e') }}
    >
      <button className="sp-cv-card__main" onClick={function () { setExpanded(function (v) { return !v; }); }}>
        <div className="sp-cv-card__icon">{coreValue.icon || '◆'}</div>
        <div className="sp-cv-card__info">
          <div className="sp-cv-card__name">{coreValue.name}</div>
          <div className="sp-cv-card__short">{coreValue.short_description}</div>
        </div>
        <div className={'sp-cv-card__status sp-cv-card__status--' + (coreValue.is_active ? 'active' : 'inactive')}>
          {coreValue.is_active ? 'Active' : 'Inactive'}
        </div>
        <span className="sp-cv-card__chevron">
          {expanded ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
        </span>
      </button>
      {expanded && (
        <div className="sp-cv-card__details">
          {coreValue.long_description && (
            <p className="sp-cv-card__long">{coreValue.long_description}</p>
          )}
          <div className="sp-cv-card__actions">
            <button className="sp-btn sp-btn--sm sp-btn--primary" onClick={function () { onEdit(coreValue); }}>Edit</button>
            <button
              className={'sp-btn sp-btn--sm ' + (coreValue.is_active ? 'sp-btn--ghost' : 'sp-btn--success')}
              onClick={function () { onToggle(coreValue); }}
            >
              {coreValue.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button className="sp-btn sp-btn--sm sp-btn--danger" onClick={function () { onDelete(coreValue); }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Impact Statistics ──────────────────────────────────────────────────────

const STAT_ICONS = {
  Calendar: <Calendar size={16} strokeWidth={1.8} />,
  Users: <Users size={16} strokeWidth={1.8} />,
  BookOpen: <BookOpen size={16} strokeWidth={1.8} />,
  Trophy: <Trophy size={16} strokeWidth={1.8} />,
  Globe: <Globe size={16} strokeWidth={1.8} />,
  Star: <Star size={16} strokeWidth={1.8} />,
  Zap: <Zap size={16} strokeWidth={1.8} />,
  Award: <Award size={16} strokeWidth={1.8} />,
};

const STAT_ICON_NAMES = Object.keys(STAT_ICONS);

function StatModal({ stat, onClose, onSave, saving }) {
  const isEdit = Boolean(stat && stat.key);
  const initial = stat || { label: '', value: '', suffix: '', icon: 'Star', sort_order: 0 };
  const [form, setForm] = useState({
    label: initial.label || '',
    value: initial.value || '',
    suffix: initial.suffix || '',
    icon: initial.icon || 'Star',
    sort_order: initial.sort_order ?? 0,
  });

  function handleChange(field, val) {
    setForm(function (prev) { return { ...prev, [field]: val }; });
  }

  const canSave = form.label.trim() && form.value.trim();

  return (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div className="sp-modal" onClick={function (e) { e.stopPropagation(); }}>
        <div className="sp-modal__header">
          <h3 className="sp-modal__title">{isEdit ? 'Edit Stat' : 'Add Stat'}</h3>
          <button className="sp-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="sp-modal__body">
          <div className="sp-field">
            <label className="sp-label">Label *</label>
            <input
              className="sp-input"
              placeholder="e.g. Events Hosted"
              value={form.label}
              onChange={function (e) { handleChange('label', e.target.value); }}
            />
          </div>
          <div className="sp-row">
            <div className="sp-field" style={{ flex: 1 }}>
              <label className="sp-label">Value *</label>
              <input
                className="sp-input"
                placeholder="e.g. 12"
                value={form.value}
                onChange={function (e) { handleChange('value', e.target.value); }}
              />
            </div>
            <div className="sp-field" style={{ flex: 1 }}>
              <label className="sp-label">Suffix</label>
              <input
                className="sp-input"
                placeholder="e.g. + or K+"
                value={form.suffix}
                onChange={function (e) { handleChange('suffix', e.target.value); }}
              />
            </div>
          </div>
          <div className="sp-row">
            <div className="sp-field" style={{ flex: 1 }}>
              <label className="sp-label">Icon</label>
              <select
                className="sp-input sp-select"
                value={form.icon}
                onChange={function (e) { handleChange('icon', e.target.value); }}
              >
                {STAT_ICON_NAMES.map(function (name) {
                  return <option key={name} value={name}>{name}</option>;
                })}
              </select>
            </div>
            <div className="sp-field" style={{ flex: 1 }}>
              <label className="sp-label">Sort Order</label>
              <input
                className="sp-input"
                type="number"
                value={form.sort_order}
                onChange={function (e) { handleChange('sort_order', parseInt(e.target.value, 10) || 0); }}
              />
            </div>
          </div>
          <div className="sp-stat-icon-preview">
            <span className="sp-stat-icon-preview__badge">{STAT_ICONS[form.icon]}</span>
            <span className="sp-stat-icon-preview__name">{form.icon}</span>
          </div>
        </div>
        <div className="sp-modal__footer">
          <button className="sp-btn sp-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="sp-btn sp-btn--primary"
            onClick={function () { onSave(form, stat ? stat.key : null); }}
            disabled={saving || !canSave}
          >
            {saving
              ? <><Loader2 size={14} strokeWidth={2} className="sp-btn__spinner" /> Saving...</>
              : isEdit ? 'Update Stat' : 'Add Stat'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ stat, onEdit, onDelete }) {
  return (
    <div className="sp-stat-row">
      <div className="sp-stat-row__icon-badge">
        {STAT_ICONS[stat.icon] || <Star size={16} strokeWidth={1.8} />}
        <span className="sp-stat-row__icon-name">{stat.icon || 'Star'}</span>
      </div>
      <div className="sp-stat-row__label">{stat.label}</div>
      <div className="sp-stat-row__value">{stat.value}{stat.suffix}</div>
      <div className="sp-stat-row__order">#{stat.sort_order}</div>
      <div className="sp-stat-row__actions">
        <button className="sp-btn sp-btn--sm sp-btn--ghost sp-btn--icon" onClick={function () { onEdit(stat); }} aria-label="Edit">
          <Pencil size={13} strokeWidth={2} />
        </button>
        <button className="sp-btn sp-btn--sm sp-btn--danger sp-btn--icon" onClick={function () { onDelete(stat); }} aria-label="Delete">
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── Tab bar ────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange, secondary }) {
  return (
    <div className={'sp-tabbar' + (secondary ? ' sp-tabbar--secondary' : '')}>
      {tabs.map(function (t) {
        return (
          <button
            key={t.id}
            className={'sp-tab' + (active === t.id ? ' sp-tab--active' : '')}
            onClick={function () { onChange(t.id); }}
          >
            {t.icon && <span className="sp-tab__icon">{t.icon}</span>}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SiteSettingsPage() {
  const supabase = createClient();
  const { toasts, show: showToast, remove: removeToast } = useToast();

  const [mainTab, setMainTab] = useState('basic');
  const [contentPage, setContentPage] = useState('home');
  const [values, setValues] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(null);

  // Core values state
  const [coreValues, setCoreValues] = useState([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvModal, setCvModal] = useState(null);
  const [cvSaving, setCvSaving] = useState(false);
  const [cvDelete, setCvDelete] = useState(null);

  // Impact statistics state
  const [statItems, setStatItems] = useState([]);
  const [statModal, setStatModal] = useState(null); // null | 'add' | stat object
  const [statSaving, setStatSaving] = useState(false);
  const [statDelete, setStatDelete] = useState(null);

  // Founder's message state
  const [founderForm, setFounderForm] = useState({ founder_name: '', founder_title: '', founder_message: '', founder_photo: '' });
  const [founderSaving, setFounderSaving] = useState(false);

  // Load all settings on mount
  useEffect(function () {
    async function load() {
      setLoadingSettings(true);
      try {
        const { data } = await supabase.from('site_settings').select('key, value');
        const map = {};
        (data || []).forEach(function (r) { map[r.key] = r.value; });
        setValues(map);

        // Parse stat items from settings
        const stats = [];
        (data || []).forEach(function (r) {
          if (r.key.startsWith('stat_item_')) {
            try {
              const parsed = JSON.parse(r.value);
              stats.push({ key: r.key, ...parsed });
            } catch (e) { /* skip malformed */ }
          }
        });
        stats.sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
        setStatItems(stats);

        // Pre-fill founder form
        setFounderForm({
          founder_name: map['founder_name'] || '',
          founder_title: map['founder_title'] || '',
          founder_message: map['founder_message'] || '',
          founder_photo: map['founder_photo'] || '',
        });
      } catch (err) {
        showToast('Failed to load settings: ' + err.message, 'error');
      } finally {
        setLoadingSettings(false);
      }
    }
    load();
  }, []);

  // Load core values when on that tab
  useEffect(function () {
    if (mainTab !== 'values') return;
    loadCoreValues();
  }, [mainTab]);

  async function loadCoreValues() {
    setCvLoading(true);
    try {
      const { data, error } = await supabase
        .from('core_values')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setCoreValues(data || []);
    } catch (err) {
      showToast('Failed to load core values: ' + err.message, 'error');
    } finally {
      setCvLoading(false);
    }
  }

  function handleChange(key, val) {
    setValues(function (prev) { return { ...prev, [key]: val }; });
  }

  async function handleSaveSection(prefix, fields) {
    setSaving(prefix);
    try {
      const toSave = {};
      fields.forEach(function (f) {
        const k = prefix + f.key;
        toSave[k] = values[k] || '';
      });
      await upsertSettings(toSave);
      showToast('Section saved successfully!', 'success');
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveKeys(keys, label) {
    setSaving(label);
    try {
      const toSave = {};
      keys.forEach(function (k) { toSave[k] = values[k] || ''; });
      await upsertSettings(toSave);
      showToast((label || 'Settings') + ' saved!', 'success');
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setSaving(null);
    }
  }

  // Core value CRUD
  async function handleCvSave(form) {
    setCvSaving(true);
    try {
      const isEdit = Boolean(form.id);
      if (isEdit) {
        const { error } = await supabase.from('core_values').update({
          name: form.name,
          short_description: form.short_description,
          long_description: form.long_description,
          icon: form.icon,
          color: form.color,
          sort_order: form.sort_order,
          is_active: form.is_active,
        }).eq('id', form.id);
        if (error) throw error;
        await supabase.from('activity_logs').insert({
          action: 'update',
          entity_type: 'core_values',
          entity_id: form.id,
          description: 'Updated core value: ' + form.name,
        });
        showToast('Core value updated!', 'success');
      } else {
        const { data, error } = await supabase.from('core_values').insert({
          name: form.name,
          short_description: form.short_description,
          long_description: form.long_description,
          icon: form.icon,
          color: form.color,
          sort_order: form.sort_order,
          is_active: form.is_active,
        }).select().single();
        if (error) throw error;
        await supabase.from('activity_logs').insert({
          action: 'create',
          entity_type: 'core_values',
          entity_id: data.id,
          description: 'Created core value: ' + form.name,
        });
        showToast('Core value created!', 'success');
      }
      setCvModal(null);
      await loadCoreValues();
    } catch (err) {
      showToast('Failed: ' + err.message, 'error');
    } finally {
      setCvSaving(false);
    }
  }

  async function handleCvDelete(cv) {
    try {
      const { error } = await supabase.from('core_values').delete().eq('id', cv.id);
      if (error) throw error;
      await supabase.from('activity_logs').insert({
        action: 'delete',
        entity_type: 'core_values',
        entity_id: cv.id,
        description: 'Deleted core value: ' + cv.name,
      });
      showToast('Deleted: ' + cv.name, 'success');
      setCvDelete(null);
      await loadCoreValues();
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  }

  async function handleCvToggle(cv) {
    try {
      const { error } = await supabase
        .from('core_values')
        .update({ is_active: !cv.is_active })
        .eq('id', cv.id);
      if (error) throw error;
      showToast((cv.is_active ? 'Deactivated' : 'Activated') + ': ' + cv.name, 'success');
      await loadCoreValues();
    } catch (err) {
      showToast('Failed: ' + err.message, 'error');
    }
  }

  // ─── Impact stat CRUD ─────────────────────────────────────────────────────

  async function handleStatSave(form, existingKey) {
    setStatSaving(true);
    try {
      const key = existingKey || ('stat_item_' + Date.now());
      const jsonValue = JSON.stringify({
        label: form.label,
        value: form.value,
        suffix: form.suffix,
        icon: form.icon,
        sort_order: form.sort_order,
      });
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value: jsonValue }, { onConflict: 'key' });
      if (error) throw error;
      await supabase.from('activity_logs').insert({
        action: existingKey ? 'update' : 'create',
        entity_type: 'site_settings',
        entity_id: key,
        description: (existingKey ? 'Updated' : 'Created') + ' impact stat: ' + form.label,
      });
      showToast(existingKey ? 'Stat updated!' : 'Stat added!', 'success');
      setStatModal(null);
      // Refresh stat items
      const { data } = await supabase.from('site_settings').select('key, value');
      const newMap = {};
      (data || []).forEach(function (r) { newMap[r.key] = r.value; });
      setValues(newMap);
      const stats = [];
      (data || []).forEach(function (r) {
        if (r.key.startsWith('stat_item_')) {
          try { stats.push({ key: r.key, ...JSON.parse(r.value) }); } catch (e) {}
        }
      });
      stats.sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
      setStatItems(stats);
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setStatSaving(false);
    }
  }

  async function handleStatDelete(stat) {
    try {
      const { error } = await supabase.from('site_settings').delete().eq('key', stat.key);
      if (error) throw error;
      await supabase.from('activity_logs').insert({
        action: 'delete',
        entity_type: 'site_settings',
        entity_id: stat.key,
        description: 'Deleted impact stat: ' + stat.label,
      });
      showToast('Stat deleted!', 'success');
      setStatDelete(null);
      setStatItems(function (prev) { return prev.filter(function (s) { return s.key !== stat.key; }); });
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  }

  // ─── Founder's message ────────────────────────────────────────────────────

  function handleFounderChange(field, val) {
    setFounderForm(function (prev) { return { ...prev, [field]: val }; });
  }

  async function handleFounderSave() {
    setFounderSaving(true);
    try {
      await upsertSettings({
        founder_name: founderForm.founder_name,
        founder_title: founderForm.founder_title,
        founder_message: founderForm.founder_message,
        founder_photo: founderForm.founder_photo,
      });
      await supabase.from('activity_logs').insert({
        action: 'update',
        entity_type: 'site_settings',
        entity_id: 'founder_message',
        description: 'Updated Founder\'s Message settings',
      });
      showToast('Founder\'s Message saved!', 'success');
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setFounderSaving(false);
    }
  }

  const MAIN_TABS = [
    { id: 'basic',   label: 'Basic Settings',   icon: <Settings size={15} strokeWidth={1.5} /> },
    { id: 'content', label: 'Content Settings',  icon: <FileText size={15} strokeWidth={1.5} /> },
    { id: 'mission', label: 'Mission & Vision',  icon: <Target size={15} strokeWidth={1.5} /> },
    { id: 'values',  label: 'Core Values',       icon: <Gem size={15} strokeWidth={1.5} /> },
  ];

  if (loadingSettings) {
    return (
      <div className="sp-loading">
        <div className="sp-loading__spinner" />
        <span>Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="sp-page">
      {/* Toast container */}
      <div className="sp-toasts">
        {toasts.map(function (t) {
          return (
            <Toast
              key={t.id}
              message={t.message}
              type={t.type}
              onClose={function () { removeToast(t.id); }}
            />
          );
        })}
      </div>

      {/* Page header */}
      <div className="sp-page-header">
        <div className="sp-page-header__left">
          <div className="sp-page-header__icon-wrap">
            <Settings size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="sp-page-title">Site Settings</h1>
            <p className="sp-page-subtitle">Manage all public-facing content and configuration</p>
          </div>
        </div>
      </div>

      {/* Main tab bar */}
      <TabBar tabs={MAIN_TABS} active={mainTab} onChange={setMainTab} />

      {/* ── SECTION 1: BASIC SETTINGS ── */}
      {mainTab === 'basic' && (
        <div className="sp-panel sp-panel--fade">
          <div className="sp-card">
            <div className="sp-card__header">
              <h3 className="sp-card__title">General Information</h3>
            </div>
            <div className="sp-card__body">
              <SettingField label="Site Title" fieldKey="site_title" value={values['site_title']} onChange={handleChange} />
              <SettingField label="Tagline &amp; Motto" fieldKey="site_tagline" value={values['site_tagline']} onChange={handleChange} multiline />
            </div>
            <div className="sp-card__footer">
              <button
                className="sp-btn sp-btn--primary"
                onClick={function () { handleSaveKeys(['site_title', 'site_tagline'], 'General'); }}
                disabled={saving === 'General'}
              >
                {saving === 'General' ? <><Loader2 size={14} strokeWidth={2} className="sp-btn__spinner" /> Saving…</> : 'Save General Info'}
              </button>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card__header">
              <h3 className="sp-card__title">Contact Information</h3>
            </div>
            <div className="sp-card__body">
              <SettingField label="Primary Email" fieldKey="contact_email" value={values['contact_email']} onChange={handleChange} />
              <SettingField label="WhatsApp Number" fieldKey="contact_whatsapp" value={values['contact_whatsapp']} onChange={handleChange} />
              <SettingField label="Location / Region" fieldKey="contact_location" value={values['contact_location']} onChange={handleChange} />
            </div>
            <div className="sp-card__footer">
              <button
                className="sp-btn sp-btn--primary"
                onClick={function () { handleSaveKeys(['contact_email', 'contact_whatsapp', 'contact_location'], 'Contact'); }}
                disabled={saving === 'Contact'}
              >
                {saving === 'Contact' ? <><Loader2 size={14} strokeWidth={2} className="sp-btn__spinner" /> Saving…</> : 'Save Contact Info'}
              </button>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card__header sp-card__header--between">
              <h3 className="sp-card__title">Impact Statistics</h3>
              <button className="sp-btn sp-btn--primary sp-btn--sm" onClick={function () { setStatModal('add'); }}>
                <Plus size={14} strokeWidth={2.5} /> Add Stat
              </button>
            </div>
            <div className="sp-card__body sp-card__body--flush">
              {statItems.length === 0 && (
                <div className="sp-stat-empty">No stats yet. Add your first one!</div>
              )}
              {statItems.map(function (stat) {
                return (
                  <StatRow
                    key={stat.key}
                    stat={stat}
                    onEdit={function (s) { setStatModal(s); }}
                    onDelete={function (s) { setStatDelete(s); }}
                  />
                );
              })}
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card__header">
              <h3 className="sp-card__title">Founder&apos;s Message</h3>
            </div>
            <div className="sp-card__body">
              <div className="sp-field">
                <label className="sp-label">Founder Name</label>
                <input className="sp-input" placeholder="Alnaf Sajim" value={founderForm.founder_name} onChange={function (e) { handleFounderChange('founder_name', e.target.value); }} />
              </div>
              <div className="sp-field">
                <label className="sp-label">Founder Title</label>
                <input className="sp-input" placeholder="Founder &amp; President, YouthVerse Union" value={founderForm.founder_title} onChange={function (e) { handleFounderChange('founder_title', e.target.value); }} />
              </div>
              <div className="sp-field">
                <label className="sp-label">Main Message</label>
                <textarea className="sp-textarea" rows={5} placeholder="The founder's quote..." value={founderForm.founder_message} onChange={function (e) { handleFounderChange('founder_message', e.target.value); }} />
              </div>
              <div className="sp-field">
                <label className="sp-label">Founder Photo URL</label>
                <input className="sp-input" placeholder="https://..." value={founderForm.founder_photo} onChange={function (e) { handleFounderChange('founder_photo', e.target.value); }} />
                {founderForm.founder_photo && (
                  <div className="sp-founder-preview">
                    <img
                      src={founderForm.founder_photo}
                      alt="Founder preview"
                      className="sp-founder-preview__img"
                      onError={function (e) { e.target.style.display = 'none'; }}
                    />
                    <span className="sp-founder-preview__label">Preview</span>
                  </div>
                )}
              </div>
            </div>
            <div className="sp-card__footer">
              <button className="sp-btn sp-btn--primary" onClick={handleFounderSave} disabled={founderSaving}>
                {founderSaving ? <><Loader2 size={14} strokeWidth={2} className="sp-btn__spinner" /> Saving...</> : "Save Founder's Message"}
              </button>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-card__header">
              <h3 className="sp-card__title">Social Media Links</h3>
            </div>
            <div className="sp-card__body">
              <SettingField label="Facebook URL" fieldKey="social_facebook" value={values['social_facebook']} onChange={handleChange} />
              <SettingField label="Instagram URL" fieldKey="social_instagram" value={values['social_instagram']} onChange={handleChange} />
              <SettingField label="LinkedIn URL" fieldKey="social_linkedin" value={values['social_linkedin']} onChange={handleChange} />
              <SettingField label="WhatsApp Number (for social icon)" fieldKey="social_whatsapp" value={values['social_whatsapp']} onChange={handleChange} />
              <SettingField label="YouTube Channel URL" fieldKey="social_youtube" value={values['social_youtube']} onChange={handleChange} />
            </div>
            <div className="sp-card__footer">
              <button
                className="sp-btn sp-btn--primary"
                onClick={function () { handleSaveKeys(['social_facebook', 'social_instagram', 'social_linkedin', 'social_whatsapp', 'social_youtube'], 'Social'); }}
                disabled={saving === 'Social'}
              >
                {saving === 'Social' ? <><Loader2 size={14} strokeWidth={2} className="sp-btn__spinner" /> Saving…</> : 'Save Social Links'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: CONTENT SETTINGS ── */}
      {mainTab === 'content' && (
        <div className="sp-panel sp-panel--fade">
          <TabBar tabs={CONTENT_PAGES.map(function (p) { return { id: p.id, label: p.label }; })} active={contentPage} onChange={setContentPage} secondary />
          <div className="sp-content-sections">
            {CONTENT_PAGES.filter(function (p) { return p.id === contentPage; }).map(function (page) {
              return page.sections.map(function (sec) {
                return (
                  <SectionBlock
                    key={sec.prefix}
                    title={sec.title}
                    prefix={sec.prefix}
                    fields={sec.fields}
                    values={values}
                    onChange={handleChange}
                    onSave={handleSaveSection}
                    saving={saving}
                  />
                );
              });
            })}
          </div>
        </div>
      )}

      {/* ── SECTION 3: MISSION & VISION ── */}
      {mainTab === 'mission' && (
        <div className="sp-panel sp-panel--fade">
          <SectionBlock title="Mission" prefix="mission_" fields={TEXT_FIELDS} values={values} onChange={handleChange} onSave={handleSaveSection} saving={saving} />
          <SectionBlock title="Vision" prefix="vision_" fields={TEXT_FIELDS} values={values} onChange={handleChange} onSave={handleSaveSection} saving={saving} />
        </div>
      )}

      {/* ── SECTION 4: CORE VALUES ── */}
      {mainTab === 'values' && (
        <div className="sp-panel sp-panel--fade">
          <div className="sp-cv-header">
            <div>
              <h3 className="sp-cv-header__title">Core Values</h3>
              <p className="sp-cv-header__desc">Manage your organisation&apos;s core values displayed on the public site.</p>
            </div>
            <button className="sp-btn sp-btn--primary" onClick={function () { setCvModal('add'); }}>
              <Plus size={16} strokeWidth={2} /> Add Value
            </button>
          </div>

          {cvLoading && (
            <div className="sp-loading">
              <div className="sp-loading__spinner" />
              <span>Loading values…</span>
            </div>
          )}

          {!cvLoading && coreValues.length === 0 && (
            <div className="sp-empty">
              <Gem size={36} strokeWidth={1} className="sp-empty__icon" />
              <p>No core values yet. Add your first one!</p>
            </div>
          )}

          <div className="sp-cv-grid">
            {coreValues.map(function (cv) {
              return (
                <CoreValueCard
                  key={cv.id}
                  coreValue={cv}
                  onEdit={function (v) { setCvModal(v); }}
                  onDelete={function (v) { setCvDelete(v); }}
                  onToggle={handleCvToggle}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Stat Modal */}
      {statModal && (
        <StatModal
          stat={statModal === 'add' ? null : statModal}
          onClose={function () { setStatModal(null); }}
          onSave={handleStatSave}
          saving={statSaving}
        />
      )}

      {/* Stat Delete Confirm */}
      {statDelete && (
        <DeleteConfirm
          title="Delete Impact Stat"
          message={'Are you sure you want to delete the stat "' + statDelete.label + '"? This cannot be undone.'}
          onConfirm={function () { handleStatDelete(statDelete); }}
          onCancel={function () { setStatDelete(null); }}
        />
      )}

      {/* Core Value Modal */}
      {cvModal && (
        <CoreValueModal
          value={cvModal === 'add' ? null : cvModal}
          onClose={function () { setCvModal(null); }}
          onSave={handleCvSave}
          saving={cvSaving}
        />
      )}

      {/* Delete Confirm */}
      {cvDelete && (
        <DeleteConfirm
          title="Delete Core Value"
          message={'Are you sure you want to delete "' + cvDelete.name + '"? This cannot be undone.'}
          onConfirm={function () { handleCvDelete(cvDelete); }}
          onCancel={function () { setCvDelete(null); }}
        />
      )}

      <style>{`
        /* ═══════════════════════════════════════════ 
           SITE SETTINGS PAGE — Premium Executive UI
           Prefix: sp- (settings page)
           ═══════════════════════════════════════════ */

        /* Page wrapper */
        .sp-page {
          padding: 32px 40px;
          max-width: 1280px;
          margin: 0 auto;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          color: var(--navy, #1f2a44);
          background: transparent;
        }

        /* ── Toasts container ── */
        .sp-toasts {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 9999;
        }

        .sp-toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(31, 42, 68, 0.12);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--navy, #1f2a44);
          animation: spSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border-left: 4px solid #c8a75e;
        }

        .sp-toast--success { border-left-color: #10b981; }
        .sp-toast--error { border-left-color: #ef4444; }

        .sp-toast__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
        }
        .sp-toast--success .sp-toast__icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .sp-toast--error .sp-toast__icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        @keyframes spSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* ── Page Header ── */
        .sp-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .sp-page-header__left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sp-page-header__icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid rgba(200, 167, 94, 0.25);
          color: var(--gold, #c8a75e);
          box-shadow: 0 4px 12px rgba(31, 42, 68, 0.03);
        }

        .sp-page-title {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--navy, #1f2a44);
          margin: 0;
        }

        .sp-page-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted, #6b7280);
          margin: 2px 0 0 0;
        }

        /* ── Tab Bar ── */
        .sp-tabbar {
          display: flex;
          gap: 6px;
          background: rgba(31, 42, 68, 0.04);
          padding: 5px;
          border-radius: 12px;
          margin-bottom: 28px;
          border: 1px solid rgba(31, 42, 68, 0.02);
        }

        .sp-tabbar--secondary {
          background: #ffffff;
          border: 1px solid rgba(200, 167, 94, 0.15);
          padding: 6px;
          border-radius: 10px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(31, 42, 68, 0.02);
        }

        .sp-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(31, 42, 68, 0.6);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sp-tab:hover {
          color: var(--navy, #1f2a44);
          background: rgba(31, 42, 68, 0.03);
        }

        .sp-tab--active {
          color: #ffffff !important;
          background: var(--navy, #1f2a44) !important;
          box-shadow: 0 4px 12px rgba(31, 42, 68, 0.15);
        }

        .sp-tabbar--secondary .sp-tab--active {
          background: var(--gold, #c8a75e) !important;
          box-shadow: 0 4px 12px rgba(200, 167, 94, 0.25);
        }

        .sp-tab__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Structural Panel Transitions ── */
        .sp-panel--fade {
          animation: spFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes spFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Content settings blocks stacked layout */
        .sp-content-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Card Styles (Standard Panel Blocks) ── */
        .sp-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(200, 167, 94, 0.15);
          box-shadow: 0 6px 20px rgba(31, 42, 68, 0.03);
          margin-bottom: 24px;
          overflow: hidden;
        }

        .sp-card__header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(31, 42, 68, 0.06);
          background: linear-gradient(180deg, #ffffff 0%, rgba(250, 246, 239, 0.2) 100%);
        }

        .sp-card__header--between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .sp-card__title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--navy, #1f2a44);
          margin: 0;
        }

        .sp-card__body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .sp-card__body--flush {
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .sp-card__footer {
          padding: 16px 24px;
          background: rgba(31, 42, 68, 0.01);
          border-top: 1px solid rgba(31, 42, 68, 0.05);
          display: flex;
          justify-content: flex-end;
        }

        /* ── Dynamic Section Editor Blocks ── */
        .sp-section-block {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(200, 167, 94, 0.16);
          box-shadow: 0 6px 20px rgba(31, 42, 68, 0.03);
          overflow: hidden;
        }

        .sp-section-block__header {
          padding: 18px 24px;
          background: linear-gradient(90deg, rgba(250, 246, 239, 0.4) 0%, #ffffff 100%);
          border-bottom: 1px solid rgba(31, 42, 68, 0.05);
        }

        .sp-section-block__title {
          font-size: 15px;
          font-weight: 700;
          color: var(--navy, #1f2a44);
          margin: 0;
        }

        .sp-section-block__fields {
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        /* Elements spanning full line inside config grid */
        .sp-section-block__fields .sp-field:has(.sp-textarea),
        .sp-section-block__fields .sp-field:has(.sp-input[value*="http"]) {
          grid-column: span 2;
        }

        .sp-section-block__footer {
          padding: 16px 24px;
          background: rgba(31, 42, 68, 0.01);
          border-top: 1px solid rgba(31, 42, 68, 0.05);
          display: flex;
          justify-content: flex-end;
        }

        /* ── Input Fields & Labels ── */
        .sp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sp-label {
          font-size: 0.815rem;
          font-weight: 600;
          color: rgba(31, 42, 68, 0.75);
        }

        .sp-input, .sp-textarea {
          width: 100%;
          padding: 10px 14px;
          font-size: 0.875rem;
          font-weight: 450;
          color: var(--navy, #1f2a44);
          background: #ffffff;
          border: 1px solid rgba(31, 42, 68, 0.15);
          border-radius: 8px;
          box-shadow: inset 0 1px 2px rgba(31, 42, 68, 0.02);
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .sp-input:hover, .sp-textarea:hover {
          border-color: rgba(200, 167, 94, 0.4);
        }

        .sp-input:focus, .sp-textarea:focus {
          border-color: var(--gold, #c8a75e);
          box-shadow: 0 0 0 3px rgba(200, 167, 94, 0.12), inset 0 1px 2px rgba(31, 42, 68, 0.02);
          background: #ffffff;
        }

        .sp-textarea {
          resize: vertical;
          min-height: 80px;
          line-height: 1.5;
        }

        /* ── Buttons ── */
        .sp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 20px;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
        }

        .sp-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed !important;
        }

        .sp-btn--primary {
          background: var(--navy, #1f2a44);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(31, 42, 68, 0.1);
        }
        .sp-btn--primary:hover:not(:disabled) {
          background: #2a395c;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(31, 42, 68, 0.15);
        }

        .sp-btn--ghost {
          background: rgba(31, 42, 68, 0.04);
          color: var(--navy, #1f2a44);
        }
        .sp-btn--ghost:hover:not(:disabled) {
          background: rgba(31, 42, 68, 0.08);
        }

        .sp-btn--danger {
          background: #ef4444;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }
        .sp-btn--danger:hover:not(:disabled) {
          background: #dc2626;
        }

        .sp-btn--success {
          background: #10b981;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }
        .sp-btn--success:hover:not(:disabled) {
          background: #059669;
        }

        .sp-btn--sm {
          padding: 7px 12px;
          font-size: 0.8rem;
          border-radius: 7px;
        }

        .sp-btn--icon {
          padding: 7px;
          width: 28px;
          height: 28px;
          border-radius: 6px;
        }

        .sp-btn__spinner {
          animation: spRotate 1s linear infinite;
        }

        @keyframes spRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ── Impact Statistics Rows ── */
        .sp-stat-empty {
          padding: 24px;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .sp-stat-row {
          display: flex;
          align-items: center;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(31, 42, 68, 0.05);
          transition: background 0.15s ease;
        }

        .sp-stat-row:last-child {
          border-bottom: none;
        }

        .sp-stat-row:hover {
          background: rgba(250, 246, 239, 0.3);
        }

        .sp-stat-row__icon-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 140px;
          color: var(--gold, #c8a75e);
        }

        .sp-stat-row__icon-name {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .sp-stat-row__label {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--navy, #1f2a44);
        }

        .sp-stat-row__value {
          font-size: 0.95rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--navy, #1f2a44);
          width: 100px;
          text-align: right;
          padding-right: 24px;
        }

        .sp-stat-row__order {
          font-size: 0.75rem;
          font-weight: 500;
          color: #ffffff;
          background: rgba(31, 42, 68, 0.4);
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 24px;
        }

        .sp-stat-row__actions {
          display: flex;
          gap: 6px;
        }

        /* Inside Stat Modal preview */
        .sp-stat-icon-preview {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(31, 42, 68, 0.03);
          border-radius: 8px;
        }

        .sp-stat-icon-preview__badge {
          display: inline-flex;
          color: var(--gold);
        }

        .sp-stat-icon-preview__name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--navy);
        }

        /* ── Core Values Section ── */
        .sp-cv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .sp-cv-header__title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--navy);
        }

        .sp-cv-header__desc {
          font-size: 0.815rem;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }

        .sp-cv-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        /* Core value individual item card */
        .sp-cv-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(31, 42, 68, 0.03);
          border: 1px solid rgba(31, 42, 68, 0.06);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .sp-cv-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(31, 42, 68, 0.05);
        }

        .sp-cv-card--expanded {
          grid-column: span 2;
        }

        .sp-cv-card__main {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 16px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          outline: none;
          gap: 14px;
        }

        .sp-cv-card__icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(200, 167, 94, 0.08);
          color: var(--gold, #c8a75e);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .sp-cv-card__info {
          flex: 1;
          min-width: 0;
        }

        .sp-cv-card__name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--navy);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sp-cv-card__short {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sp-cv-card__status {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .sp-cv-card__status--active { background: rgba(16, 185, 129, 0.08); color: #10b981; }
        .sp-cv-card__status--inactive { background: rgba(107, 114, 128, 0.08); color: #6b7280; }

        .sp-cv-card__chevron {
          color: rgba(31, 42, 68, 0.3);
          display: inline-flex;
        }

        .sp-cv-card__details {
          padding: 0 16px 16px 62px;
          border-top: 1px dashed rgba(31, 42, 68, 0.05);
          background: rgba(250, 246, 239, 0.15);
          animation: spSlideDown 0.2s ease;
        }

        @keyframes spSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sp-cv-card__long {
          font-size: 0.85rem;
          line-height: 1.5;
          color: rgba(31, 42, 68, 0.8);
          margin: 12px 0 14px 0;
        }

        .sp-cv-card__actions {
          display: flex;
          gap: 8px;
        }

        /* ── Modals Structure ── */
        .sp-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: spFadeIn 0.2s ease;
        }

        .sp-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(200, 167, 94, 0.2);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: spModalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes spModalScale {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .sp-modal__header {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(31, 42, 68, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sp-modal__title {
          font-size: 16px;
          font-weight: 700;
          color: var(--navy);
          margin: 0;
        }

        .sp-modal__close {
          background: transparent;
          border: none;
          color: rgba(31, 42, 68, 0.4);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
        }
        .sp-modal__close:hover { background: rgba(31, 42, 68, 0.05); color: var(--navy); }

        .sp-modal__body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sp-modal__footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(31, 42, 68, 0.06);
          background: rgba(31, 42, 68, 0.01);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        /* Helpers inside modal form fields layout */
        .sp-row {
          display: flex;
          gap: 14px;
        }

        .sp-color-row {
          display: flex;
          gap: 8px;
        }

        .sp-color-input {
          padding: 0;
          border: 1px solid rgba(31, 42, 68, 0.15);
          width: 38px;
          height: 38px;
          border-radius: 8px;
          cursor: pointer;
          background: none;
        }

        .sp-toggle-row {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 38px;
        }

        .sp-toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: rgba(31, 42, 68, 0.1);
          position: relative;
          cursor: pointer;
          border: none;
          transition: background 0.2s ease;
        }

        .sp-toggle--on {
          background: #10b981;
        }

        .sp-toggle__thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sp-toggle--on .sp-toggle__thumb {
          transform: translateX(20px);
        }

        .sp-toggle__label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--navy);
        }

        .sp-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231f2a44'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          background-size: 14px;
        }

        /* ── Loading & Empty global indicators ── */
        .sp-loading, .sp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          background: #ffffff;
          border-radius: 16px;
          border: 1px dashed rgba(200, 167, 94, 0.25);
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .sp-loading__spinner {
          width: 28px;
          height: 28px;
          border: 3px solid rgba(200, 167, 94, 0.15);
          border-top-color: var(--gold, #c8a75e);
          border-radius: 50%;
          margin-bottom: 12px;
          animation: spRotate 0.8s linear infinite;
        }

        .sp-empty__icon {
          color: rgba(200, 167, 94, 0.3);
          margin-bottom: 12px;
        }

        /* ── Founder photo preview ── */
        .sp-founder-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .sp-founder-preview__img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--gold);
          flex-shrink: 0;
        }

        .sp-founder-preview__label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .sp-page { padding: 20px 16px; }
          .sp-page-title { font-size: 22px; }
          .sp-section-block__fields { grid-template-columns: 1fr; }
          .sp-cv-grid { grid-template-columns: 1fr; }
          .sp-tabbar { gap: 2px; }
          .sp-tab { padding: 8px 11px; font-size: 0.8rem; }
          .sp-section-block__fields .sp-field:has(.sp-textarea),
          .sp-section-block__fields .sp-field:has(.sp-input[value*="http"]) {
            grid-column: span 1;
          }
          .sp-cv-card--expanded { grid-column: span 1; }
          .sp-cv-card__details { padding-left: 16px; }
        }
      `}</style>
    </div>
  );
}