import { NextResponse } from 'next/server';
import { filterAndLimitProofs, type ApiQuery } from '../../../lib/proof/api-proofs-filter';
import { readLocalProofs } from '../../../lib/index/read-local-proofs';
import { resolveProofIndexPath } from '../../../lib/index/proof-index-path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const query: ApiQuery = {
    kind: url.searchParams.get('kind') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined
  };
  const indexPath = resolveProofIndexPath();
  const all = await readLocalProofs(indexPath);
  const proofs = filterAndLimitProofs(all, query);
  return NextResponse.json({
    count: proofs.length,
    total: all.length,
    query,
    proofs
  });
}
