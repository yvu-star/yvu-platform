'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  MessageCircle,
  MapPin,
  ExternalLink,
  Send,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function ContactClient({ settings }) {
  const s = settings || {};

  // DOM element tracking references for animations
  const heroRef = useRef(null);
  const infoRef = useRef(null);
  const formRef = useRef(null);

  // Form Field State
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  // IntersectionObserver Scroll Animation Hook
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const animatedElements = [heroRef.current, infoRef.current, formRef.current];
    animatedElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // 3D Perspective Tilt Control
  const handleMouseMove = (e, targetRef) => {
    if (!targetRef.current) return;
    const card = targetRef.current;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
  };

  const handleMouseLeave = (targetRef) => {
    if (!targetRef.current) return;
    targetRef.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const localErrors = {};
    if (!form.name.trim()) localErrors.name = 'Full name is required';
    if (!form.email.trim()) {
      localErrors.email = 'Email address is required';
    } else if (!form.email.includes('@')) {
      localErrors.email = 'Please introduce a valid email address';
    }
    if (!form.message.trim()) localErrors.message = 'Message context cannot be empty';
    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    const supabase = createClient();

    const { error } = await supabase.from('messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || null,
      message: form.message.trim(),
      is_read: false,
    });

    if (error) {
      setStatus('error');
    } else {
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  const cleanWhatsapp = (s.contact_whatsapp || '').replace(/\D/g, '');

  return (
    <div className="ct-page-wrapper">
      {/* ── SECTION 1: HERO ────────────────────────────────── */}
      <section className="ct-hero reveal-element" ref={heroRef}>
        <div className="ct-hero-inner">
          <h1 className="ct-hero-title stagger-1">
            {s.contact_hero_title ? (
              s.contact_hero_title
            ) : (
              <>
                We&apos;d Love to{' '}
                <span>Hear From You</span>
              </>
            )}
          </h1>
          <p className="ct-hero-desc stagger-2">
            {s.contact_hero_content ??
              'Have a question or want to collaborate? Get in touch with us.'}
          </p>
        </div>
      </section>

      {/* ── SECTION 2: CONTACT BODY ───────────────────────── */}
      <section className="ct-body">
        <div className="ct-layout-grid">

          {/* LEFT: Info Panel Column */}
          <div
            className="ct-info-wrapper reveal-element stagger-1"
            ref={infoRef}
            onMouseMove={(e) => handleMouseMove(e, infoRef)}
            onMouseLeave={() => handleMouseLeave(infoRef)}
          >
            <h3 className="ct-left-title">
              {s.contact_info_title ?? 'Contact Information'}
            </h3>
            <p className="ct-left-sub">
              {s.contact_info_subtitle ?? 'You can also connect with us via social channels.'}
            </p>

            <div className="ct-info-cards">
              {/* Email */}
              <div className="ct-inner-card highlighted">
                <div className="ct-info-icon email-ic">
                  <Mail size={22} color="var(--gold)" />
                </div>
                <div className="ct-info-meta">
                  <h4>Email</h4>
                  <p>
                    <a
                      href={`mailto:${s.contact_email ?? 'youthverseunion@gmail.com'}`}
                      className="ct-info-link"
                    >
                      {s.contact_email ?? 'youthverseunion@gmail.com'}
                    </a>
                  </p>
                </div>
              </div>

              {/* WhatsApp — conditional */}
              {s.contact_whatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ct-inner-card interactive highlighted"
                >
                  <div className="ct-info-icon whatsapp-ic">
                    <MessageCircle size={22} color="#25d366" />
                  </div>
                  <div className="ct-info-meta">
                    <h4>WhatsApp</h4>
                    <p className="ct-info-link-text">
                      {s.contact_whatsapp}{' '}
                      <ExternalLink size={11} style={{ display: 'inline', opacity: 0.5 }} />
                    </p>
                  </div>
                </a>
              )}

              {/* Location */}
              <div className="ct-inner-card highlighted">
                <div className="ct-info-icon location-ic">
                  <MapPin size={22} color="var(--gold)" />
                </div>
                <div className="ct-info-meta">
                  <h4>Location</h4>
                  <p className="ct-info-text-plain">
                    {s.contact_location ?? 'South Asia'}
                  </p>
                </div>
              </div>
            </div>

            <div className="ct-info-divider" />

            {/* Follow Section */}
            <div className="ct-follow-section">
              <h5 className="ct-follow-title">Follow Us</h5>
              <p className="ct-follow-sub">
                Stay continuously tied into our events and networks.
              </p>

              <div className="ct-social-row">
                {s.social_facebook && (
                  <a
                    href={s.social_facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="ct-social-btn ct-s-fb"
                    title="Facebook"
                  >
                    {/* Clean Facebook F icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
                {s.social_instagram && (
                  <a
                    href={s.social_instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="ct-social-btn ct-s-ig"
                    title="Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                )}
                {s.social_linkedin && (
                  <a
                    href={s.social_linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="ct-social-btn ct-s-li"
                    title="LinkedIn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                )}
                {s.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${cleanWhatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ct-social-btn ct-s-wa"
                    title="WhatsApp"
                  >
                    <MessageCircle size={18} color="white" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Form Column Panel */}
          <div
            className="ct-form-card reveal-element stagger-2"
            ref={formRef}
            onMouseMove={(e) => handleMouseMove(e, formRef)}
            onMouseLeave={() => handleMouseLeave(formRef)}
          >
            <h3 className="ct-form-title">
              {s.contact_form_title ?? 'Send us a Message'}
            </h3>
            <p className="ct-form-sub">
              {s.contact_form_subtitle ?? 'Fill out the form below...'}
            </p>

            {status === 'sent' && (
              <div className="ct-status-message ct-success-pane">
                <CheckCircle2 size={18} />
                <span>Message Sent! We&apos;ll get back to you soon.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="ct-status-message ct-error-pane">
                <X size={18} />
                <span>Failed to send. Please try again.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ct-interactive-form">
              <div className="ct-form-row">
                <div className="ct-field">
                  <label className="ct-field-label">
                    Full Name <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`ct-form-input ${errors.name ? 'invalid-border' : ''}`}
                    disabled={status === 'sending'}
                  />
                  {errors.name && (
                    <span className="ct-field-error-text">{errors.name}</span>
                  )}
                </div>

                <div className="ct-field">
                  <label className="ct-field-label">
                    Email Address <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="johndoe@example.com"
                    className={`ct-form-input ${errors.email ? 'invalid-border' : ''}`}
                    disabled={status === 'sending'}
                  />
                  {errors.email && (
                    <span className="ct-field-error-text">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="ct-field">
                <label className="ct-field-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Inquiry Topic (Optional)"
                  className="ct-form-input"
                  disabled={status === 'sending'}
                />
              </div>

              <div className="ct-field">
                <label className="ct-field-label">
                  Your Message <span style={{ color: 'var(--gold)' }}>*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you would like to clarify..."
                  className={`ct-form-textarea ${errors.message ? 'invalid-border' : ''}`}
                  disabled={status === 'sending'}
                />
                {errors.message && (
                  <span className="ct-field-error-text">{errors.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="ct-submit-btn"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  <>
                    <span className="ct-loading-spinner" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}