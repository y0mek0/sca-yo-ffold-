import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { buildAdapterTemplate, validateAdapterName, type AdapterKind } from '../src/lib/adapters/adapter-scaffold';
import { formatError, formatHeadline, formatSuccess, formatHint } from '../src/lib/cli/cli-output';

const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const VALID_KINDS: AdapterKind[] = ['ai_decision', 'research_claim', 'document_hash'];

async function main(): Promise<void> {
  const name = getArg('--name');
  const kindArg = getArg('--kind') ?? 'ai_decision';
  if (!VALID_KINDS.includes(kindArg as AdapterKind)) {
    console.log(formatError(`Invalid kind: ${kindArg}`, { valid: VALID_KINDS }, { color }));
    process.exitCode = 1;
    return;
  }
  if (!name) {
    console.log(formatError('Missing required flag', { required: ['--name <adapter-name>', '--kind <ai_decision|research_claim|document_hash>'] }, { color }));
    process.exitCode = 1;
    return;
  }

  let safeName: string;
  try {
    safeName = validateAdapterName(name);
  } catch (error) {
    console.log(formatError('Invalid adapter name', { reason: error instanceof Error ? error.message : String(error) }, { color }));
    process.exitCode = 1;
    return;
  }

  const target = join(process.cwd(), 'packages', 'nextjs', 'src', 'lib', 'adapters', `${safeName}.ts`);
  const source = buildAdapterTemplate(safeName, kindArg as AdapterKind);

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, source, 'utf8');

  console.log(formatSuccess(`Scaffolded ${safeName} adapter`, { color }));
  console.log();
  console.log(formatHeadline('Next steps', { color }));
  console.log();
  console.log(formatHint(`Edit ${target} and fill in the TODO markers.`, { color }));
  console.log(formatHint(`Add the adapter to src/lib/adapters/roadmap.ts if you want it re-exported.`, { color }));
  console.log(formatHint(`Write a vitest file under src/lib/adapters/${safeName}.test.ts before submitting.`, { color }));
  console.log();
  console.log('Created:', target);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
