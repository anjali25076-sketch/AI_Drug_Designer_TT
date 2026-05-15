import { useEffect, useRef } from 'react';
import { Candidate } from '@/lib/db';
import styles from './MoleculeViewer.module.css';

export default function MoleculeViewer({ candidate, onClose }: { candidate: Candidate, onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full container size
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw(ctx, canvas.width, canvas.height, candidate.mol_id);
    };
    
    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, [candidate.mol_id]);

  return (
    <div className={styles.overlay}>
      <div className={styles.splitContainer}>
        <div className={styles.visualPane}>
          <canvas ref={canvasRef} className={styles.canvas} />
          <div className={styles.visualData}>
            <div className={styles.formula}>{candidate.molecular_formula}</div>
            <div className={styles.smiles}>{candidate.smiles}</div>
          </div>
        </div>
        
        <div className={styles.dataPane}>
          <div className={styles.header}>
            <div>
              <div className={styles.badge}>Candidate</div>
              <h2 className={styles.title}>{candidate.mol_id}</h2>
              <p className={styles.name}>{candidate.name}</p>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>Close</button>
          </div>

          <div className={styles.grid}>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Affinity Score</div>
              <div className={styles.statValue}>{candidate.affinity_score.toFixed(1)} <span className={styles.statUnit}>/ 10</span></div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Toxicity Risk</div>
              <div className={styles.statValue}>{candidate.toxicity_pct.toFixed(1)} <span className={styles.statUnit}>%</span></div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Molecular Weight</div>
              <div className={styles.statValue}>{candidate.molecular_weight.toFixed(0)} <span className={styles.statUnit}>g/mol</span></div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Lipinski Rules</div>
              <div className={styles.statValue}>{candidate.drug_likeness}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>logP</div>
              <div className={styles.statValue}>{candidate.logP.toFixed(2)}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>HBD / HBA</div>
              <div className={styles.statValue}>{candidate.hbd} / {candidate.hba}</div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Mechanism of Action</h3>
            <p className={styles.text}>{candidate.mechanism}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>AI Evaluation</h3>
            <p className={styles.text}>{candidate.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Futuristic multi-colored molecule graph
function draw(ctx: CanvasRenderingContext2D, W: number, H: number, seedStr: string) {
  ctx.clearRect(0, 0, W, H);
  let s = 0;
  for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) & 0xFFFFFFFF;
  const rng = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xFFFFFFFF; };
  
  const atomTypes = [
    { l: 'C', c: '#e5e7eb', glow: 'rgba(255,255,255,0.2)' },
    { l: 'C', c: '#e5e7eb', glow: 'rgba(255,255,255,0.2)' },
    { l: 'N', c: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },
    { l: 'O', c: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
    { l: 'S', c: '#fbbf24', glow: 'rgba(251,191,36,0.6)' },
    { l: 'F', c: '#10b981', glow: 'rgba(16,185,129,0.6)' },
    { l: 'Cl', c: '#34d399', glow: 'rgba(52,211,153,0.6)' },
  ];

  const n = 15 + Math.floor(rng() * 10);
  const nodes: {x: number; y: number; type: {l: string; c: string; glow: string}}[] = [];
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.35;
  
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    nodes.push({
      x: cx + Math.cos(a) * r * (0.3 + rng() * 0.7) + (rng() - 0.5) * 40,
      y: cy + Math.sin(a) * r * (0.3 + rng() * 0.7) + (rng() - 0.5) * 40,
      type: atomTypes[Math.floor(rng() * atomTypes.length)]
    });
  }
  
  const bonds = [];
  for (let i = 0; i < n; i++) {
    bonds.push([i, (i + 1) % n]);
    if (rng() > 0.6) bonds.push([i, (i + 2) % n]);
    if (rng() > 0.8) bonds.push([i, (i + 3) % n]);
  }
  
  // Draw bonds
  bonds.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    const dbl = rng() > 0.75;
    
    // Gradient stroke
    const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
    grad.addColorStop(0, na.type.c);
    grad.addColorStop(1, nb.type.c);

    ctx.strokeStyle = grad;
    ctx.globalAlpha = 0.5;

    if (dbl) {
      const dx = nb.y - na.y, dy = na.x - nb.x, l = Math.hypot(dx, dy);
      const ox = (dx / l) * 3, oy = (dy / l) * 3;
      ctx.beginPath(); ctx.moveTo(na.x + ox, na.y + oy); ctx.lineTo(nb.x + ox, nb.y + oy);
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(na.x - ox, na.y - oy); ctx.lineTo(nb.x - ox, nb.y - oy);
      ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
      ctx.lineWidth = 2; ctx.stroke();
    }
  });
  
  ctx.globalAlpha = 1.0;

  // Draw nodes
  nodes.forEach(node => {
    // Glow
    ctx.beginPath(); ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(12,12,12,1)'; ctx.fill();
    
    ctx.shadowColor = node.type.glow;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = node.type.c; 
    ctx.lineWidth = 1.5; 
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    ctx.fillStyle = node.type.c; 
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(node.type.l, node.x, node.y);
  });
}
