import { NextResponse } from "next/server";
import { applyVote, getVoteStats, type VoteChoice } from "@/lib/vote-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("/api/reports/vote POST body:", body);
    const { reportId, choice, previousChoice } = body as {
      reportId?: string;
      choice?: VoteChoice;
      previousChoice?: VoteChoice | null;
    };

    if (!reportId || !choice || (choice !== "agree" && choice !== "disagree")) {
      return NextResponse.json({ error: "Invalid vote payload" }, { status: 400 });
    }

    const voteStats = applyVote(reportId, choice, previousChoice ?? null);
    console.log("/api/reports/vote updated stats:", voteStats);

    return NextResponse.json({
      success: true,
      reportId,
      voteStats,
    });
  } catch (error) {
    console.error("Failed to process vote:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    return NextResponse.json({ voteStats: getVoteStats(reportId) });
  } catch (error) {
    console.error("Failed to fetch vote stats:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
