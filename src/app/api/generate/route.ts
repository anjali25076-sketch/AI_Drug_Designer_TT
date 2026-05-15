import { NextResponse } from 'next/server';
import { loadDb, saveDb } from '@/lib/db';
import { gemini, DEMO_MODE, mockCandidates } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { disease, target, pathway, genotype } = await req.json();
    if (!disease || !target) {
      return NextResponse.json({ error: "Disease and target are required" }, { status: 400 });
    }

    const db = loadDb();
    const run = {
      id: db.nextRunId++,
      disease,
      target,
      pathway: pathway || "",
      genotype: genotype || "",
      created_at: new Date().toISOString(),
      candidate_count: 5
    };
    db.runs.unshift(run);

    if (DEMO_MODE || !gemini) {
      const candidates = mockCandidates(disease, target, genotype).map((c, i) => ({
        ...c,
        id: db.nextCandId + i,
        run_id: run.id
      }));
      db.candidates.push(...candidates);
      db.nextCandId += 5;
      saveDb(db);
      return NextResponse.json({ run, candidates, demo: true });
    }

    try {
      const prompt = `You are an expert computational chemist. Generate exactly 5 novel drug candidates for this target as a JSON array.
Disease: ${disease} | Target: ${target} | Pathway: ${pathway || "N/A"} | Genotype: ${genotype || "Standard"}
Each item: mol_id, name, smiles, molecular_formula, molecular_weight, affinity_score(6.5-9.8), toxicity_pct(1-18), drug_likeness("Passes"/"Partial"), logP, hbd, hba, mechanism(1 sentence), explanation(3-4 sentences), rank(1-5).
Return ONLY valid JSON array, no markdown.`;

      const msg = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const textContent = msg.text || '';
      
      const candidates = JSON.parse(textContent.trim().replace(/```json|```/g, "").trim())
        .map((c: any, i: number) => ({ ...c, id: db.nextCandId + i, run_id: run.id }));
        
      db.candidates.push(...candidates);
      db.nextCandId += candidates.length;
      saveDb(db);
      return NextResponse.json({ run, candidates });
    } catch (err: any) {
      const candidates = mockCandidates(disease, target, genotype).map((c, i) => ({
        ...c,
        id: db.nextCandId + i,
        run_id: run.id
      }));
      db.candidates.push(...candidates);
      db.nextCandId += 5;
      saveDb(db);
      return NextResponse.json({ run, candidates, demo: true, fallback_reason: err.message });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
