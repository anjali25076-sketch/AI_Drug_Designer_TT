import { NextResponse } from 'next/server';
import { loadDb } from '@/lib/db';

export async function GET() {
  const db = loadDb();
  const history = db.runs.slice(0, 30).map(r => ({
    ...r,
    top_candidate: db.candidates.find(c => c.run_id === r.id && c.rank === 1)
  }));
  return NextResponse.json(history);
}
