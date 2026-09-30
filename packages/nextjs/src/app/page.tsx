import type { ReactElement } from 'react';
import Link from 'next/link';
import { readLocalProofs, type LocalProofSummary } from '../lib/index/read-local-proofs';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const adapterDescriptions: Record<string, string> = {
  'research-claim': 'Hash a claim and its evidence bundle, then anchor the proof to HCS.',
  'ai-decision': 'Record an agent decision before it can be rewritten.',
  'document-office': 'Hash a report, deck, invoice, or spreadsheet and verify its timestamp.',
  'browser-action': 'Browser-agent action proof: URL, action, result, screenshot hash.',
  'payment-intent': 'Payment intent proof: payer, receiver, asset, amount, policy.',
  'watcher-signal': 'Watcher signal proof: source, signal type.',
  'rag-memory': 'RAG memory proof: question, answer, retrieved chunks.'
};

type IndexSearchParams = Record<string, string | string[] | undefined>;
type IndexSearch = Promise<IndexSearchParams>;
const adapterCard = [
  ['Research Claim Proof', 'research-claim'],
  ['AI Decision Proof', 'ai-decision'],
  ['Document / Office Proof', 'document-office'],
  ['Browser Action Proof', 'browser-action'],
  ['Payment Intent Proof', 'payment-intent'],
  ['Watcher / Radar Proof', 'watcher-signal']
] as const;

export default async function HomePage({ searchParams }: { searchParams: IndexSearch }): Promise<ReactElement> {
  const params: IndexSearchParams = await searchParams;
  const filterRaw = params.kind;
  const filter = (Array.isArray(filterRaw) ? filterRaw[0] : filterRaw) ?? '';
  const indexPath = join(process.cwd(), '.data', 'proofs.jsonl');
  const all = await readLocalProofs(indexPath);
  const filtered = filter ? all.filter((p: LocalProofSummary) => p.kind === filter || p.adapter === filter) : all;
  const kinds: string[] = Array.from(new Set(all.map((p: LocalProofSummary) => p.kind).filter((k: string) => k && k !== 'unknown')));

  return (
    <main>
      <section className="panel hero">
        <div className="brand-row">
          <span className="brand-mark" aria-hidden="true">▣</span>
          <span className="brand-name">AgentProof HBAR</span>
          <span className="brand-tagline">HCS proof log for AI, research, and documents</span>
        </div>
        <h1>Anchor agent decisions to Hedera in one command.</h1>
        <p className="lede">
          A scaffold-hbar template that turns agent output into a verifiable
          receipt. Hash the payload, submit only the digest to HCS, then
          verify it through Mirror Node — full payloads stay off-chain.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/proofs">Browse proofs</Link>
          <Link className="btn btn-ghost" href="/api/proofs">JSON feed</Link>
          <Link className="btn btn-ghost" href="/api/doctor">Doctor</Link>
        </div>
        <pre className="cli-snippet" aria-label="One-line proof flow">
{`npm run doctor
npm run audit:sample
npm run hcs:submit
npm run mirror:verify -- --sequence <N>`}
        </pre>
      </section>

      <section className="panel">
        <header className="section-head">
          <div>
            <div className="eyebrow">Working Core+ adapters</div>
            <h2>Three adapters ship as real source of truth.</h2>
          </div>
        </header>
        <div className="grid three">
          {adapterCard.map(([title, adapter]) => (
            <article className="card adapter-card" key={adapter}>
              <span className="card-pill">core+</span>
              <strong>{title}</strong>
              <p>{adapterDescriptions[adapter]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <header className="section-head">
          <div>
            <div className="eyebrow">Latest proofs</div>
            <h2>{all.length === 0 ? 'No proofs yet.' : `${all.length} proof${all.length === 1 ? '' : 's'} anchored to HCS.`}</h2>
          </div>
          {kinds.length > 1 ? (
            <nav className="filter-row" aria-label="Filter by kind">
              <Link className={`filter-chip ${filter === '' ? 'is-active' : ''}`} href="/">All</Link>
              {kinds.map((kind) => (
                <Link
                  key={kind}
                  className={`filter-chip ${filter === kind ? 'is-active' : ''}`}
                  href={`/?kind=${encodeURIComponent(kind)}`}
                >
                  {kind}
                </Link>
              ))}
            </nav>
          ) : null}
        </header>
        {all.length === 0 ? (
          <article className="card empty-card">
            <strong>Run npm run hcs:submit</strong>
            <p>
              Once your <code>.env.local</code> has operator id, key, and a topic,
              this panel fills with the receipts the Hedera Mirror Node confirmed.
            </p>
          </article>
        ) : filtered.length === 0 ? (
          <article className="card empty-card">
            <strong>No proofs match filter &ldquo;{filter}&rdquo;.</strong>
            <p><Link href="/">Clear filter</Link></p>
          </article>
        ) : (
          <ul className="proof-list">
            {filtered.slice(0, 5).map((proof: LocalProofSummary) => (
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
                <Link className="proof-card-link" href={`https://hashscan.io/testnet/topic/0.0.10426202`} rel="noreferrer">
                  View on HashScan ↗
                </Link>
              </li>
            ))}
          </ul>
        )}
        {filtered.length > 5 ? (
          <p className="more-link">
            <Link href="/proofs">See all {filtered.length} proofs →</Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}
