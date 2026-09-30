import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { SampleProof } from '../proof/sample-proof';

export class LocalProofIndex {
  constructor(private readonly filePath: string) {}

  async append(proof: SampleProof): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const current = await this.readRaw();
    const line = `${JSON.stringify(proof)}\n`;
    await writeFile(this.filePath, current + line, 'utf8');
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
