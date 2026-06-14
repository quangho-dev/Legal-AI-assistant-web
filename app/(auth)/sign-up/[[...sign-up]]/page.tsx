import { SignUp } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/auth";

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}

export default SignUpPage;
