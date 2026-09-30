import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { readLocalProofs } from '../../../lib/index/read-local-proofs';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const indexPath = join(process.cwd(), '.data', 'proofs.jsonl');
  const proofs = await readLocalProofs(indexPath);
  return NextResponse.json({ count: proofs.length, proofs });
}
