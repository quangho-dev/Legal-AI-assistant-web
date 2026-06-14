import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AdminRetrievalSettingsPageClient } from "@/components/admin/admin-retrieval-settings-page";
import { ADMIN_ROLE } from "@/lib/auth";

export default async function AdminRetrievalSettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.publicMetadata?.role !== ADMIN_ROLE) {
    redirect("/chat");
  }

  return <AdminRetrievalSettingsPageClient />;
}
