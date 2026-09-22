// Sovereign client mock mimicking Supabase for fully-offline local operation
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    orgName?: string;
    fullName?: string;
    accountType?: string;
    role?: string;
    verificationStatus?: 'Verified' | 'Pending' | 'Action Required';
  };
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
  user: User;
}

class SovereignSupabaseAuth {
  private listeners: Array<(event: string, session: Session | null) => void> = [];
  private currentSession: Session | null = null;

  constructor() {
    this.restoreSession();
  }

  public async restoreSession() {
    try {
      const stored = localStorage.getItem("sovereign_sessions");
      if (stored === "logged_out") {
        this.currentSession = null;
      } else if (stored) {
        this.currentSession = JSON.parse(stored);
        if (this.currentSession) {
          // Only refresh expiration for sessions that are not yet expired.
          // Never silently extend a possibly-stale session indefinitely.
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = this.currentSession.expires_at || now;
          if (expiresAt <= now) {
            this.currentSession = null;
            localStorage.setItem("sovereign_sessions", "logged_out");
          }
        }
      } else {
        // No seed demo session by default — start logged out.
        // This prevents unauthenticated admin-level access out of the box.
        this.currentSession = null;
      }
    } catch {
      this.currentSession = null;
    }
  }

  public async getSession() {
    return { data: { session: this.currentSession }, error: null };
  }

  public async signUp(params: { email: string; password?: string; options?: { data?: any } }) {
    const userMetadata = params.options?.data || {};
    const newUserSession: Session = {
      access_token: `local_token_${Math.random().toString(36).substring(2)}`,
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: `usr_${Math.random().toString(36).substring(2, 10)}`,
        email: params.email,
        user_metadata: userMetadata
      }
    };
    
    // Persist in local registry of users
    try {
      const storedUsers = localStorage.getItem("sovereign_registered_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];
      // Remove any existing registration with same email
      const filtered = usersList.filter((u: any) => u.email !== params.email);
      filtered.push({
        email: params.email,
        password: params.password || "",
        id: newUserSession.user.id,
        user_metadata: userMetadata
      });
      localStorage.setItem("sovereign_registered_users", JSON.stringify(filtered));
    } catch (e) {
      console.error("Failed to store mock user:", e);
    }

    this.currentSession = newUserSession;
    localStorage.setItem("sovereign_sessions", JSON.stringify(newUserSession));
    this.triggerChange("SIGNED_IN");
    return { data: { user: newUserSession.user, session: newUserSession }, error: null };
  }

  public async signInWithPassword(params: { email: string; password?: string }) {
    // Check local registered user list first
    let userMetadata: any = null;
    let userId = `usr_${Math.random().toString(36).substring(2, 10)}`;
    
    try {
      const storedUsers = localStorage.getItem("sovereign_registered_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];
      const found = usersList.find((u: any) => u.email === params.email);
      if (found) {
        userMetadata = found.user_metadata;
        userId = found.id;
      }
    } catch (e) {
      console.error("Failed to read mock users list:", e);
    }

    if (!userMetadata) {
      // Fallback dynamic defaults — ONLY for explicitly registered demo accounts.
      // Admin role is NEVER granted by email substring.
      const isRegulator = params.email.includes("regulator");
      const isAdmin = params.email === 'admin@acme.eu';

      const accountType = isAdmin ? "ADMIN" : isRegulator ? "REGULATOR" : "CLIENT";
      const orgName = isAdmin ? "Sovereign Cloud HQ" : isRegulator ? "EU Regulatory Body" : "Acme Corporation (EU)";
      const fullName = isAdmin ? "SaaS Administrator" : isRegulator ? "Heinrich Müller" : "Jane Doe";
      const role = isAdmin ? "ADMIN" : isRegulator ? "EU_REGULATOR" : "TENANT_OWNER";

      userMetadata = {
        orgName,
        fullName,
        accountType,
        role,
        // Seed demo accounts are never auto-verified. Real verification must come from the server.
        verificationStatus: 'Pending'
      };

      if (params.email === 'client@acme.eu') {
        userId = "usr_active_tenant";
      } else if (params.email === 'regulator@bfdi.bund.de') {
        userId = "usr_regulator";
        userMetadata.verificationStatus = 'Pending';
      } else if (params.email === 'admin@acme.eu') {
        userId = "usr_saas_admin";
        userMetadata.verificationStatus = 'Pending';
      }
    }

    this.currentSession = {
      access_token: `local_token_${Math.random().toString(36).substring(2)}`,
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: userId,
        email: params.email,
        user_metadata: userMetadata
      }
    };
    localStorage.setItem("sovereign_sessions", JSON.stringify(this.currentSession));
    this.triggerChange("SIGNED_IN");
    return { data: { user: this.currentSession.user, session: this.currentSession }, error: null };
  }

  public async signInWithOAuth(params: { provider: any, options?: { redirectTo?: string } }) {
    console.log(`[Mock] OAuth flow with ${params.provider} requires a real backend.`);
    // OAuth cannot be simulated client-side without a backend.
    // Return an error so the UI shows a proper "SSO not configured" state.
    return {
      data: { provider: params.provider, url: null },
      error: { message: 'OAuth/SSO is not available in offline demo mode. Please configure a backend authentication provider.' }
    };
  }

  public async signOut() {
    this.currentSession = null;
    localStorage.setItem("sovereign_sessions", "logged_out");
    this.triggerChange("SIGNED_OUT");
    return { error: null };
  }

  public onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.listeners.push(callback);
    // Trigger immediately with initial state
    callback("INITIAL_SESSION", this.currentSession);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private triggerChange(event: string) {
    this.listeners.forEach(l => l(event, this.currentSession));
  }
}

class SovereignSupabaseClient {
  public auth = new SovereignSupabaseAuth();
}

export const supabase = new SovereignSupabaseClient();
