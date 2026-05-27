export default function Loading() {
  return (
    <div className="admin-page">
      {/* header skeleton */}
      <div className="admin-page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{
            height: 28, width: 160, borderRadius: 6,
            background: 'var(--beige)', marginBottom: 8,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            height: 14, width: 100, borderRadius: 4,
            background: 'var(--beige)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            height: 36, width: 80, borderRadius: 6,
            background: 'var(--beige)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            height: 36, width: 130, borderRadius: 6,
            background: 'var(--beige)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* search + tabs skeleton */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{
          height: 38, width: 220, borderRadius: 6,
          background: 'var(--beige)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        {[1,2,3,4].map(function(n) {
          return (
            <div key={n} style={{
              height: 38, width: 72, borderRadius: 6,
              background: 'var(--beige)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          )
        })}
      </div>

      {/* grid skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
      }}>
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(function(n) {
          return (
            <div key={n} style={{
              borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--beige-dark)',
              background: '#fff',
            }}>
              <div style={{
                height: 130,
                background: 'var(--beige)',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: (n * 60) + 'ms',
              }} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{
                  height: 10, borderRadius: 4,
                  background: 'var(--beige)', width: '75%', marginBottom: 6,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: (n * 60) + 'ms',
                }} />
                <div style={{
                  height: 8, borderRadius: 4,
                  background: 'var(--beige)', width: '45%',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: (n * 60) + 'ms',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}