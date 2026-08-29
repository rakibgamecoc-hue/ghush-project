import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeSubmission } from "@/lib/moderation";
import validateEnv from "@/lib/env";
import { getVoteStats } from "@/lib/vote-store";
import type { BribeReport } from "@prisma/client";

// Validate environment on module load
validateEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { departmentCategory, serviceType, stateRegion, districtLocation, amountDemanded, outcome, narrativeText } = body;

    if (!departmentCategory || !serviceType || !stateRegion || !districtLocation || amountDemanded === undefined || !outcome || !narrativeText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    // Server-side validation: amount must be a finite number within reasonable bounds
    const parsedAmount = typeof amountDemanded === "number" ? amountDemanded : parseFloat(amountDemanded);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0 || parsedAmount > 10000000) {
      return NextResponse.json({ error: "Invalid amountDemanded" }, { status: 400 });
    }

    // Enforce max narrative length to avoid huge payloads
    if (typeof narrativeText !== "string" || narrativeText.length === 0 || narrativeText.length > 10000) {
      return NextResponse.json({ error: "Invalid narrativeText length" }, { status: 400 });
    }

    // Moderation Pipeline
    const sanitizedNarrative = await sanitizeSubmission(narrativeText);
    if (!sanitizedNarrative) {
      // Content violates policy — return explicit status so users know submission was blocked.
      return NextResponse.json({ error: "Submission blocked by moderation" }, { status: 400 });
    }

    const report = await prisma.bribeReport.create({
      data: {
        departmentCategory,
        serviceType,
        stateRegion,
        districtLocation,
        amountDemanded: parsedAmount,
        outcome,
        narrativeText: sanitizedNarrative,
      },
    });

    return NextResponse.json({ success: true, reportId: report.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create report:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const outcomeFilter = searchParams.get("outcome");
    const sort = searchParams.get("sort") || "latest";

    const whereClause: Record<string, unknown> = {};
    if (outcomeFilter && outcomeFilter !== "ALL") {
      whereClause.outcome = outcomeFilter;
    }

    let orderByClause: Record<string, 'asc' | 'desc'> = { createdAt: "desc" };
    if (sort === "highest") {
      orderByClause = { amountDemanded: "desc" };
    }

    const reports: BribeReport[] = await prisma.bribeReport.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: 50, 
    });
    const stats = await prisma.bribeReport.aggregate({
      _sum: { amountDemanded: true },
      _count: { id: true },
    });

    const rejectedCount = await prisma.bribeReport.count({
      where: { outcome: "REJECTED" },
    });

    // Serialize Decimal fields to numbers (safe for 2-decimal currency)
    const serializedReports = reports.map((r) => {
      const maybeAmt = (r as unknown as { amountDemanded?: { toString: () => string } }).amountDemanded;
      return {
        ...r,
        amountDemanded: maybeAmt ? parseFloat(maybeAmt.toString()) : maybeAmt,
        voteStats: getVoteStats(r.id),
      };
    });

    return NextResponse.json({
      reports: serializedReports,
      stats: {
        totalAmount: stats._sum.amountDemanded ? parseFloat(stats._sum.amountDemanded.toString()) : 0,
        totalReports: stats._count.id,
        rejectedCount,
      }
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
