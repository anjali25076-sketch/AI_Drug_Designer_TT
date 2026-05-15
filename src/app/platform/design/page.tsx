'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import Loader from '@/components/Loader';
import { Candidate } from '@/lib/db';
import MoleculeViewer from '@/components/MoleculeViewer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXAMPLES = [
  { disease: 'Triple-Negative Breast Cancer', target: 'PARP1', pathway: 'DNA damage repair', genotype: 'BRCA1 mutation' },
  { disease: 'COVID-19 (SARS-CoV-2)', target: 'Main Protease (Mpro)', pathway: 'Viral replication', genotype: 'CYP3A4 slow metabolizer' },
  { disease: "Alzheimer's Disease", target: 'BACE1', pathway: 'APP cleavage', genotype: 'APOE4 carrier' },
  { disease: "Parkinson's Disease", target: 'Alpha-Synuclein', pathway: 'Dopaminergic neurodegeneration', genotype: 'LRRK2 G2019S' },
  { disease: 'Non-Small Cell Lung Cancer', target: 'EGFR (T790M)', pathway: 'MAPK/ERK signaling', genotype: 'EGFR exon 19 deletion' },
  { disease: 'Type 2 Diabetes', target: 'GLP-1 Receptor', pathway: 'Incretin-mediated insulin secretion', genotype: 'TCF7L2 risk variant' },
  { disease: 'Rheumatoid Arthritis', target: 'JAK3', pathway: 'JAK-STAT inflammatory signaling', genotype: 'HLA-DR4 positive' },
  { disease: 'Malaria (P. falciparum)', target: 'PfDHFR', pathway: 'Folate biosynthesis', genotype: 'G6PD deficiency screening' },
  { disease: 'HIV-1 Infection', target: 'Integrase (IN)', pathway: 'Viral DNA integration', genotype: 'CYP2B6 poor metabolizer' },
];

const LOAD_STEPS = [
  "Parsing protein target & binding site...",
  "Running generative molecular diffusion...",
  "GNN binding affinity prediction...",
  "ADMET toxicity screening...",
  "Compiling scientific rationale...",
];

export default function DesignDrug() {
  const [form, setForm] = useState({ disease: '', target: '', pathway: '', genotype: '' });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("");
  const [results, setResults] = useState<{ run: any, candidates: Candidate[], demo?: boolean } | null>(null);
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleGenerate = async () => {
    if (!form.disease || !form.target) {
      setError("Disease and Target are required.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);
    setProgress(0);

    for (let i = 0; i < LOAD_STEPS.length; i++) {
      setStepText(LOAD_STEPS[i]);
      setProgress(((i + 1) / LOAD_STEPS.length) * 90);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      
      setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDownloadCSV = () => {
    if (!results) return;
    const headers = ["mol_id", "name", "smiles", "molecular_formula", "molecular_weight", "affinity_score", "toxicity_pct", "drug_likeness", "logP", "hbd", "hba"];
    const rows = results.candidates.map(c => 
      headers.map(h => {
        const val = (c as any)[h];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidates_${results.run.disease.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("AI Drug Designer: Scientific Report", 14, 22);
    
    // Run Details
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Disease: ${results.run.disease}`, 14, 32);
    doc.text(`Target: ${results.run.target}`, 14, 38);
    doc.text(`Genotype: ${results.run.genotype || 'N/A'}`, 14, 44);
    doc.text(`Pathway: ${results.run.pathway || 'N/A'}`, 14, 50);
    doc.text(`Generated: ${new Date(results.run.created_at).toLocaleString()}`, 14, 56);

    // Table
    const tableData = results.candidates.map(c => [
      c.mol_id, c.molecular_formula, c.affinity_score.toFixed(1), c.toxicity_pct.toFixed(1) + '%', c.drug_likeness, c.molecular_weight.toFixed(0)
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [['Mol ID', 'Formula', 'Affinity', 'Toxicity', 'Drug-Like', 'MW']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Detailed Mechanism Page
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Mechanism of Action Details", 14, 22);

    let y = 35;
    results.candidates.forEach((c) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${c.mol_id} - ${c.name}`, 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const splitMech = doc.splitTextToSize(`Mechanism: ${c.mechanism}`, 180);
      doc.text(splitMech, 14, y);
      y += splitMech.length * 5;
      
      const splitExp = doc.splitTextToSize(`Explanation: ${c.explanation}`, 180);
      doc.text(splitExp, 14, y);
      y += splitExp.length * 5 + 10;
    });

    doc.save(`report_${results.run.disease.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className={styles.centerContainer}>
        <Loader progress={progress} stepText={stepText} />
      </div>
    );
  }

  if (results) {
    const topCandidate = results.candidates[0];

    return (
      <>
        <div className="anim-fade-up">
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Results — {results.run.disease}</h1>
              <p className={styles.sub}>
                Target: {results.run.target} 
                {results.run.genotype && ` · Genotype: ${results.run.genotype}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-outline" onClick={handleDownloadCSV}>↓ CSV</button>
              <button className="btn-outline" onClick={handleDownloadPDF}>📄 PDF Report</button>
              <button className="btn-primary" onClick={() => setResults(null)}>+ New Run</button>
            </div>
          </div>

          {results.demo && (
            <div className={styles.demoBanner}>
              ⚡ Showing demo data. Add <code>ANTHROPIC_API_KEY</code> to .env for real AI-generated molecules.
            </div>
          )}

          {topCandidate && (
            <div className={styles.bestCandidateCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' }}>🏆</div>
                <div>
                  <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.4rem', textShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
                    Best Candidate: {topCandidate.mol_id} — {topCandidate.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Affinity <span style={{ color: 'var(--white)' }}>{topCandidate.affinity_score.toFixed(1)}</span>/10 · 
                    Toxicity <span style={{ color: 'var(--white)' }}>{topCandidate.toxicity_pct.toFixed(1)}%</span> · 
                    <span style={{ color: 'var(--white)', marginLeft: '0.2rem' }}>{topCandidate.drug_likeness}</span> Lipinski
                  </div>
                </div>
              </div>
              <div style={{ fontStyle: 'italic', color: 'var(--muted2)', fontSize: '0.95rem', maxWidth: '400px', lineHeight: '1.5' }}>
                "{topCandidate.mechanism}"
              </div>
            </div>
          )}

          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>#</span>
              <span>Molecule</span>
              <span>Affinity</span>
              <span>Toxicity</span>
              <span>MW</span>
              <span>Drug-Like</span>
            </div>
            
            {results.candidates.map((c, idx) => (
              <div key={c.id} className={`${styles.tableRow} ${idx === 0 ? styles.topRow : ''}`} onClick={() => setSelectedCandidate(c)}>
                <div className={styles.idxBadge}>{idx + 1}</div>
                <div>
                  <div className={styles.molId}>{c.mol_id}</div>
                  <div className={styles.molName}>{c.name}</div>
                </div>
                <div>
                  <div className={styles.stat}>{c.affinity_score.toFixed(1)}</div>
                  <div className={styles.statLabel}>Affinity</div>
                </div>
                <div>
                  <div className={styles.stat}>{c.toxicity_pct.toFixed(1)}%</div>
                  <div className={styles.statLabel}>Toxicity</div>
                </div>
                <div>
                  <div className={styles.stat}>{c.molecular_weight.toFixed(0)}</div>
                  <div className={styles.statLabel}>MW g/mol</div>
                </div>
                <div>
                  <span className={`${styles.badgeStatus} ${c.drug_likeness === 'Passes' ? styles.pass : styles.partial}`}>
                    {c.drug_likeness}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedCandidate && (
          <MoleculeViewer 
            candidate={selectedCandidate} 
            onClose={() => setSelectedCandidate(null)} 
          />
        )}
      </>
    );
  }

  return (
    <div className={`anim-fade-up ${styles.pageContainer}`}>
      <div className={styles.leftCol}>
        <h1 className={styles.title}>Design <span>Candidates</span></h1>
        <p className={styles.sub}>Enter a disease target and let AI generate novel molecules.</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.examples}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className={styles.chip} onClick={() => setForm(ex)}>
              {ex.disease}
            </button>
          ))}
        </div>

        <div className={styles.formCard}>
          <div className={styles.grid}>
            <div>
              <label className={styles.inputLabel}>Disease *</label>
              <input className={styles.inputField} value={form.disease} onChange={e => setForm({...form, disease: e.target.value})} placeholder="e.g. COVID-19" />
            </div>
            <div>
              <label className={styles.inputLabel}>Target Protein *</label>
              <input className={styles.inputField} value={form.target} onChange={e => setForm({...form, target: e.target.value})} placeholder="e.g. Main Protease" />
            </div>
            <div>
              <label className={styles.inputLabel}>Pathway (Optional)</label>
              <input className={styles.inputField} value={form.pathway} onChange={e => setForm({...form, pathway: e.target.value})} placeholder="e.g. Viral replication" />
            </div>
            <div>
              <label className={styles.inputLabel}>Genotype (Optional)</label>
              <input className={styles.inputField} value={form.genotype} onChange={e => setForm({...form, genotype: e.target.value})} placeholder="e.g. CYP3A4 slow metabolizer" />
            </div>
          </div>
          
          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className={styles.generateBtn} onClick={handleGenerate}>
              Generate Candidates
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.rightCol}>
        <SystemVisualizer />
      </div>
    </div>
  );
}

function SystemVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };

    window.addEventListener('resize', resize);
    resize();

    let time = 0;
    let animationId: number;
    const render = () => {
      time += 0.005; // Slow rotation
      drawRadar(ctx, canvas.width / 2, canvas.height / 2, time);
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={styles.visualizerBox}>
      <canvas ref={canvasRef} className={styles.visCanvas} />
      <div className={styles.telemetry}>
        <div className={styles.telemetryLine}>
          <div className={styles.telemetryBlink}></div>
          AI ENGINE: <span>GENERATIVE DIFFUSION V4.2</span>
        </div>
        <div className={styles.telemetryLine}>
          STATUS: <span>AWAITING TARGET PARAMETERS</span>
        </div>
        <div className={styles.telemetryLine}>
          COMPUTE: <span>US-EAST (ACCELERATED)</span>
        </div>
      </div>
    </div>
  );
}

function drawRadar(ctx: CanvasRenderingContext2D, W: number, H: number, time: number) {
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2;
  const cy = H / 2;
  
  // Outer rings
  ctx.beginPath();
  ctx.arc(cx, cy, 140, time, time + Math.PI * 1.5);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 155, -time * 1.2, -time * 1.2 + Math.PI * 0.8);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.stroke();
  
  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx - 180, cy);
  ctx.lineTo(cx + 180, cy);
  ctx.moveTo(cx, cy - 180);
  ctx.lineTo(cx, cy + 180);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
  ctx.setLineDash([5, 15]);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Inner scanning geometry
  ctx.beginPath();
  const numPoints = 6;
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 / numPoints) * i + time * 2;
    const r = 60 + Math.sin(time * 5 + i) * 10;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
  ctx.fill();
}
