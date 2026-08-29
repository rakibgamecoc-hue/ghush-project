export type VoteChoice = "agree" | "disagree";

import prisma from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

export type VoteStats = {
  agree: number;
  disagree: number;
};

export async function getVoteStats(reportId: string): Promise<VoteStats> {
  const report = await prisma.bribeReport.findUnique({
    where: { id: reportId },
    select: { agreeVotes: true, disagreeVotes: true },
  });

  return report
    ? { agree: report.agreeVotes, disagree: report.disagreeVotes }
    : { agree: 0, disagree: 0 };
}

export async function applyVote(reportId: string, choice: VoteChoice, previousChoice?: VoteChoice | null): Promise<VoteStats> {
  const report = await prisma.$transaction(async (tx: PrismaClient) => {
    const current = await tx.bribeReport.findUnique({
      where: { id: reportId },
      select: { agreeVotes: true, disagreeVotes: true },
    });

    if (!current) {
      throw new Error("Report not found");
    }

    const next = {
      agreeVotes: Math.max(0, current.agreeVotes - (previousChoice === "agree" ? 1 : 0) + (choice === "agree" && previousChoice !== choice ? 1 : 0)),
      disagreeVotes: Math.max(0, current.disagreeVotes - (previousChoice === "disagree" ? 1 : 0) + (choice === "disagree" && previousChoice !== choice ? 1 : 0)),
    };

    return tx.bribeReport.update({ where: { id: reportId }, data: next });
  });

  return { agree: report.agreeVotes, disagree: report.disagreeVotes };
}
