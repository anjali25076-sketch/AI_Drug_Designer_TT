import { NextResponse } from 'next/server';
import { loadDb } from '@/lib/db';
import { DEMO_MODE } from '@/lib/ai';

export async function GET() {
  const db = loadDb();
  const avg = db.candidates.length 
    ? (db.candidates.reduce((s, c) => s + (c.affinity_score || 0), 0) / db.candidates.length).toFixed(2) 
    : 0;
    
  return NextResponse.json({ 
    total_runs: db.runs.length, 
    total_candidates: db.candidates.length, 
    avg_affinity: avg, 
    diseases_explored: [...new Set(db.runs.map(r => r.disease))].length, 
    demo_mode: DEMO_MODE 
  });
}
