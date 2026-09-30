export type TokenAssociationResult =
  | { ok: true; reason: 'associated' }
  | { ok: false; reason: string };

export type TokenAssociationOptions = {
  accountId: string;
  tokenId: string;
  mirrorNodeUrl: string;
  fetchImpl?: typeof fetch;
};

type MirrorAccountTokenResponse = {
  tokens?: Array<{ token_id?: string }>;
  automatic_associations?: Array<{ token_id?: string }>;
};

export async function checkTokenAssociation(options: TokenAssociationOptions): Promise<TokenAssociationResult> {
  const baseUrl = options.mirrorNodeUrl.replace(/\/$/, '');
  const url = `${baseUrl}/api/v1/accounts/${options.accountId}/tokens?token.id=${options.tokenId}&limit=1`;
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    response = await fetchImpl(url);
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? `mirror_node_unreachable: ${error.message}` : 'mirror_node_unreachable' };
  }

  if (!response.ok) {
    return { ok: false, reason: `mirror_node_http_${response.status}` };
  }

  const data = await response.json() as MirrorAccountTokenResponse;
  const explicit = data.tokens ?? [];
  const automatic = data.automatic_associations ?? [];
  const all = [...explicit, ...automatic];

  if (all.some((entry) => entry.token_id === options.tokenId)) {
    return { ok: true, reason: 'associated' };
  }

  return { ok: false, reason: `token ${options.tokenId} not associated to ${options.accountId}` };
}
