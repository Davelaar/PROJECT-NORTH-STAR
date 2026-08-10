import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { createDb, type AppDb } from "./client.js";
import { hashPassword } from "./password.js";
import * as schema from "./schema.js";

const COMMUNITY_USERNAME = "community_visitor";

/** System user for anonymous community profile submissions. */
export async function ensureCommunityUser(
  dbOrPath?: AppDb | string,
): Promise<{ id: number; uuid: string; username: string }> {
  const db =
    typeof dbOrPath === "object" && dbOrPath !== null && "select" in dbOrPath
      ? dbOrPath
      : createDb(typeof dbOrPath === "string" ? dbOrPath : undefined);

  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, COMMUNITY_USERNAME))
    .get();
  if (existing) {
    return {
      id: existing.id,
      uuid: existing.uuid,
      username: existing.username,
    };
  }

  const passwordHash = await hashPassword(`community-${uuid()}`);
  const [row] = db
    .insert(schema.users)
    .values({
      uuid: uuid(),
      username: COMMUNITY_USERNAME,
      displayName: "Community visitor",
      email: "community@openfilament.local",
      passwordHash,
      role: "registered",
      trustScore: 1,
      reputation: 0,
      locale: "en",
    })
    .returning()
    .all();
  if (!row) throw new Error("Failed to create community user");
  return { id: row.id, uuid: row.uuid, username: row.username };
}
