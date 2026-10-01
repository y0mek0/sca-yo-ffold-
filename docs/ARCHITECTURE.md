# AgentProof HBAR: как это работает

## Простая формула

**Внешний источник даёт данные. Adapter приводит их к единому виду. AgentProof делает цифровой отпечаток этих данных. Hedera HCS публично фиксирует отпечаток. Полная запись остаётся в собственном хранилище. Mirror Node позже подтверждает, что отпечаток действительно был записан и не изменился.**

Коротко:

```text
данные или действие
→ единый JSON
→ SHA-256 отпечаток
→ HCS proof log
→ полная запись вне сети
→ Mirror Node проверка
```

AgentProof не доказывает, что внешний источник был прав. Он доказывает, что именно эти данные были зафиксированы в определённый момент.

## Слои

### Источники

- GitHub releases и issues;
- CoinGecko HBAR price;
- SaucerSwap pool API;
- Hedera Mirror Node для HTS token/treasury state;
- документы и отчёты;
- результаты платежей Hedera.

### Adapters

Каждый adapter получает ответ источника и создаёт общий `ProofEvent`. Благодаря этому источник можно заменить, не меняя hashing, HCS и verification.

### Нормализация и hash

Нормализация оставляет только поля, нужные для конкретного события. Затем canonical JSON хэшируется через SHA-256. Один изменённый символ даёт другой hash.

### Local proof index

Полный event хранится вне HCS в локальном JSONL index. В реальном продукте этот слой можно заменить на database, object storage или другое хранилище.

### HCS

HCS используется как публичный последовательный журнал proof-сообщений. В HCS отправляется не большой payload, а hash и небольшие metadata.

### Mirror Node

Mirror Node используется для независимого чтения HCS message и Hedera transaction. Локальный hash сравнивается с hash из HCS.

## Реальный и demo режимы

`audit:sample` и `verify:sample` используют детерминированный локальный sample. Это безопасный способ проверить схему без credentials.

`watch:*`, `hcs:submit` и `payment:intent:hbar` используют Hedera testnet credentials из локального `.env.local`.

В репозитории нет credentials, `.env.local` и runtime `.data` artifacts.

## Payment flow

Платёж состоит из двух разных событий:

```text
payment intent
→ proof намерения
→ реальный HBAR transfer
→ Hedera SUCCESS receipt
→ execution proof
→ Mirror Node verification
```

`intent` означает, что агент собирался заплатить. `execution` означает, что Hedera действительно подтвердила перевод.

## Границы проекта

AgentProof не является trading bot, exchange, wallet, financial advisor, compliance SaaS или database. Он не делает swaps и не доказывает правильность AI-решения. Он фиксирует входные данные, решение или результат действия и делает эту запись проверяемой.
