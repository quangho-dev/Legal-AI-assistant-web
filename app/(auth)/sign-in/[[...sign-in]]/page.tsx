import { SignIn } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/auth";

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}

export default SignInPage;
