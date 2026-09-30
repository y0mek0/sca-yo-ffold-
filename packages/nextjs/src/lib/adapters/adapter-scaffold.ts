export type AdapterKind = 'ai_decision' | 'research_claim' | 'document_hash';

const NAME_PATTERN = /^[a-z][a-z0-9_-]*$/;

export function validateAdapterName(name: string): string {
  if (!name) throw new Error('Adapter name is required.');
  if (!NAME_PATTERN.test(name)) {
    throw new Error(`Invalid adapter name ${JSON.stringify(name)}: use snake_case or kebab-case starting with a lowercase letter.`);
  }
  return name;
}

function toPascal(name: string): string {
  return name
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamel(name: string): string {
  const pascal = toPascal(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function buildAdapterTemplate(name: string, kind: AdapterKind): string {
  const pascal = toPascal(name);
  const camel = toCamel(name);
  return `import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type ${pascal}Input = {
  // TODO: describe the inputs your adapter normalizes from an external tool.
};

export function ${camel}(input: ${pascal}Input): ProofEvent {
  return normalizeProofEvent({
    kind: '${kind}',
    actor: { id: 'agent:${name}', type: 'ai_agent' },
    subject: { id: '${name}:TODO', type: 'TODO' },
    payload: { /* TODO: payload from external tool */ },
    metadata: { adapter: '${name}' }
  });
}
`;
}
