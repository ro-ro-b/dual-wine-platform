export interface AppConfig {
  dualConfigured: boolean;
  dualApiUrl: string;
  dualApiKey: string;
  dualOrgId: string;
  dualTemplateId: string;
  dualWebhookSecret: string;
  dualWebhookCallbackUrl: string;
  publicApiUrl: string;
}

export function isDualConfigured(): boolean {
  return process.env.DUAL_CONFIGURED === "true";
}

export function getConfig(): AppConfig {
  const dualConfigured = isDualConfigured();

  if (dualConfigured) {
    const required = [
      "DUAL_API_URL",
      "DUAL_API_KEY",
      "DUAL_ORG_ID",
      "DUAL_TEMPLATE_ID",
      "DUAL_WEBHOOK_SECRET",
      "DUAL_WEBHOOK_CALLBACK_URL",
    ];
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key} (DUAL_CONFIGURED=true)`);
      }
    }
  }

  return {
    dualConfigured,
    dualApiUrl: process.env.DUAL_API_URL ?? "https://api.dual.io",
    dualApiKey: process.env.DUAL_API_KEY ?? "",
    dualOrgId: process.env.DUAL_ORG_ID ?? "",
    dualTemplateId: process.env.DUAL_TEMPLATE_ID ?? "",
    dualWebhookSecret: process.env.DUAL_WEBHOOK_SECRET ?? "",
    dualWebhookCallbackUrl: process.env.DUAL_WEBHOOK_CALLBACK_URL ?? "",
    publicApiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  };
}
