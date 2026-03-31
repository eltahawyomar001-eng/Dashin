import { redirect } from 'next/navigation';

/**
 * Auth is mocked – auto-redirect to dashboard.
 * Replace with Clerk SignIn when keys are configured.
 */
export default function LoginPage() {
  redirect('/dashboard');
}
