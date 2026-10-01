# AgentProof HBAR: профессии и готовые сценарии

Все сценарии используют один и тот же proof layer. Отличаются только источники данных и действия после анализа.

## Не Web3: DevOps / SRE / release manager

### Что полезно

- GitHub release watcher;
- GitHub issues watcher;
- AI Decision proof;
- Document hash;
- Browser Action proof;
- HCS timestamp и Mirror verification.

### Схема

```text
release + issues
→ анализ deployment agent
→ deploy / rollback decision
→ proof решения
→ HCS
```

### Две программы

**Release Safety Gate** проверяет release, critical issues и security notes перед deploy. Возвращает `DEPLOY` или `BLOCK` и фиксирует входные данные и причину.

**Incident Timeline Builder** собирает releases, issues, alerts, rollback и решения оператора в одну временную линию. Каждое важное событие получает proof.

## Не Web3: research / due diligence analyst

### Что полезно

- Research Claim proof;
- Document hash;
- GitHub snapshots;
- внешний API snapshot;
- RAG memory hash;
- HCS и Mirror verification.

### Схема

```text
источники
→ snapshots
→ research claim
→ report
→ hash report
→ HCS
```

### Две программы

**Due Diligence Pack Generator** собирает источники, snapshots, evidence и risk flags в один отчёт с proof-ссылками.

**Research Claim Registry** хранит отдельные утверждения, источники, evidence, confidence и HCS sequence. Позже можно проверить, на каких данных строилось утверждение.

## Не Web3: document / legal / accounting operations

### Что полезно

- Document hash;
- AI Decision proof;
- approval record;
- Payment Intent;
- Payment Execution;
- HCS timestamp.

### Схема

```text
document
→ hash
→ approval
→ payment intent
→ HBAR transfer
→ execution proof
```

### Две программы

**Invoice Proof & Payment** хэширует invoice, фиксирует approval, создаёт payment intent, выполняет HBAR transfer и связывает результат с исходным документом.

**Contract Version Registry** хранит версии договоров, invoices и reports. Для каждой версии сохраняются hash, время, автор, approval и HCS sequence.

## Web3: protocol researcher / crypto data analyst

### Что полезно

- SaucerSwap market snapshot;
- HTS token/treasury snapshot;
- HBAR price snapshot;
- GitHub releases/issues;
- Research Claim proof;
- Document hash.

### Схема

```text
market data + token data + protocol activity
→ protocol report
→ research claim
→ HCS
```

### Две программы

**Protocol Health Dashboard** показывает token supply, treasury balance, pool liquidity, HBAR price и development activity. Daily snapshots можно проверять через HCS.

**Ecosystem Change Detector** сравнивает два snapshot и показывает изменения supply, treasury, liquidity, price, releases и critical issues.

## Web3: DAO treasury / grants / governance

### Что полезно

- HTS treasury snapshot;
- proposal document hash;
- Research Claim;
- AI Decision;
- Payment Intent;
- Payment Execution;
- HCS и Mirror Node.

### Схема

```text
proposal
→ treasury snapshot
→ analysis
→ governance approval
→ payment intent
→ HBAR execution proof
```

### Две программы

**Grant Allocation Tracker** связывает proposal, recipient, budget, milestones, approvals и реальные payments. Важные изменения фиксируются как proofs.

**Treasury Decision Room** собирает текущий treasury state, proposal, историю payments и risk notes в пакет для голосования. После approval пакет связывается с payment intent.

## Web3: crypto risk manager / market operations

### Что полезно

- SaucerSwap pool snapshot;
- HTS supply и treasury snapshot;
- HBAR price;
- GitHub issues/releases;
- AI Decision proof;
- Payment Intent при разрешённом действии.

### Схема

```text
market + token + protocol activity
→ risk calculation
→ ALLOW / REVIEW / BLOCK
→ HCS proof
```

### Две программы

**Risk Snapshot Monitor** периодически фиксирует liquidity, supply, treasury, price и protocol activity, а затем показывает изменения между snapshots.

**Policy Decision Engine** применяет правила: низкая liquidity блокирует действие, высокая treasury concentration требует review, critical issue ставит операцию на паузу. В proof сохраняются правила и входные данные.

## Как профессии взаимодействуют

```text
protocol researcher
→ market / token / GitHub report
        ↓
crypto risk manager
→ risk decision
        ↓
DAO governance
→ proposal и approval
        ↓
treasury / accounting
→ payment intent
        ↓
Hedera
→ HBAR transfer и execution proof
```

Весь путь может быть проверен позже через HCS и Mirror Node.

## Общая граница

Proof показывает, какие данные и решения были записаны. Он не говорит, что рынок был честным, AI был прав или сделка была выгодной.
