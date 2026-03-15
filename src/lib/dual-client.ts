import { getConfig } from "./env";
import type {
  Wine,
  Action,
  ActionType,
  Template,
  Organization,
  Webhook,
  WebhookEventType,
  Face,
} from "@/types/dual";

class DualClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const config = getConfig();
    this.baseUrl = config.dualApiUrl;
    this.apiKey = config.dualApiKey;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`DUAL API error ${res.status}: ${error}`);
    }

    return res.json();
  }

  // ─── Wines (Objects) ───

  async listWines(): Promise<Wine[]> {
    return this.request<Wine[]>("/objects");
  }

  async getWine(id: string): Promise<Wine> {
    return this.request<Wine>(`/objects/${id}`);
  }

  async mintWine(templateId: string, data: Record<string, unknown>): Promise<Wine> {
    return this.request<Wine>("/objects", {
      method: "POST",
      body: JSON.stringify({ templateId, data }),
    });
  }

  // ─── Actions ───

  async executeAction(
    wineId: string,
    type: ActionType,
    params: Record<string, unknown> = {}
  ): Promise<Action> {
    return this.request<Action>("/actions", {
      method: "POST",
      body: JSON.stringify({ objectId: wineId, type, params }),
    });
  }

  async getAction(id: string): Promise<Action> {
    return this.request<Action>(`/actions/${id}`);
  }

  async getWineActions(wineId: string): Promise<Action[]> {
    return this.request<Action[]>(`/objects/${wineId}/actions`);
  }

  // ─── Templates ───

  async getTemplate(id: string): Promise<Template> {
    return this.request<Template>(`/templates/${id}`);
  }

  async listTemplates(): Promise<Template[]> {
    return this.request<Template[]>("/templates");
  }

  async createTemplate(data: Partial<Template>): Promise<Template> {
    return this.request<Template>("/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ─── Organizations ───

  async createOrganization(name: string, description?: string): Promise<Organization> {
    return this.request<Organization>("/organizations", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`);
  }

  async listOrganizations(): Promise<Organization[]> {
    return this.request<Organization[]>("/organizations");
  }

  // ─── Webhooks ───

  async subscribeWebhook(
    url: string,
    events: WebhookEventType[],
    secret: string
  ): Promise<Webhook> {
    return this.request<Webhook>("/webhooks", {
      method: "POST",
      body: JSON.stringify({ url, events, secret }),
    });
  }

  async listWebhooks(): Promise<Webhook[]> {
    return this.request<Webhook[]>("/webhooks");
  }

  async deleteWebhook(id: string): Promise<void> {
    await this.request(`/webhooks/${id}`, { method: "DELETE" });
  }

  // ─── Faces (Attachments) ───

  async uploadFace(objectId: string, file: FormData): Promise<Face> {
    const res = await fetch(`${this.baseUrl}/objects/${objectId}/faces`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  }

  async getFaces(objectId: string): Promise<Face[]> {
    return this.request<Face[]>(`/objects/${objectId}/faces`);
  }
}

let client: DualClient | null = null;

export function getDualClient(): DualClient {
  if (!client) client = new DualClient();
  return client;
}
