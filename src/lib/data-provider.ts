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
import { DEMO_WINES, DEMO_ACTIONS, DEMO_STATS } from "./demo-data";
import { v4 as uuidv4 } from "uuid";

// âââ Data Provider Interface âââ

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

// âââ In-Memory Demo Provider âââ

const wineStore = new Map<string, Wine>();
const actionStore = new Map<string, Action>();

// Initialize stores
DEMO_WINES.forEach((w) => wineStore.set(w.id, { ...w }));
DEMO_ACTIONS.forEach((a) => actionStore.set(a.id, { ...a }));

const VALID_TRANSITIONS: Record<string, WineStatus[]> = {
  draft: ["minted"],
  minted: ["anchoring", "listed"],
  anchoring: ["anchored", "draft"],
  anchored: ["listed", "burned"],
  listed: ["sold", "anchored"],
  sold: ["transferred", "redeemed"],
  transferred: ["listed", "anchored"],
  redeemed: [],
  burned: [],
};

class DemoDataProvider implements DataProvider {
  async listWines(): Promise<Wine[]> {
    return Array.from(wineStore.values());
  }

  async getWine(id: string): Promise<Wine | null> {
    return wineStore.get(id) ?? null;
  }

  async mintWine(data: WineData): Promise<Wine> {
    const wine: Wine = {
      id: `wine-${uuidv4().slice(0, 8)}`,
      wineData: data,
      status: "minted",
      ownerId: "user-001",
      provenance: [
        {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          type: "TOKENIZED",
          description: "Wine tokenized on DUAL network",
          actor: "DUAL Protocol",
          verified: true,
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        },
      ],
      faces: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    wineStore.set(wine.id, wine);
    return wine;
  }

  async updateWineStatus(id: string, status: WineStatus): Promise<Wine | null> {
    const wine = wineStore.get(id);
    if (!wine) return null;
    const valid = VALID_TRANSITIONS[wine.status] ?? [];
    if (!valid.includes(status)) {
      throw new Error(`Invalid transition: ${wine.status} â ${status}`);
    }
    wine.status = status;
    wine.updatedAt = new Date().toISOString();
    return wine;
  }

  async executeAction(wineId: string, type: ActionType, params: Record<string, unknown> = {}): Promise<Action> {
    const wine = wineStore.get(wineId);
    if (!wine) throw new Error(`Wine ${wineId} not found`);

    const action: Action = {
      id: `act-${uuidv4().slice(0, 8)}`,
      wineId,
      type,
      status: "completed",
      params,
      initiatedBy: "user-001",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    actionStore.set(action.id, action);

    // Apply state change
    const statusMap: Partial<Record<ActionType, WineStatus>> = {
      MINT: "minted",
      LIST: "listed",
      PURCHASE: "sold",
      BURN: "burned",
      REDEEM: "redeemed",
    };
    if (statusMap[type]) {
      try {
        await this.updateWineStatus(wineId, statusMap[type]!);
      } catch {
        // ignore invalid transitions in demo
      }
    }

    return action;
  }

  async getAction(id: string): Promise<Action | null> {
    return actionStore.get(id) ?? null;
  }

  async getWineActions(wineId: string): Promise<Action[]> {
    return Array.from(actionStore.values()).filter((a) => a.wineId === wineId);
  }

  async listActions(): Promise<Action[]> {
    return Array.from(actionStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTemplate(): Promise<Template | null> {
    return {
      id: "tmpl-wine-001",
      name: "Wine Token",
      description: "Standard wine tokenization template for the DUAL network",
      properties: [
        { key: "name", type: "string", required: true },
        { key: "producer", type: "string", required: true },
        { key: "region", type: "string", required: true },
        { key: "vintage", type: "number", required: true },
        { key: "varietal", type: "string", required: true },
        { key: "type", type: "enum", required: true, enumValues: ["red", "white", "sparkling", "rosÃ©", "dessert", "fortified"] },
      ],
      actions: [
        { type: "MINT", label: "Mint Token", description: "Create a new wine token", requiredParams: [] },
        { type: "LIST", label: "List for Sale", description: "List wine on marketplace", requiredParams: ["price"] },
        { type: "TRANSFER", label: "Transfer", description: "Transfer ownership", requiredParams: ["recipientId"] },
        { type: "VERIFY", label: "Verify", description: "Verify authenticity", requiredParams: [] },
      ],
      organizationId: "org-001",
      createdAt: "2024-01-01T00:00:00Z",
    };
  }

  async listTemplates(): Promise<Template[]> {
    const t = await this.getTemplate();
    return t ? [t] : [];
  }

  async getOrganization(): Promise<Organization | null> {
    return {
      id: "org-001",
      name: "DUAL Wine Vault",
      description: "Premium wine tokenization and trading platform",
      members: [
        { userId: "user-001", role: "owner", joinedAt: "2024-01-01T00:00:00Z" },
        { userId: "user-002", role: "admin", joinedAt: "2024-01-15T00:00:00Z" },
      ],
      createdAt: "2024-01-01T00:00:00Z",
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return DEMO_STATS;
  }
}

// âââ DUAL API Provider âââ

// Gateway Object Mapper — enriches objects with realistic wine data
const WINE_CATALOG = [
  { name: 'Ch\u00e2teau Margaux 2015', producer: 'Ch\u00e2teau Margaux', region: 'Bordeaux', country: 'France', vintage: 2015, varietal: 'Cabernet Sauvignon Blend', type: 'red' as any, abv: 13.5, price: 850, description: 'Exceptional vintage with notes of blackcurrant, violet, and cedar.', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop' },
  { name: 'Dom P\u00e9rignon 2012', producer: 'Mo\u00ebt & Chandon', region: 'Champagne', country: 'France', vintage: 2012, varietal: 'Chardonnay/Pinot Noir', type: 'sparkling' as any, abv: 12.5, price: 320, description: 'Intense and vibrant with white flowers, citrus, and toasted almonds.', imageUrl: 'https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=400&h=600&fit=crop' },
  { name: 'Penfolds Grange 2018', producer: 'Penfolds', region: 'South Australia', country: 'Australia', vintage: 2018, varietal: 'Shiraz', type: 'red' as any, abv: 14.5, price: 950, description: 'Dark fruit, chocolate, and spice with velvety tannins.', imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?w=400&h=600&fit=crop' },
  { name: 'Cloudy Bay Sauvignon Blanc 2023', producer: 'Cloudy Bay', region: 'Marlborough', country: 'New Zealand', vintage: 2023, varietal: 'Sauvignon Blanc', type: 'white' as any, abv: 13.0, price: 28, description: 'Crisp and refreshing with passion fruit and lime zest.', imageUrl: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400&h=600&fit=crop' },
  { name: 'Antinori Tignanello 2019', producer: 'Marchesi Antinori', region: 'Tuscany', country: 'Italy', vintage: 2019, varietal: 'Sangiovese/Cabernet', type: 'red' as any, abv: 14.0, price: 120, description: 'Cherry, plum, and leather with earthy undertones.', imageUrl: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=600&fit=crop' },
  { name: 'Opus One 2019', producer: 'Opus One Winery', region: 'Napa Valley', country: 'USA', vintage: 2019, varietal: 'Cabernet Sauvignon Blend', type: 'red' as any, abv: 14.5, price: 450, description: 'Cassis, dark cherry, and violet with polished tannins.', imageUrl: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop' },
  { name: "Ch\u00e2teau d'Yquem 2017", producer: "Ch\u00e2teau d'Yquem", region: 'Sauternes', country: 'France', vintage: 2017, varietal: 'S\u00e9millon/Sauvignon Blanc', type: 'dessert' as any, abv: 13.5, price: 420, description: 'Apricot, honey, and saffron with bright acidity.', imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&h=600&fit=crop' },
  { name: "Graham's 20 Year Tawny Port", producer: "Graham's", region: 'Douro Valley', country: 'Portugal', vintage: 2004, varietal: 'Touriga Nacional Blend', type: 'fortified' as any, abv: 20.0, price: 65, description: 'Walnut, butterscotch, and dried fig with a nutty finish.', imageUrl: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=400&h=600&fit=crop' },
  { name: 'Whispering Angel Ros\u00e9 2023', producer: "Ch\u00e2teau d'Esclans", region: 'Provence', country: 'France', vintage: 2023, varietal: 'Grenache/Cinsault', type: 'red' as any, abv: 13.0, price: 22, description: 'Pale pink with strawberry, white peach, and floral notes.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=600&fit=crop' },
  { name: 'Barossa Valley Shiraz 2020', producer: 'Henschke', region: 'Barossa Valley', country: 'Australia', vintage: 2020, varietal: 'Shiraz', type: 'red' as any, abv: 14.5, price: 180, description: 'Blackberry, pepper, and smoked meat with firm tannins.', imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop' },
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mapGatewayToWine(obj: any): Wine {
  const m = obj.metadata || {};
  const idx = hashCode(obj.id || '') % WINE_CATALOG.length;
  const seed = WINE_CATALOG[idx];
  const hasRealData = m.producer || m.varietal || m.vintage;
  const w = hasRealData ? m : seed;
  return {
    id: obj.id || '',
    templateId: obj.template_id,
    objectId: obj.id,
    wineData: {
      name: m.name && m.name !== 'Sustainable Electronics DPP' ? m.name : w.name,
      producer: w.producer || 'Unknown Producer',
      region: w.region || 'Unknown Region',
      country: w.country || 'Unknown Country',
      vintage: w.vintage || 2020,
      varietal: w.varietal || 'Unknown Varietal',
      type: w.type || 'red',
      abv: w.abv || 14.0,
      volume: m.volume || '750ml',
      quantity: m.quantity || 1,
      condition: m.condition || 'excellent',
      storage: m.storage || 'professional',
      drinkingWindow: m.drinkingWindow || { from: 2024, to: 2034 },
      ratings: m.ratings || [],
      certifications: m.certifications || [],
      currentValue: w.price || 0,
      purchasePrice: w.price || 0,
      description: w.description || '',
      tastingNotes: m.tastingNotes || { nose: '', palate: '', finish: '' },
      imageUrl: w.imageUrl,
    },
    provenance: [{
      id: obj.id + '-prov',
      timestamp: obj.when_created || new Date().toISOString(),
      type: 'TOKENIZED',
      description: 'Registered on DUAL network',
      actor: obj.owner || 'DUAL Protocol',
      verified: !!obj.content_hash,
      txHash: obj.content_hash,
    }],
    faces: [],
    status: (m.status || (obj.content_hash ? 'anchored' : 'minted')) as any,
    ownerId: obj.owner || '',
    createdAt: obj.when_created || new Date().toISOString(),
    updatedAt: obj.when_modified || new Date().toISOString(),
    blockchainTxHash: obj.integrity_hash,
  };
}

class DualDataProvider implements DataProvider {
  async listWines(): Promise<Wine[]> {
    const client = getDualClient();
    const result = await client.objects.listObjects({ limit: 100, template_id: process.env.DUAL_TEMPLATE_ID || undefined });
    const objects = result?.objects || result?.data || [];
    return (objects as any[]).map((obj: any) => mapGatewayToWine(obj));
  }

  async getWine(id: string): Promise<Wine | null> {
    try {
      const client = getDualClient();
      const obj = await client.objects.getObject(id);
      return obj ? mapGatewayToWine(obj as any) : null;
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
      const stats = await client.indexer.getPublicStats();
      return stats;
    } catch {
      return DEMO_STATS;
    }
  }
}

// âââ Factory âââ

let provider: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (!provider) {
    provider = isDualConfigured() ? new DualDataProvider() : new DemoDataProvider();
  }
  return provider;
}
