import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-auth";
import type { BribeReport } from "@prisma/client";

const VALID_REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

type ReviewStatus = (typeof VALID_REVIEW_STATUSES)[number];

function serializeReport(r: BribeReport) {
  const maybeAmt = (r as unknown as { amountDemanded?: { toString: () => string } }).amountDemanded;
  return {
    ...r,
    amountDemanded: maybeAmt ? parseFloat(maybeAmt.toString()) : maybeAmt,
  };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (!verifyAdminToken(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const report = await prisma.bribeReport.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ report: serializeReport(report) });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (!verifyAdminToken(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  let body: { reviewStatus?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.reviewStatus as ReviewStatus | undefined;
  if (!status || !VALID_REVIEW_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid reviewStatus" }, { status: 400 });
  }

  const existing = await prisma.bribeReport.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.bribeReport.update({
    where: { id },
    data: { reviewStatus: status },
  });

  return NextResponse.json({ report: serializeReport(updated) });
}
