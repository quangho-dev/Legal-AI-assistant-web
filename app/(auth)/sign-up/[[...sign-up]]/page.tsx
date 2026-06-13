import { SignUp } from "@clerk/nextjs";

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp />
    </div>
  );
}

export default SignUpPage;
