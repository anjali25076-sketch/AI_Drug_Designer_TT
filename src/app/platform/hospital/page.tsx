'use client';

export default function HospitalNetwork() {
  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Hospital Network
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Federated learning across 6 hospital nodes — patient data never leaves the source
          </p>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          GDPR / HIPAA Compliant
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card cardHoverGreen" style={{ borderTop: '3px solid var(--accent)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)' }}>6</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Hospital Nodes</div>
        </div>
        <div className="card cardHoverGreen" style={{ borderTop: '3px solid var(--gold)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)' }}>3,714</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Patients Anonymized</div>
        </div>
        <div className="card cardHoverGreen" style={{ borderTop: '3px solid var(--sky)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)' }}>156</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Training Rounds</div>
        </div>
        <div className="card cardHoverGreen" style={{ borderTop: '3px solid #8B5CF6' }}>
          <div style={{ color: 'var(--muted)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)' }}>94.2%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Global Accuracy</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--white)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Live Federated Network
            </h3>
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '3rem', position: 'relative', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              {/* Central Node */}
              <div style={{ width: '80px', height: '80px', background: 'rgba(33, 150, 243, 0.15)', borderRadius: '50%', border: '2px solid var(--sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky)', fontWeight: 700, fontSize: '0.8rem', zIndex: 10, textAlign: 'center', lineHeight: 1.2 }}>GLOBAL<br/>MODEL</div>
              
              {/* Satellite Nodes */}
              <Node label="AIIMS" angle={0} color="var(--sky)" />
              <Node label="Tata" angle={60} color="var(--sky)" />
              <Node label="Apollo" angle={120} color="var(--gold)" />
              <Node label="PGI" angle={180} color="var(--sky)" />
              <Node label="KEM" angle={240} color="var(--muted)" />
              <Node label="Fortis" angle={300} color="var(--sky)" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1rem' }}>Gradient updates flow center-ward. Raw patient data stays within hospital firewall.</p>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--white)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Privacy Architecture
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Step num={1} title="Local Training" desc="Each hospital trains on its own data — zero raw records transmitted." />
              <Step num={2} title="Gradient Sharing" desc="Only encrypted model weight gradients are sent to the aggregator." />
              <Step num={3} title="Differential Privacy" desc="Gaussian noise (ε=0.87) prevents membership inference attacks." />
              <Step num={4} title="FedAvg Aggregation" desc="Global model updated, redistributed back to all hospitals." />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--white)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Accuracy over Rounds (baseline: 71.3%)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[71.3, 74.1, 77.8, 80.4, 82.9, 85.2, 87.6, 89.1].map((val, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', width: '60px' }}>Round {13 * (i + 1)}</div>
                  <div style={{ flex: 1, height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${val}%`, height: '100%', background: 'var(--sky)', borderRadius: '3px' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--white)', width: '40px', textAlign: 'right' }}>{val}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Node({ label, angle, color }: { label: string, angle: number, color: string }) {
  const radius = 100;
  const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
  const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
  
  return (
    <>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '1px', height: `${radius}px`,
        background: `linear-gradient(to top, rgba(255,255,255,0), ${color} 50%, rgba(255,255,255,0))`,
        transformOrigin: 'top center',
        transform: `rotate(${angle + 180}deg)`,
        opacity: 0.3
      }} />
      <div style={{
        position: 'absolute',
        top: `calc(50% + ${y}px)`,
        left: `calc(50% + ${x}px)`,
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
        zIndex: 20
      }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
      </div>
    </>
  );
}

function Step({ num, title, desc }: { num: number, title: string, desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--sky)', color: 'var(--sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
        {num}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600, marginBottom: '0.2rem' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{desc}</div>
      </div>
    </div>
  );
}
