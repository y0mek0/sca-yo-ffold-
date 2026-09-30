import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    name: 'AgentProof HBAR Doctor',
    network: process.env.HEDERA_NETWORK ?? 'testnet',
    mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL ?? 'https://testnet.mirrornode.hedera.com',
    operatorConfigured: Boolean(process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY),
    mode: process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY ? 'hcs-ready' : 'demo'
  });
}
