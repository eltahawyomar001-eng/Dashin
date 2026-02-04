import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-gradient mb-2 text-4xl font-bold">Dashin Research</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "glass-strong rounded-2xl shadow-glass-xl border-white/10",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-slate-400 text-sm",
              socialButtonsBlockButton: "glass border-white/10 text-white hover:glass-strong transition-all duration-200",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-slate-400",
              formButtonPrimary: "bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/25 transition-all duration-200 text-white font-semibold",
              formFieldLabel: "text-slate-300 font-medium",
              formFieldInput: "glass border-white/10 text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200",
              formFieldInputShowPasswordButton: "text-slate-400 hover:text-slate-300",
              footerAction: "glass-subtle rounded-lg p-4 border-white/5",
              footerActionText: "text-slate-400",
              footerActionLink: "text-primary-400 hover:text-primary-300 font-semibold transition-colors",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-primary-400 hover:text-primary-300",
              formResendCodeLink: "text-primary-400 hover:text-primary-300",
              otpCodeFieldInput: "glass border-white/10 text-white focus:border-primary-500/50",
              formFieldSuccessText: "text-green-400",
              formFieldErrorText: "text-red-400",
              formFieldHintText: "text-slate-400 text-xs",
              alertText: "text-slate-300",
              formFieldAction: "text-primary-400 hover:text-primary-300",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            }
          }}
        />
      </div>
    </div>
  );
}
