import { redirect } from 'next/navigation';

/**
 * Auth is mocked – auto-redirect to dashboard.
 * Replace with Clerk SignUp when keys are configured.
 */
export default function SignUpPage() {
  redirect('/dashboard');
}
