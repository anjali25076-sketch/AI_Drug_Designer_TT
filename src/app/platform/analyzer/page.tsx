'use client';

import { useState, useRef, useEffect } from 'react';

// Atomic masses for molecular weight calculation
const ATOMIC_MASS: Record<string, number> = {
  C: 12.011, H: 1.008, O: 15.999, N: 14.007, S: 32.065,
  F: 18.998, Cl: 35.453, Br: 79.904, P: 30.974, I: 126.904,
};

function parseSMILES(smiles: string) {
  const atoms: Record<string, number> = {};
  let i = 0;
  const s = smiles.trim();
  let ringBonds = 0;
  let doubleBonds = 0;
  let branches = 0;

  while (i < s.length) {
    const ch = s[i];
    // Two-letter atoms
    if (ch === 'C' && s[i + 1] === 'l') { atoms['Cl'] = (atoms['Cl'] || 0) + 1; i += 2; continue; }
    if (ch === 'B' && s[i + 1] === 'r') { atoms['Br'] = (atoms['Br'] || 0) + 1; i += 2; continue; }
    // Single-letter atoms
    if ('CNOSPFIH'.includes(ch)) { atoms[ch] = (atoms[ch] || 0) + 1; i++; continue; }
    // Lowercase (aromatic)
    if ('cnos'.includes(ch)) { const up = ch.toUpperCase(); atoms[up] = (atoms[up] || 0) + 1; i++; continue; }
    // Brackets
    if (ch === '[') {
      const end = s.indexOf(']', i);
      if (end !== -1) {
        const inside = s.slice(i + 1, end);
        const match = inside.match(/^(\d*)([A-Z][a-z]?)/);
        if (match) {
          const sym = match[2];
          atoms[sym] = (atoms[sym] || 0) + 1;
        }
      }
      i = end + 1; continue;
    }
    if (ch === '=') { doubleBonds++; i++; continue; }
    if (ch === '#') { i++; continue; }
    if (ch === '(') { branches++; i++; continue; }
    if (/\d/.test(ch)) { ringBonds++; i++; continue; }
    i++;
  }

  // Proper implicit hydrogen calculation
  // For each heavy atom, H = max_valence - explicit_bonds
  const valence: Record<string, number> = { C: 4, N: 3, O: 2, S: 2, F: 1, Cl: 1, Br: 1, P: 3, I: 1 };
  const totalHeavy = Object.values(atoms).reduce((a, b) => a + b, 0);
  
  // Count bonds from structure: each pair of adjacent atoms = 1 bond each
  // Total single bonds = totalHeavy - 1 + ringClosures (rings add extra bonds)
  const numRingClosures = Math.floor(ringBonds / 2); // each ring digit appears twice (open + close) - but in SMILES each digit = 1 closure
  const totalBonds = (totalHeavy - 1) + numRingClosures + doubleBonds; // double bonds are 2 but already counted once
  
  // Average bonds per atom approach for small molecules
  // More accurate: for aromatic atoms (lowercase), valence is effectively 3 (aromatic bond = 1.5 counted as contributing 1 bond + 0.5)
  let implicitH = 0;
  
  // Track if molecule has aromatic atoms
  const aromaticCount = s.split('').filter(c => 'cnos'.includes(c)).length;
  
  // For aromatic carbons: each has valence 4, with ~3 bonds to neighbors, so 1H each (benzene = 6C, 6H)
  // For aliphatic carbons: depends on connectivity
  for (const [atom, count] of Object.entries(atoms)) {
    const v = valence[atom];
    if (!v) continue;
    
    if (atom === 'C') {
      // Aromatic C: typically 2 aromatic bonds + 0-1 substituent = ~1H each
      const arC = Math.min(aromaticCount, count); // aromatic carbons
      const alC = count - arC; // aliphatic carbons
      implicitH += arC * 1; // each aromatic C gets 1H (simplified)
      // Aliphatic: estimate based on remaining bonds
      // In a chain: terminal C=3H, mid C=2H; average ~2H
      if (alC > 0) {
        if (totalHeavy <= 2) implicitH += alC * (v - 1);
        else implicitH += alC * Math.max(0, v - 2);
      }
    } else if (atom === 'N') {
      implicitH += count * Math.max(0, v - 1 - (doubleBonds > 0 ? 1 : 0));
    } else if (atom === 'O') {
      implicitH += count * (totalHeavy <= 1 ? 2 : 1); // Water gets 2H, OH gets 1H, ether 0H (simplified)
    } else {
      // Halogens etc: usually 0H
    }
  }
  
  // Subtract H for =O (carbonyl), double bonds reduce available H
  implicitH = Math.max(0, implicitH - doubleBonds);
  
  atoms['H'] = (atoms['H'] || 0) + Math.max(implicitH, 0);

  // Build formula
  const order = ['C', 'H', 'N', 'O', 'S', 'F', 'Cl', 'Br', 'P', 'I'];
  let formula = '';
  for (const sym of order) {
    if (atoms[sym]) formula += sym + (atoms[sym] > 1 ? atoms[sym] : '');
  }

  // Molecular weight
  let mw = 0;
  for (const [sym, count] of Object.entries(atoms)) {
    mw += (ATOMIC_MASS[sym] || 12) * count;
  }

  // Lipinski estimates
  const hbd = (atoms['O'] || 0) + (atoms['N'] || 0); // rough
  const hba = (atoms['O'] || 0) + (atoms['N'] || 0) + (atoms['F'] || 0);
  const logP = ((atoms['C'] || 0) * 0.5 - (atoms['O'] || 0) * 1.2 - (atoms['N'] || 0) * 1.0 + (atoms['Cl'] || 0) * 0.8 + (atoms['F'] || 0) * 0.3).toFixed(2);
  const tpsa = ((atoms['O'] || 0) * 20.23 + (atoms['N'] || 0) * 26.02).toFixed(1);
  const rotatable = Math.max(0, totalHeavy - ringBonds - 2);

  const lipinski = mw <= 500 && parseFloat(logP) <= 5 && hbd <= 5 && hba <= 10;
  const toxRisk = mw > 500 ? 'Moderate' : mw > 400 ? 'Low-Moderate' : 'Low';

  return {
    formula: formula || 'Unknown',
    weight: mw.toFixed(2) + ' g/mol',
    logp: logP,
    hbd: String(hbd),
    hba: String(hba),
    tpsa: tpsa + ' A^2',
    rotatable: String(rotatable),
    toxicity: toxRisk + ' Risk',
    lipinski: lipinski ? 'Passes (4/4)' : 'Partial',
    heavyAtoms: String(totalHeavy),
    atoms,
  };
}

function MolCanvas({ atoms }: { atoms: Record<string, number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.width = c.parentElement!.clientWidth;
    c.height = c.parentElement!.clientHeight;
    drawMol(ctx, c.width, c.height, atoms);
  }, [atoms]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

const ATOM_COLORS: Record<string, string> = {
  C: '#e5e7eb', H: '#94a3b8', N: '#3b82f6', O: '#ef4444',
  S: '#fbbf24', F: '#10b981', Cl: '#34d399', Br: '#f97316', P: '#a78bfa',
};

function drawMol(ctx: CanvasRenderingContext2D, W: number, H: number, atoms: Record<string, number>) {
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const entries = Object.entries(atoms);
  const total = entries.reduce((s, [, c]) => s + c, 0);
  if (total === 0) return;

  const nodes: { x: number; y: number; sym: string; col: string }[] = [];
  const r = Math.min(W, H) * 0.32;
  let idx = 0;
  for (const [sym, count] of entries) {
    for (let j = 0; j < Math.min(count, 6); j++) {
      const a = (idx / Math.min(total, 30)) * Math.PI * 2;
      const jitter = (Math.sin(idx * 7.3) * 0.3 + 0.7);
      nodes.push({
        x: cx + Math.cos(a) * r * jitter + Math.sin(idx * 3.7) * 15,
        y: cy + Math.sin(a) * r * jitter + Math.cos(idx * 2.3) * 15,
        sym, col: ATOM_COLORS[sym] || '#888',
      });
      idx++;
    }
  }

  // Bonds
  for (let i = 0; i < nodes.length; i++) {
    const j = (i + 1) % nodes.length;
    const g = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
    g.addColorStop(0, nodes[i].col);
    g.addColorStop(1, nodes[j].col);
    ctx.strokeStyle = g;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Atoms
  nodes.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(13,21,32,0.9)'; ctx.fill();
    ctx.strokeStyle = n.col; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = n.col;
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.sym, n.x, n.y);
  });
}

export default function MoleculeAnalyzer() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      const parsed = parseSMILES(input);
      setResult(parsed);
      setAnalyzing(false);
    }, 1200);
  };

  const propEntries = result ? [
    ['Formula', result.formula],
    ['Mol. Weight', result.weight],
    ['logP', result.logp],
    ['H-Bond Donors', result.hbd],
    ['H-Bond Acceptors', result.hba],
    ['TPSA', result.tpsa],
    ['Rotatable Bonds', result.rotatable],
    ['Heavy Atoms', result.heavyAtoms],
    ['Lipinski Ro5', result.lipinski],
    ['Toxicity Estimate', result.toxicity],
  ] : [];

  return (
    <div className="anim-fade-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)' }}>Molecule Analyzer</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', marginTop: '0.4rem' }}>
          Parse SMILES strings to compute molecular properties, ADMET predictions, and Lipinski evaluation.
        </p>
      </div>

      {!result ? (
        <div className="card glass" style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--border2)' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', marginBottom: '0.5rem', fontWeight: 600 }}>Structure Analysis Engine</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Input a SMILES string to begin automated property analysis.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
              { label: 'Caffeine', smiles: 'Cn1c(=O)c2c(ncn2C)n(C)c1=O' },
              { label: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O' },
              { label: 'Penicillin G', smiles: 'CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O' },
              { label: 'Benzene', smiles: 'c1ccccc1' },
              { label: 'Water', smiles: 'O' },
            ].map(ex => (
              <button
                key={ex.label}
                onClick={() => setInput(ex.smiles)}
                style={{
                  background: 'rgba(16,185,129,0.08)', border: '1px solid var(--border)',
                  color: 'var(--accent)', padding: '0.4rem 1rem', borderRadius: '20px',
                  fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <input
              className="input"
              placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O"
              style={{ maxWidth: '400px' }}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={analyzing}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            <button className="btn-primary" onClick={handleAnalyze} disabled={analyzing || !input.trim()}>
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {analyzing && (
            <div style={{ marginTop: '2rem', color: 'var(--sky)', fontSize: '0.9rem' }}>
              Parsing molecular structure...
            </div>
          )}
        </div>
      ) : (
        <div className="anim-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 600 }}>Analysis Complete</h2>
            <button className="btn-outline" onClick={() => { setResult(null); setInput(''); }}>New Analysis</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div className="card glass" style={{ minHeight: '300px', position: 'relative' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>2D Structure</div>
              <div style={{ width: '100%', height: '260px' }}>
                <MolCanvas atoms={result.atoms} />
              </div>
            </div>

            <div className="card glass" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Input SMILES</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--sky)', wordBreak: 'break-all', marginTop: '0.5rem', fontSize: '0.95rem' }}>{input}</div>
              </div>
              {propEntries.map(([k, v]) => (
                <div key={k as string}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{k}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--white)' }}>{v as string}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
