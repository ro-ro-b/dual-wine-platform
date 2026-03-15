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
import { isDualConfigured } from "./env";
import { getDualClient } from "./dual-client";
import { DEMO_WINES, DEMO_ACTIONS, DEMO_STATS } from "./demo-data";
import { v4 as uuidv4 } from "uuid";

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

// ─── In-Memory Demo Provider ───

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
      throw new Error(`Invalid transition: ${wine.status} → ${status}`);
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
        { key: "type", type: "enum", required: true, enumValues: ["red", "white", "sparkling", "rosé", "dessert", "fortified"] },
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

// ─── DUAL API Provider ───

class DualDataProvider implements DataProvider {
  private client = getDualClient();

  async listWines(): Promise<Wine[]> {
    return this.client.listWines();
  }

  async getWine(id: string): Promise<Wine | null> {
    try {
      return await this.client.getWine(id);
    } catch {
      return null;
    }
  }

  async mintWine(data: WineData): Promise<Wine> {
    const config = await import("./env").then((m) => m.getConfig());
    return this.client.mintWine(config.dualTemplateId, data as unknown as Record<string, unknown>);
  }

  async updateWineStatus(): Promise<Wine | null> {
    // Handled via DUAL actions
    return null;
  }

  async executeAction(wineId: string, type: ActionType, params?: Record<string, unknown>): Promise<Action> {
    return this.client.executeAction(wineId, type, params);
  }

  async getAction(id: string): Promise<Action | null> {
    try {
      return await this.client.getAction(id);
    } catch {
      return null;
    }
  }

  async getWineActions(wineId: string): Promise<Action[]> {
    return this.client.getWineActions(wineId);
  }

  async listActions(): Promise<Action[]> {
    const wines = await this.client.listWines();
    const allActions: Action[] = [];
    for (const wine of wines) {
      const actions = await this.client.getWineActions(wine.id);
      allActions.push(...actions);
    }
    return allActions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTemplate(id: string): Promise<Template | null> {
    try {
      return await this.client.getTemplate(id);
    } catch {
      return null;
    }
  }

  async listTemplates(): Promise<Template[]> {
    return this.client.listTemplates();
  }

  async getOrganization(id: string): Promise<Organization | null> {
    try {
      return await this.client.getOrganization(id);
    } catch {
      return null;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const wines = await this.client.listWines();
    const totalValue = wines.reduce((sum, w) => sum + (w.wineData?.currentValue ?? 0), 0);
    const regions: Record<string, number> = {};
    const valueByType: Record<string, number> = {};
    wines.forEach((w) => {
      const r = w.wineData?.region ?? "Unknown";
      regions[r] = (regions[r] ?? 0) + 1;
      const t = w.wineData?.type ?? "red";
      valueByType[t] = (valueByType[t] ?? 0) + (w.wineData?.currentValue ?? 0);
    });
    return {
      totalWines: wines.length,
      totalValue,
      totalActions: 0,
      mintedThisMonth: wines.filter((w) => {
        const d = new Date(w.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      activeListings: wines.filter((w) => w.status === "listed").length,
      recentSales: wines.filter((w) => w.status === "sold").length,
      topRegions: Object.entries(regions)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      valueByType: Object.entries(valueByType).map(([type, value]) => ({
        type: type as any,
        value,
      })),
    };
  }
}

// ─── Factory ───

let provider: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (!provider) {
    provider = isDualConfigured() ? new DualDataProvider() : new DemoDataProvider();
  }
  return provider;
}
