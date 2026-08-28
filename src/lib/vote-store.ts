export type VoteChoice = "agree" | "disagree";

export type VoteStats = {
  agree: number;
  disagree: number;
};

declare global {
  var __rasuahVoteStore: Map<string, VoteStats> | undefined;
}

const voteStore = globalThis.__rasuahVoteStore ?? new Map<string, VoteStats>();

if (!globalThis.__rasuahVoteStore) {
  globalThis.__rasuahVoteStore = voteStore;
}

export function getVoteStats(reportId: string): VoteStats {
  return voteStore.get(reportId) ?? { agree: 0, disagree: 0 };
}

export function applyVote(reportId: string, choice: VoteChoice, previousChoice?: VoteChoice | null) {
  const current = getVoteStats(reportId);
  const next = { ...current };

  if (previousChoice === "agree") {
    next.agree = Math.max(0, next.agree - 1);
  }

  if (previousChoice === "disagree") {
    next.disagree = Math.max(0, next.disagree - 1);
  }

  if (!previousChoice || previousChoice !== choice) {
    next[choice] += 1;
  }

  voteStore.set(reportId, next);
  return next;
}
