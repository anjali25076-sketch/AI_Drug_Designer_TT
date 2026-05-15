'use client';

import { useState } from 'react';
import ProteinViewer, { ProteinTarget } from '@/components/ProteinViewer';

const TARGET_DB: ProteinTarget[] = [
  { pdbId: '1000X', name: 'PARP1 (Poly [ADP-ribose] polymerase 1)', classification: 'Transferase', resolution: '1.8 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Poly [ADP-ribose] polymerase 1', description: 'Involved in DNA repair. Important target for cancer therapy, particularly in BRCA-mutated breast and ovarian cancers.' },
  { pdbId: '1042X', name: 'Mpro (SARS-CoV-2 Main Protease)', classification: 'Hydrolase', resolution: '2.1 Å', organism: 'SARS-CoV-2', method: 'X-Ray Diffraction', macromolecule: 'Main Protease (3CLpro)', description: 'Key enzyme for viral replication and transcription. Primary target for COVID-19 antiviral drugs like Nirmatrelvir.' },
  { pdbId: '1084X', name: 'BACE1 (Beta-secretase 1)', classification: 'Hydrolase', resolution: '1.9 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Beta-secretase 1', description: 'Crucial enzyme in the formation of myelin sheaths and the generation of amyloid beta peptides, a major target for Alzheimer\'s disease.' },
  { pdbId: '1126X', name: 'EGFR (Epidermal Growth Factor Receptor)', classification: 'Transferase', resolution: '2.5 Å', organism: 'Homo sapiens', method: 'Cryo-EM', macromolecule: 'Epidermal growth factor receptor', description: 'Receptor tyrosine kinase that regulates cell growth and differentiation. Major target for non-small cell lung cancer (NSCLC).' },
  { pdbId: '1150X', name: 'KRAS (Kirsten rat sarcoma virus)', classification: 'Hydrolase/GTPase', resolution: '1.5 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'GTPase KRas', description: 'Acts as a molecular switch in regulating cell proliferation. The G12C mutation is a prominent target in lung and colorectal cancers.' },
  { pdbId: '1201X', name: 'CDK4 (Cyclin-dependent kinase 4)', classification: 'Transferase', resolution: '2.3 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Cyclin-dependent kinase 4', description: 'Key regulator of the cell cycle (G1 to S phase transition). Targeted in HR-positive, HER2-negative breast cancers.' },
  { pdbId: '1255X', name: 'BRAF (V600E mutant)', classification: 'Transferase', resolution: '2.0 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Serine/threonine-protein kinase B-raf', description: 'Involved in sending signals directing cell growth. The V600E mutation is a major therapeutic target in melanoma.' },
  { pdbId: '1310X', name: 'HIV-1 Protease', classification: 'Hydrolase', resolution: '1.2 Å', organism: 'Human immunodeficiency virus 1', method: 'X-Ray Diffraction', macromolecule: 'Protease', description: 'Essential for the viral life cycle by cleaving newly synthesized polyproteins. A classic target for antiretroviral therapy.' },
  { pdbId: '1342X', name: 'HER2 (Receptor tyrosine-protein kinase erbB-2)', classification: 'Transferase', resolution: '2.8 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Receptor tyrosine-protein kinase erbB-2', description: 'Overexpressed in certain types of aggressive breast cancers. Targeted by monoclonal antibodies and small molecule inhibitors.' },
  { pdbId: '1420X', name: 'AChE (Acetylcholinesterase)', classification: 'Hydrolase', resolution: '2.2 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Acetylcholinesterase', description: 'Terminates synaptic transmission. Inhibitors are used to treat symptoms of Alzheimer\'s disease and myasthenia gravis.' },
  { pdbId: '1488X', name: 'DPP-4 (Dipeptidyl peptidase 4)', classification: 'Hydrolase', resolution: '1.9 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Dipeptidyl peptidase 4', description: 'Enzyme that degrades incretin hormones. Inhibitors (gliptins) are widely used for the treatment of type 2 diabetes.' },
  { pdbId: '1523X', name: 'JAK2 (Janus kinase 2)', classification: 'Transferase', resolution: '2.1 Å', organism: 'Homo sapiens', method: 'X-Ray Diffraction', macromolecule: 'Tyrosine-protein kinase JAK2', description: 'Involved in signaling by members of the type II cytokine receptor family. Targeted in myeloproliferative neoplasms.' },
];

export default function TargetDatabase() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [viewingTarget, setViewingTarget] = useState<ProteinTarget | null>(null);

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLoaded(true);
    }, 1500);
  };

  const filteredTargets = TARGET_DB.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.pdbId.toLowerCase().includes(search.toLowerCase()) ||
    t.classification.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="anim-fade-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Target Database
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', marginTop: '0.4rem' }}>
          Search for disease targets, protein structures, and binding pockets.
        </p>
      </div>
      
      {!loaded ? (
        <div className="card glass" style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border2)' }}>
          <div style={{ fontSize: '3rem', opacity: 0.8, marginBottom: '1rem', color: 'var(--sky)' }}>{loading ? '' : ''}</div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', marginBottom: '0.5rem', fontWeight: 600 }}>Protein Data Bank (PDB) Integration</h2>
          <p style={{ color: 'var(--muted)' }}>Syncing with the latest 3D protein structures requires a one-time load.</p>
          <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={handleSync} disabled={loading}>
            {loading ? 'Syncing...' : 'Load Target Set'}
          </button>
        </div>
      ) : (
        <div className="anim-fade-up">
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            <input 
              className="input" 
              placeholder="Search targets (e.g. PARP1, Mpro, Transferase)..." 
              style={{ flex: 1 }} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn-primary">Search</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredTargets.map((t, i) => (
              <div key={i} className="card glass" style={{ borderLeft: '3px solid var(--sky)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--sky)', fontWeight: 700, marginBottom: '0.5rem' }}>PDB: {t.pdbId}</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--white)', fontWeight: 600, marginBottom: '1rem', flex: 1 }}>{t.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>{t.method}</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>{t.resolution}</span>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <button 
                    className="btn-outline" 
                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                    onClick={() => setViewingTarget(t)}
                  >
                    View 3D Structure
                  </button>
                </div>
              </div>
            ))}
            
            {filteredTargets.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                No targets found matching "{search}".
              </div>
            )}
          </div>
        </div>
      )}
      
      {viewingTarget && (
        <ProteinViewer target={viewingTarget} onClose={() => setViewingTarget(null)} />
      )}
    </div>
  );
}
