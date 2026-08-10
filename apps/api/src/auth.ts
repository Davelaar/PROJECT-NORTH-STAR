import { eq } from "drizzle-orm";
import {
  hashPassword,
  hashToken,
  schema,
  type AppDb,
  verifyPassword,
} from "@open-filament/db";
import { randomBytes } from "node:crypto";
import { v4 as uuid } from "uuid";

export type AuthScope =
  | "read:filaments"
  | "write:profiles"
  | "write:calibrations"
  | "write:rfid"
  | "moderate"
  | "*";

export type AuthUser = {
  id: number;
  uuid: string;
  username: string;
  role: string;
  trustScore: number;
  scopes: string[];
};

export function scopesForRole(role: string): AuthScope[] {
  const base: AuthScope[] = [
    "read:filaments",
    "write:profiles",
    "write:calibrations",
    "write:rfid",
  ];
  if (
    role === "administrator" ||
    role === "moderator" ||
    role === "trusted_contributor"
  ) {
    return [...base, "moderate"];
  }
  return base;
}

export function parseScopes(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === "string");
    }
  } catch {
    // fall through
  }
  return [];
}

export function hasScope(user: AuthUser, required: AuthScope | AuthScope[]): boolean {
  const needed = Array.isArray(required) ? required : [required];
  if (user.scopes.includes("*")) return true;
  return needed.some((s) => user.scopes.includes(s));
}

export async function resolveBearerUser(
  db: AppDb,
  authorizationHeader?: string,
): Promise<AuthUser | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) return null;
  const tokenHash = hashToken(token);
  const row = db
    .select({
      id: schema.users.id,
      uuid: schema.users.uuid,
      username: schema.users.username,
      role: schema.users.role,
      trustScore: schema.users.trustScore,
      revokedAt: schema.apiTokens.revokedAt,
      expiresAt: schema.apiTokens.expiresAt,
      scopes: schema.apiTokens.scopes,
    })
    .from(schema.apiTokens)
    .innerJoin(schema.users, eq(schema.apiTokens.userId, schema.users.id))
    .where(eq(schema.apiTokens.tokenHash, tokenHash))
    .get();
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt && new Date(row.expiresAt) < new Date()) return null;
  if (row.role === "anonymous") return null;
  const status = db
    .select({ status: schema.users.status })
    .from(schema.users)
    .where(eq(schema.users.id, row.id))
    .get();
  if (!status || status.status === "deleted" || status.status === "suspended") {
    return null;
  }
  // Touch last_used_at without blocking the request path on failure.
  try {
    db.update(schema.apiTokens)
      .set({ lastUsedAt: new Date().toISOString() })
      .where(eq(schema.apiTokens.tokenHash, tokenHash))
      .run();
  } catch {
    // ignore
  }
  return {
    id: row.id,
    uuid: row.uuid,
    username: row.username,
    role: row.role,
    trustScore: row.trustScore,
    scopes: parseScopes(row.scopes),
  };
}

function issueToken(db: AppDb, user: typeof schema.users.$inferSelect): string {
  const token = randomBytes(32).toString("hex");
  const scopes = scopesForRole(user.role);
  db.insert(schema.apiTokens)
    .values({
      uuid: uuid(),
      userId: user.id,
      name: "session",
      tokenHash: hashToken(token),
      scopes: JSON.stringify(scopes),
    })
    .run();
  return token;
}

export async function loginWithPassword(
  db: AppDb,
  usernameOrEmail: string,
  password: string,
): Promise<{ user: AuthUser; token: string; scopes: string[] } | null> {
  const user =
    db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, usernameOrEmail))
      .get() ??
    db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, usernameOrEmail))
      .get();
  if (!user?.passwordHash) return null;
  if (user.status === "deleted" || user.status === "suspended") return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const scopes = scopesForRole(user.role);
  const token = issueToken(db, user);
  return {
    token,
    scopes,
    user: {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      role: user.role,
      trustScore: user.trustScore,
      scopes,
    },
  };
}

export async function registerUser(
  db: AppDb,
  input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  },
) {
  const passwordHash = await hashPassword(input.password);
  const [user] = db
    .insert(schema.users)
    .values({
      uuid: uuid(),
      username: input.username,
      email: input.email,
      displayName: input.displayName ?? input.username,
      passwordHash,
      role: "registered",
    })
    .returning()
    .all();
  if (!user) throw new Error("Failed to create user");
  const scopes = scopesForRole(user.role);
  const token = issueToken(db, user);
  return {
    token,
    scopes,
    user: {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      role: user.role,
      trustScore: user.trustScore,
      scopes,
    },
  };
}
