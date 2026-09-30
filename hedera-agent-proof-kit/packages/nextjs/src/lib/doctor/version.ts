function parseVersion(version: string): number[] {
  return version.replace(/^v/, '').split('.').map(Number);
}

export function isVersionAtLeast(current: string, required: string): boolean {
  const currentParts = parseVersion(current);
  const requiredParts = parseVersion(required);

  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i += 1) {
    const currentPart = currentParts[i] ?? 0;
    const requiredPart = requiredParts[i] ?? 0;

    if (currentPart > requiredPart) return true;
    if (currentPart < requiredPart) return false;
  }

  return true;
}
