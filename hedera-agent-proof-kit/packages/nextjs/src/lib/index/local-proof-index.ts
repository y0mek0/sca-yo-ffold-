import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { SampleProof } from '../proof/sample-proof';

export class LocalProofIndex {
  private mutex: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async append(proof: SampleProof): Promise<void> {
    const line = `${JSON.stringify(proof)}\n`;

    const release = this.mutex;
    let resolveNext: () => void = () => undefined;
    this.mutex = new Promise<void>((resolve) => {
      resolveNext = resolve;
    });

    try {
      await release;
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, line, { encoding: 'utf8', flag: 'a' });
    } finally {
      resolveNext();
    }
  }

  async list(): Promise<SampleProof[]> {
    const raw = await this.readRaw();
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as SampleProof);
  }

  private async readRaw(): Promise<string> {
    try {
      return await readFile(this.filePath, 'utf8');
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return '';
      }
      throw error;
    }
  }
}
