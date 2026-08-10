"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { apiPost, getApiBase } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

type VoteSummary = {
  voteScore: number;
  voteUpCount: number;
  voteDownCount: number;
  communityVerified: boolean;
  myVote: 1 | -1 | null;
};

const FINGERPRINT_KEY = "of_voter_fp";

function ensureVoterFingerprint(): string {
  try {
    const existing = localStorage.getItem(FINGERPRINT_KEY);
    if (existing && existing.length >= 8) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem(FINGERPRINT_KEY, next);
    return next;
  } catch {
    return `tmp-${Date.now()}`;
  }
}

export function ProfileVoteButtons({ profileUuid }: { profileUuid: string }) {
  const m = useMessages().profile;
  const [summary, setSummary] = useState<VoteSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState<ReturnType<typeof loadAuth>>(null);

  const refresh = useCallback(async () => {
    const a = loadAuth();
    setAuth(a);
    const fp = ensureVoterFingerprint();
    const qs = a ? "" : `?fingerprint=${encodeURIComponent(fp)}`;
    const res = await fetch(
      `${getApiBase()}/api/v1/profiles/${profileUuid}/votes${qs}`,
      { credentials: "include" },
    );
    if (!res.ok) return;
    setSummary((await res.json()) as VoteSummary);
  }, [profileUuid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function vote(value: 1 | -1 | 0) {
    setBusy(true);
    setError("");
    try {
      const a = loadAuth();
      const body: { value: 1 | -1 | 0; voterFingerprint?: string } = { value };
      if (!a) body.voterFingerprint = ensureVoterFingerprint();
      const next = await apiPost<VoteSummary>(
        `/api/v1/profiles/${profileUuid}/votes`,
        body,
      );
      setSummary(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : m.voteError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel stack profile-votes">
      <h3>{m.voteHeading}</h3>
      <p className="muted">{m.voteLead}</p>
      {summary?.communityVerified ? (
        <p className="badge badge-verified">{m.verifiedBadge}</p>
      ) : (
        <p className="muted">{m.verifiedHint.replace("{threshold}", "5")}</p>
      )}
      <div className="vote-row">
        <button
          type="button"
          className={`btn vote-btn${summary?.myVote === 1 ? " is-active" : ""}`}
          disabled={busy || !summary}
          aria-pressed={summary?.myVote === 1}
          aria-label={m.thumbsUp}
          onClick={() => void vote(summary?.myVote === 1 ? 0 : 1)}
        >
          👍 {summary?.voteUpCount ?? 0}
        </button>
        <button
          type="button"
          className={`btn btn-secondary vote-btn${summary?.myVote === -1 ? " is-active" : ""}`}
          disabled={busy || !summary}
          aria-pressed={summary?.myVote === -1}
          aria-label={m.thumbsDown}
          onClick={() => void vote(summary?.myVote === -1 ? 0 : -1)}
        >
          👎 {summary?.voteDownCount ?? 0}
        </button>
        <span className="vote-net muted">
          {m.voteNet.replace("{score}", String(summary?.voteScore ?? 0))}
        </span>
      </div>
      {!auth ? (
        <p className="muted">
          {m.voteAnonOk}{" "}
          <Link href="/login">{m.voteLoginOptional}</Link>
        </p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
