export default function SkeletonBattle() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton" style={{ width: 160, height: 24 }} />
          <div className="skeleton" style={{ width: 100, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: 110, height: 32, borderRadius: 9999 }} />
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div className="skeleton" style={{ width: 90, height: 22, borderRadius: 9999 }} />
          <div className="skeleton" style={{ width: 220, height: 28 }} />
          <div className="skeleton" style={{ width: 180, height: 16 }} />
        </div>

        {/* Tap instruction */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="skeleton" style={{ width: 80, height: 14 }} />
        </div>

        {/* Battle cards */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ borderRadius: 14, height: 200 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ borderRadius: 14, height: 200 }} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '16px 20px 24px', borderTop: '1px solid #E0D4B8' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="skeleton" style={{ width: 140, height: 18 }} />
        </div>
      </footer>
    </div>
  );
}
