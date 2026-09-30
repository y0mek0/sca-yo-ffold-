const adapters = [
  ['Research Claim Proof', 'Hash a claim and its evidence bundle, then anchor the proof to HCS.'],
  ['AI Decision Proof', 'Record an agent decision before it can be rewritten.'],
  ['Document / Office Proof', 'Hash a report, deck, invoice, or spreadsheet and verify its timestamp.']
];

export default function HomePage() {
  return (
    <main>
      <section className="panel">
        <div className="eyebrow">Scaffold-HBAR template</div>
        <h1>AgentProof HBAR</h1>
        <p>
          A Hedera proof layer for AI, research, and document workflows: normalize payloads,
          hash them, anchor the proof to HCS, and verify through Mirror Node.
        </p>
        <div className="grid">
          {adapters.map(([title, text]) => (
            <article className="card" key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
