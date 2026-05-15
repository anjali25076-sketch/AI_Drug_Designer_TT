'use client';

import { useState } from 'react';
import { DRUGS_DB } from '@/lib/data';
import { useRef, useEffect } from 'react';
export default function DrugExplorer() {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedDrug, setSelectedDrug] = useState<any | null>(null);

  const filters = ['All', 'Cardiovascular', 'Oncology', 'Anti-inflammatory', 'CNS', 'Metabolic', 'Antiviral', 'Gastrointestinal'];

  const filteredDrugs = DRUGS_DB.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(input.toLowerCase()) || 
                        d.generic.toLowerCase().includes(input.toLowerCase()) ||
                        d.target.toLowerCase().includes(input.toLowerCase());
    const matchFilter = filter === 'All' || d.cat === filter;
    return matchSearch && matchFilter;
  });

  const getCatColor = (catKey: string) => {
    switch(catKey) {
      case 'cv': return { bg: 'rgba(239,68,68,0.12)', color: '#FC8181' };
      case 'onc': return { bg: 'rgba(139,92,246,0.12)', color: '#A78BFA' };
      case 'av': return { bg: 'rgba(16,185,129,0.12)', color: 'var(--mint)' };
      case 'cns': return { bg: 'rgba(245,158,11,0.12)', color: 'var(--gold)' };
      case 'meta': return { bg: 'rgba(33,150,243,0.12)', color: 'var(--sky)' };
      default: return { bg: 'rgba(126,168,200,0.12)', color: 'var(--muted)' };
    }
  };

  return (
    <div className="anim-fade-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Drug Explorer
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', marginTop: '0.4rem' }}>
          Explore the database of over 15+ approved benchmark compounds and their properties.
        </p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '0.5rem 0.9rem', marginBottom: '1.2rem' }}>
        <span style={{ color: 'var(--muted2)', fontSize: '1rem' }}>SEARCH //</span>
        <input 
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontSize: '0.9rem' }}
          placeholder="Search by name, generic, or target..." 
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border)',
              background: filter === f ? 'rgba(33,150,243,0.12)' : 'none',
              color: filter === f ? 'var(--sky)' : 'var(--muted)',
              fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s',
              borderColor: filter === f ? 'var(--border2)' : 'var(--border)'
            }}
          >
            {f}
          </button>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
        {filteredDrugs.map(drug => {
          const colors = getCatColor(drug.catKey);
          return (
            <div 
              key={drug.id} 
              className="card cardHoverGreen"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.1rem' }}
              onClick={() => setSelectedDrug(drug)}
            >
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.55rem', borderRadius: '20px', display: 'inline-block', marginBottom: '0.2rem', background: colors.bg, color: colors.color }}>
                  {drug.cat}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--white)' }}>{drug.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>{drug.generic}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted2)' }}>TARGET: {drug.target}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted2)' }}>Approved: {drug.approved}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted2)' }}>MW: {drug.mw}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDrug && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedDrug(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '14px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.3rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 10 }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.55rem', borderRadius: '20px', display: 'inline-block', background: getCatColor(selectedDrug.catKey).bg, color: getCatColor(selectedDrug.catKey).color }}>
                  {selectedDrug.cat}
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--white)', marginTop: '0.3rem' }}>{selectedDrug.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{selectedDrug.generic} · Approved {selectedDrug.approved} · {selectedDrug.company}</div>
              </div>
              <button onClick={() => setSelectedDrug(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.4rem' }}>✕</button>
            </div>
            
            <div style={{ padding: '1.3rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div>
                  <div style={{ height: '180px', background: 'rgba(4,17,31,0.6)', borderRadius: '7px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <MiniMoleculeViewer seed={selectedDrug.name} />
                  </div>
                  <div style={{ marginTop: '0.6rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>SMILES</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--sky)', background: 'rgba(4,17,31,0.6)', padding: '0.5rem 0.7rem', borderRadius: '6px', wordBreak: 'break-all', border: '1px solid var(--border)', lineHeight: 1.5 }}>
                      {selectedDrug.smiles}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.7rem' }}>PROPERTIES</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {[
                      ['Formula', selectedDrug.formula],
                      ['MW', selectedDrug.mw + ' g/mol'],
                      ['logP', selectedDrug.logP],
                      ['HBD', selectedDrug.hbd],
                      ['HBA', selectedDrug.hba],
                      ['Half-Life', selectedDrug.halfLife]
                    ].map(([k, v]) => (
                      <div key={k as string} style={{ background: 'rgba(4,17,31,0.5)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted2)', marginBottom: '0.1rem' }}>{k}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--white)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>INDICATION</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text)', background: 'var(--bg3)', padding: '0.6rem 0.8rem', borderRadius: '7px' }}>{selectedDrug.indication}</div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>TARGET & MECHANISM</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--sky)', marginBottom: '0.3rem', fontWeight: 600 }}>TARGET: {selectedDrug.target}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, padding: '0.5rem 0.7rem', background: 'rgba(33,150,243,0.05)', borderRadius: '6px', borderLeft: '2px solid var(--sky)', marginBottom: '0.6rem' }}>
                  {selectedDrug.mechanism}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>ABOUT</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic', padding: '0.5rem 0.7rem', borderRadius: '6px', background: 'rgba(4,17,31,0.4)' }}>
                  {selectedDrug.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniMoleculeViewer({ seed }: { seed: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
      draw(ctx, canvas.width, canvas.height, seed);
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, [seed]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

function draw(ctx: CanvasRenderingContext2D, W: number, H: number, seedStr: string) {
  ctx.clearRect(0, 0, W, H);
  let s = 0;
  for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) & 0xFFFFFFFF;
  const rng = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xFFFFFFFF; };
  
  const atomTypes = [
    { l: 'C', c: '#e5e7eb', glow: 'rgba(255,255,255,0.2)' },
    { l: 'N', c: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },
    { l: 'O', c: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
    { l: 'F', c: '#10b981', glow: 'rgba(16,185,129,0.6)' },
  ];

  const n = 12 + Math.floor(rng() * 8);
  const nodes: {x: number; y: number; type: {l: string; c: string; glow: string}}[] = [];
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.35;
  
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    nodes.push({
      x: cx + Math.cos(a) * r * (0.3 + rng() * 0.7) + (rng() - 0.5) * 20,
      y: cy + Math.sin(a) * r * (0.3 + rng() * 0.7) + (rng() - 0.5) * 20,
      type: atomTypes[Math.floor(rng() * atomTypes.length)]
    });
  }
  
  const bonds = [];
  for (let i = 0; i < n; i++) {
    bonds.push([i, (i + 1) % n]);
    if (rng() > 0.6) bonds.push([i, (i + 2) % n]);
  }
  
  bonds.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
    grad.addColorStop(0, na.type.c);
    grad.addColorStop(1, nb.type.c);
    ctx.strokeStyle = grad;
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
    ctx.lineWidth = 1.5; ctx.stroke();
  });
  
  ctx.globalAlpha = 1.0;
  nodes.forEach(node => {
    ctx.beginPath(); ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(12,12,12,1)'; ctx.fill();
    ctx.strokeStyle = node.type.c; 
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = node.type.c; 
    ctx.font = '500 9px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(node.type.l, node.x, node.y);
  });
}
