import { useEffect, useRef } from 'react';
import styles from './MoleculeViewer.module.css';

export type ProteinTarget = {
  pdbId: string;
  name: string;
  classification: string;
  resolution: string;
  organism: string;
  method: string;
  macromolecule: string;
  description: string;
};

export default function ProteinViewer({ target, onClose }: { target: ProteinTarget, onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawProteinRibbon(ctx, canvas.width, canvas.height, target.pdbId);
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Setup animation loop
    let animationFrameId: number;
    let time = 0;
    
    const render = () => {
      time += 0.01;
      drawProteinRibbon(ctx, canvas.width, canvas.height, target.pdbId, time);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [target.pdbId]);

  return (
    <div className={styles.overlay}>
      <div className={styles.splitContainer}>
        <div className={styles.visualPane}>
          <canvas ref={canvasRef} className={styles.canvas} />
          <div className={styles.visualData}>
            <div className={styles.formula}>3D Structure Rendering</div>
            <div className={styles.smiles}>Hardware Acceleration Enabled • View: Ribbon</div>
          </div>
        </div>
        
        <div className={styles.dataPane}>
          <div className={styles.header}>
            <div>
              <div className={styles.badge}>Protein Target</div>
              <h2 className={styles.title}>{target.pdbId}</h2>
              <p className={styles.name}>{target.name}</p>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>Close</button>
          </div>

          <div className={styles.grid}>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Classification</div>
              <div className={styles.statValue} style={{ fontSize: '1rem' }}>{target.classification}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Resolution</div>
              <div className={styles.statValue}>{target.resolution}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Method</div>
              <div className={styles.statValue} style={{ fontSize: '1rem' }}>{target.method}</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Organism</div>
              <div className={styles.statValue} style={{ fontSize: '0.9rem' }}>{target.organism}</div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Macromolecule Details</h3>
            <p className={styles.text}>{target.macromolecule}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Biological Function</h3>
            <p className={styles.text}>{target.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Complex ribbon-like drawing for proteins
function drawProteinRibbon(ctx: CanvasRenderingContext2D, W: number, H: number, seedStr: string, time: number = 0) {
  ctx.clearRect(0, 0, W, H);
  let s = 0;
  for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) & 0xFFFFFFFF;
  const rng = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xFFFFFFFF; };
  
  const cx = W / 2, cy = H / 2;
  const numChains = 2 + Math.floor(rng() * 3);
  const colors = [
    ['#38bdf8', '#0284c7'],
    ['#34d399', '#059669'],
    ['#a78bfa', '#7c3aed'],
    ['#fbbf24', '#d97706'],
    ['#f472b6', '#db2777']
  ];

  // Draw background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
  }
  for (let i = 0; i < H; i += 40) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
  }

  // Draw 3D-like ribbon chains
  for (let chain = 0; chain < numChains; chain++) {
    const colorPair = colors[Math.floor(rng() * colors.length)];
    const numPoints = 60 + Math.floor(rng() * 40);
    const radius = Math.min(W, H) * 0.3 * (0.5 + rng() * 0.5);
    
    // Base frequency for this chain
    const freq1 = 1 + rng() * 3;
    const freq2 = 1 + rng() * 3;
    const phase1 = rng() * Math.PI * 2;
    const phase2 = rng() * Math.PI * 2;
    const speed = 0.5 + rng() * 1.5;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        const angle = t * Math.PI * 2 * freq1 + phase1 + time * speed;
        
        // Complex 3D-like parametric equation
        const x = cx + Math.cos(angle) * radius * Math.sin(t * Math.PI * freq2 + phase2) + Math.cos(time * 0.5 + t * 10) * 20;
        const y = cy + Math.sin(angle) * radius * Math.cos(t * Math.PI * freq2) + Math.sin(time * 0.5 + t * 10) * 20;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      // Pass 0: shadow/outline, Pass 1: inner glow
      if (pass === 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 12;
        ctx.stroke();
      } else {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, colorPair[0]);
        grad.addColorStop(1, colorPair[1]);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    }
  }

  // Add some glowing "active sites" or ligands
  const numSites = 3 + Math.floor(rng() * 5);
  for (let i = 0; i < numSites; i++) {
    const sx = cx + (rng() - 0.5) * W * 0.5 + Math.sin(time + i) * 10;
    const sy = cy + (rng() - 0.5) * H * 0.5 + Math.cos(time + i) * 10;
    
    ctx.beginPath();
    ctx.arc(sx, sy, 8 + Math.sin(time * 3 + i) * 2, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981'; // Green accent
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }
}
