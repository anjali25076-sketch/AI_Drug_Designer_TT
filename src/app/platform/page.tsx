'use client';

import { useEffect, useRef, MouseEvent } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// Interactive Stat Card with futuristic mouse glow effect
function StatCard({ icon, title, value, sub, subUp }: { icon: string, title: string, value: string, sub: string, subUp: boolean }) {
  return (
    <div className={`${styles.statCard} cardHoverGreen`}>
      <div className={styles.statHeader}>
        <div className={styles.statIcon}>{icon}</div>
        {title}
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={`${styles.statSub} ${!subUp ? styles.negative : ''}`}>
        {subUp ? '↑' : '↓'} {sub}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Advanced HUD-style 3D molecule
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * 2; // High DPI
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };

    window.addEventListener('resize', resize);
    resize();

    let time = 0;
    let animationId: number;
    const render = () => {
      time += 0.015;
      drawHUDMolecule(ctx, canvas.width / 2, canvas.height / 2, time);
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`anim-fade-up ${styles.dashboard}`}>
      {/* LEFT COLUMN */}
      <div className={styles.leftCol}>
        <div className={styles.header}>
          <h1>Overview Of <span>Platform</span></h1>
          <p>Accelerated Discovery: Generation, Simulation, Affinity, Safety.</p>
        </div>

        <div className={styles.statsRow}>
          <StatCard icon="↻" title="Generated" value="1,524" sub="50% This week" subUp={true} />
          <StatCard icon="✧" title="Precision" value="98.2%" sub="2.1% Accuracy" subUp={true} />
          <StatCard icon="⚡" title="Compute" value="129h" sub="12% Optimization" subUp={false} />
        </div>

        <div className={styles.glassPanel} style={{ padding: '1.5rem' }}>
          <div className={styles.sectionTitle}>
            Active Pipelines
            <span className={styles.seeAll}>View All</span>
          </div>
          <div className={styles.calendarRow}>
            {['Thr', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'].map((day, i) => (
              <div key={i} className={`${styles.calDay} ${day === 'Mon' ? styles.active : ''}`}>
                <div className={styles.calDayName}>{day}</div>
                <div className={styles.calDayNum}>{15 + i}</div>
              </div>
            ))}
          </div>

          <div className={styles.jobRow}>
            <div className={styles.jobCard} style={{ cursor: 'default' }}>
              <div className={styles.jobInfo}>
                <div className={styles.jobAvatar}>A</div>
                <div>
                  <div className={styles.jobTitle}>PARP1 Inhibitor Generation</div>
                  <div className={styles.jobDesc}>Started -- Apr 28, 10:20am -- Status: In Progress</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Running</div>
            </div>
            <div className={styles.jobCard} style={{ cursor: 'default' }}>
              <div className={styles.jobInfo}>
                <div className={styles.jobAvatar} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>M</div>
                <div>
                  <div className={styles.jobTitle}>Mpro Docking Simulation</div>
                  <div className={styles.jobDesc}>Completed -- Apr 28, 02:40am -- 5 candidates generated</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sky)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complete</div>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.sectionTitle}>
            Recent Pipeline History
            <span className={styles.seeAll}>Filter ∨</span>
          </div>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Target Node</th>
                <th>Timestamp</th>
                <th>Compute</th>
                <th>Best Affinity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className={styles.categoryTag}><div className={styles.dot}></div> EGFR Mutants</span></td>
                <td>20 Apr, 2026</td>
                <td>45m</td>
                <td style={{ color: '#10b981', fontWeight: 500 }}>-9.2 kcal/mol</td>
              </tr>
              <tr>
                <td><span className={styles.categoryTag}><div className={styles.dot} style={{background: '#3b82f6', boxShadow: '0 0 10px #3b82f6'}}></div> BACE1</span></td>
                <td>18 Apr, 2026</td>
                <td>1h 20m</td>
                <td style={{ color: '#10b981', fontWeight: 500 }}>-8.7 kcal/mol</td>
              </tr>
              <tr>
                <td><span className={styles.categoryTag}><div className={styles.dot} style={{background: '#8b5cf6', boxShadow: '0 0 10px #8b5cf6'}}></div> KRAS G12C</span></td>
                <td>16 Apr, 2026</td>
                <td>60m</td>
                <td style={{ color: '#10b981', fontWeight: 500 }}>-10.1 kcal/mol</td>
              </tr>
              <tr>
                <td><span className={styles.categoryTag}><div className={styles.dot} style={{background: '#fbbf24', boxShadow: '0 0 10px #fbbf24'}}></div> SARS-CoV-2 Mpro</span></td>
                <td>10 Apr, 2026</td>
                <td>1h 30m</td>
                <td style={{ color: '#10b981', fontWeight: 500 }}>-8.5 kcal/mol</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className={`${styles.rightCol} ${styles.glassPanel}`}>
        <div className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>
          Top Candidate Statistic
          <span className={styles.seeAll}>≡</span>
        </div>

        <div className={styles.moleculeContainer}>
          <canvas ref={canvasRef} className={styles.moleculeCanvas} />
        </div>

        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Affinity</div>
            <div className={styles.miniStatValue}>-9.8<span className={styles.miniStatUnit}>kcal</span></div>
          </div>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Toxicity</div>
            <div className={styles.miniStatValue}>2.1<span className={styles.miniStatUnit}>%</span></div>
          </div>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Weight</div>
            <div className={styles.miniStatValue}>312<span className={styles.miniStatUnit}>g/m</span></div>
          </div>
        </div>

        <div className={styles.graphSection}>
          <div className={styles.graphHeader}>
            <div className={styles.graphTitle}>Binding Profile</div>
            <select className={styles.graphSelect}>
              <option>Real Time</option>
            </select>
          </div>
          
          <div className={styles.graphBody}>
            <div className={styles.yAxis}>
              <span>120</span>
              <span>100</span>
              <span>70</span>
              <span>60</span>
              <span>40</span>
            </div>
            <div className={styles.bars}>
              {[60, 40, 80, 50, 90, 70, 85, 45, 95, 65, 80, 55, 100, 75, 85, 60].map((h, i) => (
                <div key={i} className={styles.barCol}>
                  <div className={`${styles.barSegment} ${i === 12 ? styles.active : ''}`} style={{ height: `${h * 0.6}%` }}></div>
                  <div className={`${styles.barSegment} ${i === 12 ? styles.active : ''}`} style={{ height: `${h * 0.4}%`, opacity: 0.3 }}></div>
                </div>
              ))}
            </div>
            <div className={styles.xAxis}>
              <span>9:10</span>
              <span>9:11</span>
              <span>9:12</span>
              <span>9:13</span>
              <span>9:14</span>
              <span>9:15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimalistic futuristic HUD molecule
function drawHUDMolecule(ctx: CanvasRenderingContext2D, W: number, H: number, time: number) {
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2;
  const cy = H / 2;
  
  // Complex abstract geometric lattice
  const nodes = [];
  const numNodes = 12;
  for(let i=0; i<numNodes; i++) {
    const phi = Math.acos(-1 + (2 * i) / numNodes);
    const theta = Math.sqrt(numNodes * Math.PI) * phi;
    
    nodes.push({
      x: 40 * Math.cos(theta) * Math.sin(phi),
      y: 40 * Math.sin(theta) * Math.sin(phi),
      z: 40 * Math.cos(phi),
      type: i % 3 === 0 ? 'Core' : 'Edge'
    });
  }

  // Rotation matrices
  const cosY = Math.cos(time * 0.4);
  const sinY = Math.sin(time * 0.4);
  const cosX = Math.cos(time * 0.2);
  const sinX = Math.sin(time * 0.2);
  
  const projected = nodes.map(a => {
    let x1 = a.x * cosY - a.z * sinY;
    let z1 = a.z * cosY + a.x * sinY;
    let y1 = a.y * cosX - z1 * sinX;
    let z2 = z1 * cosX + a.y * sinX;
    
    const scale = 200 / (200 + z2);
    return {
      x: cx + x1 * scale * 1.8,
      y: cy + y1 * scale * 1.8,
      scale: scale,
      z: z2,
      type: a.type
    };
  });
  
  // Draw ultra-thin connection lines
  ctx.lineWidth = 1;
  for(let i=0; i<projected.length; i++) {
    for(let j=i+1; j<projected.length; j++) {
      const dist = Math.hypot(projected[i].x - projected[j].x, projected[i].y - projected[j].y);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        
        // Fading opacity based on distance and Z-depth
        const alpha = Math.max(0, 1 - (dist / 100)) * ((projected[i].scale + projected[j].scale) / 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.6})`;
        ctx.stroke();
      }
    }
  }
  
  // Draw glowing nodes
  projected.sort((a, b) => b.z - a.z).forEach(p => {
    const radius = p.type === 'Core' ? 4 * p.scale : 2 * p.scale;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    
    if (p.type === 'Core') {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15 * p.scale;
    } else {
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    
    // Dim back nodes
    ctx.globalAlpha = Math.max(0.2, p.scale);
    ctx.fill();
    ctx.globalAlpha = 1; // reset
  });
  
  // Outer decorative HUD rings
  ctx.beginPath();
  ctx.arc(cx, cy, 90, time, time + Math.PI * 1.5);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 105, -time * 0.8, -time * 0.8 + Math.PI);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.stroke();
}
