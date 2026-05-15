import { NextResponse } from 'next/server';
import { loadDb } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = loadDb();
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const run = db.runs.find(r => r.id === id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  const candidates = db.candidates.filter(c => c.run_id === id).sort((a, b) => a.rank - b.rank);
  return NextResponse.json({ run, candidates });
}
