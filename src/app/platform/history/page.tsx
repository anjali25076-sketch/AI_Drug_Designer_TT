'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RunHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="anim-fade-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Run History
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
          Review and analyze past drug generation runs.
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }}></div>
          <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.2rem' }}>No Runs Yet</div>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>You haven't generated any drug candidates yet.</p>
          <Link href="/platform/design" className="btn-primary">Design a Drug</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Disease Area</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Target / Genotype</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Top Candidate</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, textAlign: 'right' }}>Affinity</th>
              </tr>
            </thead>
            <tbody>
              {history.map((run, i) => (
                <tr 
                  key={run.id} 
                  style={{ 
                    borderBottom: i === history.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)', 
                    background: 'transparent', 
                    transition: 'background 0.2s' 
                  }} 
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'} 
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {new Date(run.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.95rem', color: 'var(--white)', fontWeight: 600 }}>{run.disease}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--sky)', background: 'rgba(33,150,243,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.3rem' }}>
                      {run.candidate_count} candidates
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{run.target}</div>
                    {run.genotype && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted2)', marginTop: '0.2rem' }}>Genotype: {run.genotype}</div>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {run.top_candidate ? (
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--sky)', fontWeight: 700, fontFamily: 'monospace' }}>{run.top_candidate.mol_id}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', marginTop: '0.2rem' }}>Tox: {run.top_candidate.toxicity_pct?.toFixed(1)}%</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted2)' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {run.top_candidate ? (
                      <div style={{ fontSize: '1.1rem', color: 'var(--mint)', fontWeight: 700 }}>{run.top_candidate.affinity_score?.toFixed(1)}</div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted2)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
