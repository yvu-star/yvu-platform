export default function AnalyticsLoading() {
  return (
    <>
      <style>{`
        .analytics-skeleton {
          padding: 2rem 2.5rem;
          max-width: 1280px;
        }
        .sk-heading {
          height: 1.75rem;
          width: 180px;
          background: var(--navy-mid);
          border-radius: var(--radius-sm);
          margin-bottom: 0.4rem;
        }
        .sk-sub {
          height: 0.85rem;
          width: 280px;
          background: var(--navy-mid);
          border-radius: var(--radius-sm);
          margin-bottom: 2.25rem;
          opacity: 0.6;
        }
        .sk-section-label {
          height: 0.75rem;
          width: 120px;
          background: var(--navy-mid);
          border-radius: var(--radius-sm);
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        .sk-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .sk-card {
          background: var(--navy-mid);
          border-radius: var(--radius-md);
          padding: 1.4rem 1.5rem 1.2rem;
          height: 110px;
        }
        .sk-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .sk-panel {
          background: var(--navy-mid);
          border-radius: var(--radius-md);
          height: 220px;
        }
        .sk-table {
          background: var(--navy-mid);
          border-radius: var(--radius-md);
          height: 160px;
          margin-bottom: 2.5rem;
        }
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 0.85; }
          100% { opacity: 0.5; }
        }
        .sk-card, .sk-panel, .sk-table, .sk-heading, .sk-sub, .sk-section-label {
          animation: shimmer 1.6s ease-in-out infinite;
        }
        @media (max-width: 1100px) {
          .sk-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .sk-grid-2 { grid-template-columns: 1fr; }
          .analytics-skeleton { padding: 1.25rem 1rem; }
        }
        @media (max-width: 600px) {
          .sk-grid-4 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      <div className="analytics-skeleton">
        <div className="sk-heading" />
        <div className="sk-sub" />

        <div className="sk-section-label" />
        <div className="sk-grid-4">
          <div className="sk-card" />
          <div className="sk-card" />
          <div className="sk-card" />
          <div className="sk-card" />
        </div>

        <div className="sk-section-label" />
        <div className="sk-grid-2">
          <div className="sk-panel" />
          <div className="sk-panel" />
        </div>

        <div className="sk-section-label" />
        <div className="sk-table" />

        <div className="sk-section-label" />
        <div className="sk-grid-2">
          <div className="sk-panel" />
          <div className="sk-panel" />
        </div>
      </div>
    </>
  );
}