import { and, eq, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import { v4 as uuid } from "uuid";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";

/** Net thumbs-up score required for community-verified / highlighted. */
export const COMMUNITY_VERIFIED_THRESHOLD = 5;

export type ProfileVoteSummary = {
  voteScore: number;
  voteUpCount: number;
  voteDownCount: number;
  communityVerified: boolean;
  myVote: 1 | -1 | null;
};

export function hashAnonVoterFingerprint(raw: string): string {
  return createHash("sha256").update(raw.trim().toLowerCase()).digest("hex").slice(0, 40);
}

export function voterKeyForUser(userId: number): string {
  return `user:${userId}`;
}

export function voterKeyForAnon(fingerprint: string): string {
  return `anon:${hashAnonVoterFingerprint(fingerprint)}`;
}

function recomputeProfileVotes(db: AppDb, profileId: number): ProfileVoteSummary {
  const rows = db
    .select({ value: schema.profileVotes.value })
    .from(schema.profileVotes)
    .where(eq(schema.profileVotes.profileId, profileId))
    .all();
  let up = 0;
  let down = 0;
  for (const row of rows) {
    if (row.value > 0) up += 1;
    else if (row.value < 0) down += 1;
  }
  const voteScore = up - down;
  const communityVerified = voteScore >= COMMUNITY_VERIFIED_THRESHOLD;
  db.update(schema.calibrationProfiles)
    .set({
      voteScore,
      voteUpCount: up,
      voteDownCount: down,
      communityVerified,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.calibrationProfiles.id, profileId))
    .run();
  return {
    voteScore,
    voteUpCount: up,
    voteDownCount: down,
    communityVerified,
    myVote: null,
  };
}

export function getProfileVoteSummary(
  db: AppDb,
  profileUuid: string,
  voterKey?: string | null,
): ProfileVoteSummary | null {
  const profile = db
    .select()
    .from(schema.calibrationProfiles)
    .where(eq(schema.calibrationProfiles.uuid, profileUuid))
    .get();
  if (!profile) return null;
  let myVote: 1 | -1 | null = null;
  if (voterKey) {
    const mine = db
      .select()
      .from(schema.profileVotes)
      .where(
        and(
          eq(schema.profileVotes.profileId, profile.id),
          eq(schema.profileVotes.voterKey, voterKey),
        ),
      )
      .get();
    if (mine?.value === 1 || mine?.value === -1) myVote = mine.value;
  }
  return {
    voteScore: profile.voteScore,
    voteUpCount: profile.voteUpCount,
    voteDownCount: profile.voteDownCount,
    communityVerified: profile.communityVerified,
    myVote,
  };
}

/**
 * Cast or flip a thumbs vote. Pass value `0` to clear the vote.
 * Returns updated summary including the caller's current vote.
 */
export function castProfileVote(
  db: AppDb,
  input: {
    profileUuid: string;
    voterKey: string;
    userId?: number | null;
    value: 1 | -1 | 0;
  },
): ProfileVoteSummary {
  if (!input.voterKey.trim()) {
    throw new Error("Missing voter identity");
  }
  if (![1, -1, 0].includes(input.value)) {
    throw new Error("Vote must be +1, −1, or 0 to clear");
  }
  const profile = db
    .select()
    .from(schema.calibrationProfiles)
    .where(eq(schema.calibrationProfiles.uuid, input.profileUuid))
    .get();
  if (!profile) throw new Error("Unknown calibration profile");

  const existing = db
    .select()
    .from(schema.profileVotes)
    .where(
      and(
        eq(schema.profileVotes.profileId, profile.id),
        eq(schema.profileVotes.voterKey, input.voterKey),
      ),
    )
    .get();

  if (input.value === 0) {
    if (existing) {
      db.delete(schema.profileVotes)
        .where(eq(schema.profileVotes.id, existing.id))
        .run();
    }
  } else if (existing) {
    db.update(schema.profileVotes)
      .set({
        value: input.value,
        userId: input.userId ?? existing.userId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.profileVotes.id, existing.id))
      .run();
  } else {
    db.insert(schema.profileVotes)
      .values({
        uuid: uuid(),
        profileId: profile.id,
        userId: input.userId ?? null,
        voterKey: input.voterKey,
        value: input.value,
      })
      .run();
  }

  const summary = recomputeProfileVotes(db, profile.id);
  return {
    ...summary,
    myVote: input.value === 0 ? null : input.value,
  };
}

/** Prefer verified, then higher net score when ordering profile lists. */
export function profileVoteOrderSql() {
  return sql`${schema.calibrationProfiles.communityVerified} DESC, ${schema.calibrationProfiles.voteScore} DESC`;
}
