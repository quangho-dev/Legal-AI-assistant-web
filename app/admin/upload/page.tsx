import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AdminUploadPageClient } from "@/components/admin/admin-upload-page";
import { ADMIN_ROLE } from "@/lib/auth";

export default async function AdminUploadPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.publicMetadata?.role !== ADMIN_ROLE) {
    redirect("/chat");
  }

  return <AdminUploadPageClient />;
}
