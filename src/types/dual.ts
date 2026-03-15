// ─── DUAL Protocol Core Types ───

export interface Organization {
  id: string;
  name: string;
  description?: string;
  members: OrgMember[];
  createdAt: string;
}

export interface OrgMember {
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface Wallet {
  id: string;
  address: string;
  balance: number;
  tokens: string[];
}

export type FaceType = "image" | "document" | "certificate" | "label";

export interface Face {
  id: string;
  objectId: string;
  type: FaceType;
  url: string;
  name: string;
  mimeType: string;
  createdAt: string;
}

// ─── Wine Domain Types ───

export type WineType = "red" | "white" | "sparkling" | "rosé" | "dessert" | "fortified";

export type WineCondition = "pristine" | "excellent" | "very_good" | "good" | "fair" | "poor";

export type StorageType = "professional" | "home_cellar" | "bonded_warehouse" | "in_transit";

export interface TastingNotes {
  nose: string;
  palate: string;
  finish: string;
}

export interface CriticRating {
  critic: string;
  score: number;
  year: number;
}

export interface DrinkingWindow {
  from: number;
  to: number;
}

export interface WineData {
  name: string;
  producer: string;
  region: string;
  country: string;
  vintage: number;
  varietal: string;
  type: WineType;
  abv: number;
  volume: string;
  quantity: number;
  condition: WineCondition;
  storage: StorageType;
  drinkingWindow: DrinkingWindow;
  ratings: CriticRating[];
  certifications: string[];
  currentValue: number;
  purchasePrice: number;
  description: string;
  tastingNotes: TastingNotes;
  imageUrl?: string;
}

export interface ProvenanceEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  actor: string;
  location?: string;
  verified: boolean;
  txHash?: string;
}

export interface Wine {
  id: string;
  templateId?: string;
  objectId?: string;
  wineData: WineData;
  provenance: ProvenanceEvent[];
  faces: Face[];
  status: WineStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  anchoredAt?: string;
  blockchainTxHash?: string;
}

export type WineStatus =
  | "draft"
  | "minted"
  | "anchoring"
  | "anchored"
  | "listed"
  | "sold"
  | "transferred"
  | "redeemed"
  | "burned";

// ─── Action Types ───

export type ActionType =
  | "MINT"
  | "LIST"
  | "PURCHASE"
  | "TRANSFER"
  | "REDEEM"
  | "VERIFY"
  | "STORE"
  | "UPDATE_VALUATION"
  | "BURN";

export type ActionStatus = "pending" | "processing" | "completed" | "failed";

export interface Action {
  id: string;
  wineId: string;
  type: ActionType;
  status: ActionStatus;
  params: Record<string, unknown>;
  result?: Record<string, unknown>;
  initiatedBy: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// ─── Template Types ───

export interface TemplateProperty {
  key: string;
  type: "string" | "number" | "boolean" | "date" | "enum";
  required: boolean;
  description?: string;
  enumValues?: string[];
}

export interface TemplateAction {
  type: ActionType;
  label: string;
  description: string;
  requiredParams: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  properties: TemplateProperty[];
  actions: TemplateAction[];
  organizationId: string;
  createdAt: string;
}

// ─── Webhook Types ───

export type WebhookEventType =
  | "wine.minted"
  | "wine.anchored"
  | "wine.anchoring_failed"
  | "wine.listed"
  | "wine.sold"
  | "wine.transferred"
  | "wine.redeemed"
  | "wine.burned"
  | "action.completed"
  | "action.failed"
  | "valuation.updated";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  payload: Record<string, unknown>;
  timestamp: string;
  signature: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  active: boolean;
  createdAt: string;
}

// ─── Dashboard Stats ───

export interface DashboardStats {
  totalWines: number;
  totalValue: number;
  totalActions: number;
  mintedThisMonth: number;
  activeListings: number;
  recentSales: number;
  topRegions: { region: string; count: number }[];
  valueByType: { type: WineType; value: number }[];
}

// ─── Auth ───

export interface AuthSession {
  userId: string;
  role: "consumer" | "admin";
  walletAddress?: string;
  organizationId?: string;
}
