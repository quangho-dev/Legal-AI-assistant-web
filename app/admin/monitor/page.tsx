import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AdminMonitorPageClient } from "@/components/admin/admin-monitor-page";
import { ADMIN_ROLE } from "@/lib/auth";

export default async function AdminMonitorPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.publicMetadata?.role !== ADMIN_ROLE) {
    redirect("/chat");
  }

  return <AdminMonitorPageClient />;
}
