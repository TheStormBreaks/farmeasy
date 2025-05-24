// src/app/farmeasy/page.tsx
import { redirect } from 'next/navigation';

export default function FarmEasyRootPage() {
  // Redirect to the FarmEasy login page
  redirect('/farmeasy/login');
}
