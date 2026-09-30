import type { ReactElement } from 'react';
import Link from 'next/link';
import type { LocalProofSummary } from '../../lib/index/read-local-proofs';
import { readLocalProofs } from '../../lib/index/read-local-proofs';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const indexPath = join(process.cwd(), '.data', 'proofs.jsonl');

const adapterDescriptions: Record<string, string> = {
  'research-claim': 'Hash a claim and its evidence bundle, then anchor the proof to HCS.',
  'ai-decision': 'Record an agent decision before it can be rewritten.',
  'document-office': 'Hash a report, deck, invoice, or spreadsheet and verify its timestamp.'
};

export default async function ProofsPage(): Promise<ReactElement> {
  const proofs: LocalProofSummary[] = await readLocalProofs(indexPath);

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Local proof index</div>
        <h1>Proof index</h1>
        <p>
          Each entry is one proof already hashed, signed by HCS, and indexed locally.
          Raw payloads stay in <code>.data/proofs.jsonl</code>; the HCS topic stores only the digest.
        </p>
        <div className="actions">
          <Link href="/">Back to home</Link>
        </div>
        {proofs.length === 0 ? (
          <article className="card">
            <strong>No proofs yet.</strong>
            <p>
              Run <code>npm run hcs:submit</code> to publish your first proof, then refresh this page.
            </p>
          </article>
        ) : (
          <ul className="proof-list">
            {proofs.map((proof) => (
              <li className="card" key={proof.digest}>
                <strong>{proof.kind}</strong>
                <p>
                  Subject <code>{proof.subjectType}:{proof.subjectId}</code>
                </p>
                <p className="hash">{proof.algorithm} {proof.digest}</p>
                {proof.adapter ? <p>{adapterDescriptions[proof.adapter] ?? proof.adapter}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
