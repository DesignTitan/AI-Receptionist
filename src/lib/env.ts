/**
 * Central, lazily-read environment access.
 *
 * Nothing here throws at import time: the app is designed to boot with an
 * empty environment and fall back to demo mode, so a missing key degrades a
 * feature rather than breaking the build.
 */

const read = (key: string) => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
};

export const env = {
  get supabaseUrl() {
    return read("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceKey() {
    return read("SUPABASE_SERVICE_ROLE_KEY");
  },
  /**
   * "public" (default): the product site and demos are open; /admin still needs
   * the staff password. "locked": SITE_PASSWORD in front of everything except
   * provider webhooks — one variable re-gates the whole site pre-launch.
   */
  get siteGate(): "public" | "locked" {
    return (read("SITE_GATE") ?? "public").toLowerCase() === "locked" ? "locked" : "public";
  },
  get sitePassword() {
    return read("SITE_PASSWORD") ?? "bubs2026";
  },
  get adminPassword() {
    return read("ADMIN_PASSWORD") ?? "demo1234";
  },
  get adminSessionSecret() {
    return read("ADMIN_SESSION_SECRET") ?? "insecure-dev-secret-change-me";
  },
  get voiceProvider() {
    return (read("VOICE_PROVIDER") ?? "demo").toLowerCase();
  },
  get voiceWebhookSecret() {
    return read("VOICE_WEBHOOK_SECRET");
  },
  get vapi() {
    return {
      apiKey: read("VAPI_API_KEY"),
      assistantId: read("VAPI_ASSISTANT_ID"),
      phoneNumberId: read("VAPI_PHONE_NUMBER_ID"),
    };
  },
  get bland() {
    return {
      apiKey: read("BLAND_API_KEY"),
      voiceId: read("BLAND_VOICE_ID"),
      pathwayId: read("BLAND_PATHWAY_ID"),
    };
  },
  get omnidimension() {
    return {
      apiKey: read("OMNIDIMENSION_API_KEY"),
      agentId: read("OMNIDIMENSION_AGENT_ID"),
      // Optional: a number on the account to call from; omitted, the platform default rings.
      fromNumberId: read("OMNIDIMENSION_FROM_NUMBER_ID"),
    };
  },
  /** Cloudflare Turnstile: the human check in front of every live call. */
  get turnstile() {
    return {
      siteKey: read("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
      secretKey: read("TURNSTILE_SECRET_KEY"),
    };
  },
  get resendApiKey() {
    return read("RESEND_API_KEY");
  },
  get emailFrom() {
    return read("EMAIL_FROM") ?? "AI Receptionist <onboarding@resend.dev>";
  },
  /** Where "Talk to us" points on the product site; the CTA is omitted when unset. */
  get contactEmail() {
    return read("CONTACT_EMAIL") ?? this.ownerEmail;
  },
  /** Hard ceiling on "have it call you" demo calls per 24h, across the deployment. */
  get tryCallDailyCap() {
    return read("TRY_CALL_DAILY_CAP") ?? "50";
  },
  get ownerEmail() {
    return read("OWNER_EMAIL") ?? read("CLINIC_OWNER_EMAIL");
  },
  /** One timezone for every demo business; the old CLINIC_ name still works. */
  get timezone() {
    return read("SITE_TIMEZONE") ?? read("CLINIC_TIMEZONE") ?? "America/New_York";
  },
  get siteUrl() {
    const explicit = read("NEXT_PUBLIC_SITE_URL");
    if (explicit) return explicit.replace(/\/$/, "");
    const vercel =
      read("VERCEL_PROJECT_PRODUCTION_URL") ?? read("VERCEL_URL");
    if (vercel) return `https://${vercel}`;
    return "http://localhost:3000";
  },
};

/** True when Supabase credentials are present; otherwise the in-memory store is used. */
export const isSupabaseConfigured = () =>
  Boolean(env.supabaseUrl && env.supabaseServiceKey);

/** True when a real voice provider is wired up (as opposed to the simulator). */
export const isVoiceProviderConfigured = () => {
  switch (env.voiceProvider) {
    case "vapi":
      return Boolean(env.vapi.apiKey && env.vapi.assistantId);
    case "bland":
      return Boolean(env.bland.apiKey);
    case "omnidimension":
      return Boolean(env.omnidimension.apiKey && env.omnidimension.agentId);
    default:
      return false;
  }
};

/** True when the human check can be rendered and verified. */
export const isHumanCheckConfigured = () =>
  Boolean(env.turnstile.siteKey && env.turnstile.secretKey);

/**
 * A live call from the public site needs BOTH a voice line and the human
 * check. Without the check, a configured provider is deliberately not used
 * from the homepage: a public form that dials numbers must never be reachable
 * by a script. Confirmation calls for bookings are unaffected.
 */
export const isLiveCallReady = () => isVoiceProviderConfigured() && isHumanCheckConfigured();

export const isEmailConfigured = () =>
  Boolean(env.resendApiKey && env.ownerEmail);
