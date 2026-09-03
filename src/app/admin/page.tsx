import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/admin-auth";
import { AdminDashboard, type AdminReport } from "./AdminDashboard";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

function serializeAmount(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof (value as { toString: () => string }).toString === "function") {
    return parseFloat((value as { toString: () => string }).toString());
  }
  return 0;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!isAdminAuthed(cookieStore)) {
    redirect("/admin/login");
  }

  const pending = await prisma.bribeReport.findMany({
    where: { reviewStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const recent = await prisma.bribeReport.findMany({
    where: { reviewStatus: { in: ["APPROVED", "REJECTED"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const toAdminReport = (r: (typeof pending)[number]): AdminReport => ({
    id: r.id,
    departmentCategory: r.departmentCategory,
    serviceType: r.serviceType,
    stateRegion: r.stateRegion,
    districtLocation: r.districtLocation,
    amountDemanded: serializeAmount(r.amountDemanded),
    outcome: r.outcome,
    narrativeText: r.narrativeText,
    reviewStatus: r.reviewStatus as "PENDING" | "APPROVED" | "REJECTED",
    createdAt: dateFormatter.format(new Date(r.createdAt)),
  });

  return (
    <AdminDashboard
      pending={pending.map(toAdminReport)}
      recent={recent.map(toAdminReport)}
    />
  );
}
