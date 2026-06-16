import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ComparePageClient } from "@/components/compare/compare-page";

export default async function ComparePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <ComparePageClient />;
}
