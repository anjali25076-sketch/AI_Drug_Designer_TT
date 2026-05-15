import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.json');

export type Run = {
  id: number;
  disease: string;
  target: string;
  pathway: string;
  genotype: string;
  created_at: string;
  candidate_count: number;
  top_candidate?: Candidate;
};

export type Candidate = {
  id: number;
  run_id: number;
  mol_id: string;
  name: string;
  smiles: string;
  molecular_formula: string;
  molecular_weight: number;
  affinity_score: number;
  toxicity_pct: number;
  drug_likeness: string;
  logP: number;
  hbd: number;
  hba: number;
  mechanism: string;
  explanation: string;
  rank: number;
};

export type DB = {
  runs: Run[];
  candidates: Candidate[];
  nextRunId: number;
  nextCandId: number;
};

let db: DB | null = null;

export function loadDb(): DB {
  if (db) return db;
  try {
    if (fs.existsSync(DB_PATH)) {
      db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch (_) {}
  
  if (!db) {
    db = { runs: [], candidates: [], nextRunId: 1, nextCandId: 1 };
  }
  return db;
}

export function saveDb(newDb: DB) {
  db = newDb;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
