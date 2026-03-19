import type {
  Wine,
  WineData,
  Action,
  ActionType,
  ActionStatus,
  Template,
  Organization,
  DashboardStats,
  WineStatus,
} from "@/types/dual";
import { isDualConfigured, getDualClient } from "./dual-client";
import { v4 as uuidv4 } from "uuid";

// ─── Blockscout Resolver ───
// Matches DUAL objects to on-chain token instances via integrity_hash
const BSMT_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';
const BLOCKSCOUT_BASE = 'https://32f.blockv.io';

interface BlockscoutLinks {
  txHash: string | null;
  tokenInstanceUrl: string | null;
  txUrl: string | null;
  tokenId: string | null;
}

let _blockscoutCache: Map<string, BlockscoutLinks> | null = null;
let _blockscoutCacheTime = 0;

async function resolveBlockscoutLinks(ownerAddress: string): Promise<Map<string, BlockscoutLinks>> {
  // Cache for 5 minutes
  if (_blockscoutCache && Date.now() - _blockscoutCacheTime < 300000) return _blockscoutCache;
  const map = new Map<string, BlockscoutLinks>();
  try {
    // Single API call: get all token instances owned by this address (includes metadata with integrity_hash)
    const instUrl = `${BLOCKSCOUT_BASE}/api/v2/tokens/${BSMT_CONTRACT}/instances?holder_address_hash=${ownerAddress}`;
    const instRes = await fetch(instUrl);
    if (!instRes.ok) return map;
    const instData = await instRes.json();
    const instances = instData?.items || [];

    // Build integrity_hash → token_id map from instances
    const tokenIdByIH = new Map<string, string>();
    for (const inst of instances) {
      const attrs = inst?.metadata?.attributes || [];
      const ihAttr = attrs.find((a: any) => a.trait_type === 'integrity_hash');
      if (ihAttr?.value) tokenIdByIH.set(ihAttr.value, inst.id);
    }

    // Single API call: get token transfers to find tx hashes
    const txUrl = `${BLOCKSCOUT_BASE}/api/v2/addresses/${ownerAddress}/token-transfers?type=ERC-721&filter=to`;
    const txRes = await fetch(txUrl);
    if (!txRes.ok) return map;
    const txData = await txRes.json();
    const transfers = txData?.items || [];

    // Build token_id → tx_hash map from transfers
    const txByTokenId = new Map<string, string>();
    for (const t of transfers) {
      const tokenId = t.total?.token_id;
      const txHash = t.transaction_hash;
      if (tokenId && txHash) txByTokenId.set(String(tokenId), txHash);
    }

    // Combine: integrity_hash → { txUrl, tokenInstanceUrl }
    for (const [ih, tokenId] of Array.from(tokenIdByIH.entries())) {
      const txHash = txByTokenId.get(tokenId) || null;
      map.set(ih, {
        txHash,
        tokenId,
        txUrl: txHash ? `${BLOCKSCOUT_BASE}/tx/${txHash}` : null,
        tokenInstanceUrl: `${BLOCKSCOUT_BASE}/token/${BSMT_CONTRACT}/instance/${tokenId}`,
      });
    }
  } catch { /* Blockscout unavailable — return empty map */ }
  _blockscoutCache = map;
  _blockscoutCacheTime = Date.now();
  return map;
}

// ─── Data Provider Interface ───

export interface DataProvider {
  // Wines
  listWines(): Promise<Wine[]>;
  getWine(id: string): Promise<Wine | null>;
  mintWine(data: WineData): Promise<Wine>;
  updateWineStatus(id: string, status: WineStatus): Promise<Wine | null>;

  // Actions
  executeAction(wineId: string, type: ActionType, params?: Record<string, unknown>): Promise<Action>;
  getAction(id: string): Promise<Action | null>;
  getWineActions(wineId: string): Promise<Action[]>;
  listActions(): Promise<Action[]>;

  // Templates
  getTemplate(id: string): Promise<Template | null>;
  listTemplates(): Promise<Template[]>;

  // Organizations
  getOrganization(id: string): Promise<Organization | null>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

// ─── DUAL API Provider ───

// Extract year from ISO timestamp
function extractYear(timestamp: string): number {
  try {
    return parseInt(timestamp.split('-')[0], 10);
  } catch {
    return new Date().getFullYear();
  }
}

// Map DUAL gateway object to Wine (REAL data only)
function mapGatewayToWine(obj: any): Wine {
  const m = obj.metadata || {};
  const year = extractYear(obj.when_created || new Date().toISOString());

  // Determine wine type from category
  let wineType: any = 'red';
  const category = (m.category || '').toLowerCase();
  if (category.includes('white')) wineType = 'white';
  else if (category.includes('sparkling') || category.includes('champagne')) wineType = 'sparkling';
  else if (category.includes('rosé') || category.includes('rose')) wineType = 'rosé';
  else if (category.includes('dessert')) wineType = 'dessert';
  else if (category.includes('fortified') || category.includes('port')) wineType = 'fortified';

  return {
    id: obj.id || '',
    templateId: obj.template_id,
    objectId: obj.id,
    contentHash: obj.content_hash,
    wineData: {
      name: m.name || 'Token',
      producer: 'DUAL Network',
      region: 'On-Chain',
      country: 'Decentralized',
      vintage: year,
      varietal: m.category || 'Token',
      type: wineType,
      abv: 0,
      volume: '1 unit',
      quantity: 1,
      condition: 'excellent' as any,
      storage: 'professional' as any,
      drinkingWindow: { from: year, to: year + 10 },
      ratings: [],
      certifications: [],
      currentValue: 0,
      purchasePrice: 0,
      description: m.description || 'DUAL network token',
      tastingNotes: { nose: '', palate: '', finish: '' },
      imageUrl: m.image?.url || undefined,
    },
    provenance: [{
      id: obj.id + '-anchor',
      timestamp: obj.when_created || new Date().toISOString(),
      type: 'TOKENIZED',
      description: 'Anchored on DUAL network',
      actor: obj.owner || 'DUAL Protocol',
      verified: !!obj.content_hash,
      txHash: obj.content_hash,
    }],
    faces: [],
    status: obj.content_hash ? 'anchored' : 'minted',
    ownerId: obj.owner || '',
    createdAt: obj.when_created || new Date().toISOString(),
    updatedAt: obj.when_modified || new Date().toISOString(),
    blockchainTxHash: obj.integrity_hash,
    explorerLinks: {
      owner: obj.owner ? `https://32f.blockv.io/address/${obj.owner}` : null,
      contentHash: null,
      integrityHash: null,
      org: obj.org_id ? `https://32f.blockv.io/address/0xed75538AeDD6E45FfadF30B9EEC68A3959654bF9` : null,
    },
  };
}

class DualDataProvider implements DataProvider {
  async listWines(): Promise<Wine[]> {
    const client = getDualClient();
    const result = await client.objects.listObjects({ limit: 100, template_id: process.env.DUAL_TEMPLATE_ID || undefined });
    const objects = result?.objects || result?.data || [];
    const wines = (objects as any[]).map((obj: any) => mapGatewayToWine(obj));

    // Resolve real Blockscout links by matching integrity_hash
    try {
      const ownerAddr = wines[0]?.ownerId;
      if (ownerAddr) {
        const bsMap = await resolveBlockscoutLinks(ownerAddr);
        for (const wine of wines) {
          const ih = wine.blockchainTxHash;
          if (ih && bsMap.has(ih)) {
            const bs = bsMap.get(ih)!;
            wine.explorerLinks = {
              owner: wine.explorerLinks?.owner || null,
              org: wine.explorerLinks?.org || null,
              contentHash: bs.txUrl,
              integrityHash: bs.tokenInstanceUrl,
            };
          }
        }
      }
    } catch { /* Blockscout enrichment failed — links stay as-is */ }

    return wines;
  }

  async getWine(id: string): Promise<Wine | null> {
    try {
      const client = getDualClient();
      const obj = await client.objects.getObject(id);
      if (!obj) return null;
      const wine = mapGatewayToWine(obj as any);
      // Resolve Blockscout links for this single wine
      try {
        if (wine.ownerId) {
          const bsMap = await resolveBlockscoutLinks(wine.ownerId);
          const ih = wine.blockchainTxHash;
          if (ih && bsMap.has(ih)) {
            const bs = bsMap.get(ih)!;
            wine.explorerLinks = {
              owner: wine.explorerLinks?.owner || null,
              org: wine.explorerLinks?.org || null,
              contentHash: bs.txUrl,
              integrityHash: bs.tokenInstanceUrl,
            };
          }
        }
      } catch { /* Blockscout enrichment failed */ }
      return wine;
    } catch {
      return null;
    }
  }

  async mintWine(data: WineData): Promise<Wine> {
    const client = getDualClient();
    const templateId = process.env.DUAL_TEMPLATE_ID || '';
    const result = await client.ebus.executeAction({
      actionType: 'MINT',
      templateId,
      properties: data as unknown as Record<string, unknown>,
    });
    return result;
  }

  async updateWineStatus(): Promise<Wine | null> {
    // Handled via DUAL actions
    return null;
  }

  async executeAction(wineId: string, type: ActionType, params?: Record<string, unknown>): Promise<Action> {
    const client = getDualClient();
    return client.ebus.executeAction({ objectId: wineId, actionType: type, ...params });
  }

  async getAction(id: string): Promise<Action | null> {
    try {
      const client = getDualClient();
      return await client.ebus.getAction(id);
    } catch {
      return null;
    }
  }

  async getWineActions(wineId: string): Promise<Action[]> {
    const client = getDualClient();
    const result = await client.objects.getObjectActivity(wineId);
    return result?.objects || result?.actions || result?.activity || result?.data || [];
  }

  async listActions(): Promise<Action[]> {
    const client = getDualClient();
    const result = await client.ebus.listActions({ limit: 100 });
    return (result?.objects || result?.actions || result?.activity || result?.data || []).sort(
      (a: Action, b: Action) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTemplate(id: string): Promise<Template | null> {
    try {
      const client = getDualClient();
      return await client.templates.getTemplate(id);
    } catch {
      return null;
    }
  }

  async listTemplates(): Promise<Template[]> {
    const client = getDualClient();
    const result = await client.templates.listTemplates({ limit: 100 });
    const templates = result?.templates || result?.data || [];
    return (templates as any[]).map((t: any) => ({
      id: t.id || '',
      name: t.name || t.object?.metadata?.name || 'Untitled',
      description: t.object?.metadata?.description || '',
      properties: [],
      actions: t.actions || [],
      organizationId: t.org_id || '',
      createdAt: t.when_created || new Date().toISOString(),
    }));
  }

  async getOrganization(id: string): Promise<Organization | null> {
    try {
      const client = getDualClient();
      return await client.organizations.getOrganization(id);
    } catch {
      return null;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const client = getDualClient();
      const wines = await this.listWines();

      // Calculate stats from live DUAL data
      const stats: DashboardStats = {
        totalWines: wines.length,
        totalValue: wines.reduce((sum: number, w: Wine) => sum + (w.wineData.currentValue || 0), 0),
        totalActions: 0,
        mintedThisMonth: wines.filter((w: Wine) => {
          const created = new Date(w.createdAt);
          const now = new Date();
          return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
        }).length,
        activeListings: wines.filter((w: Wine) => w.status === 'listed').length,
        recentSales: wines.filter((w: Wine) => w.status === 'sold').length,
        topRegions: [],
        valueByType: [],
      };

      return stats;
    } catch {
      throw new Error('Failed to fetch DUAL network stats');
    }
  }
}

// ─── Factory ───

let provider: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (!provider) {
    provider = new DualDataProvider();
  }
  return provider;
}
