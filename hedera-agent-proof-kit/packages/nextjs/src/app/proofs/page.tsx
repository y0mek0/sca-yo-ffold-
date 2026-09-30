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
  'document-office': 'Hash a report, deck, invoice, or spreadsheet and verify its timestamp.',
  'browser-action': 'Browser-agent action proof: URL, action, result, screenshot hash.',
  'payment-intent': 'Payment intent proof: payer, receiver, asset, amount, policy.',
  'watcher-signal': 'Watcher signal proof: source, signal type.',
  'rag-memory': 'RAG memory proof: question, answer, retrieved chunks.'
};

export default async function ProofsPage(): Promise<ReactElement> {
  const proofs: LocalProofSummary[] = await readLocalProofs(indexPath);
  const kinds = Array.from(new Set(proofs.map((p) => p.kind).filter((k) => k && k !== 'unknown')));

  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Local proof index</div>
        <h1>Proofs</h1>
        <p className="lede">
          Each entry is a proof that was hashed, signed by HCS, and indexed locally.
          Raw payloads stay in <code>.data/proofs.jsonl</code>; the HCS topic stores only the digest.
        </p>
        <div className="cta-row">
          <Link className="btn btn-ghost" href="/">Back home</Link>
          <Link className="btn btn-ghost" href="/api/proofs">JSON</Link>
        </div>
      </section>

      <section className="panel">
        <header className="section-head">
          <div>
            <div className="eyebrow">List</div>
            <h2>{proofs.length === 0 ? 'No proofs yet.' : `${proofs.length} proof${proofs.length === 1 ? '' : 's'} on file.`}</h2>
          </div>
          {kinds.length > 0 ? (
            <p className="meta">{kinds.length} kind{kinds.length === 1 ? '' : 's'} represented</p>
          ) : null}
        </header>
        {proofs.length === 0 ? (
          <article className="card empty-card">
            <strong>Run npm run hcs:submit to publish the first proof.</strong>
            <p>
              The list refreshes every request. After each submit the new entry
              shows up here with its kind, hash, and HashScan link.
            </p>
          </article>
        ) : (
          <ul className="proof-list">
            {proofs.map((proof) => (
              <li className="proof-card" key={proof.digest}>
                <header className="proof-card-head">
                  <span className="kind-pill">{proof.kind}</span>
                  {proof.adapter ? <span className="adapter-pill">{proof.adapter}</span> : null}
                  <span className="hash-pill">{proof.algorithm}</span>
                </header>
                <p className="proof-card-subject">
                  <code>{proof.subjectType}:{proof.subjectId}</code>
                </p>
                <p className="proof-card-hash">{proof.digest}</p>
                {proof.adapter && adapterDescriptions[proof.adapter] ? (
                  <p className="proof-card-desc">{adapterDescriptions[proof.adapter]}</p>
                ) : null}
                <Link className="proof-card-link" href={`https://hashscan.io/testnet/topic/0.0.10426202`} rel="noreferrer">
                  View on HashScan ↗
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
