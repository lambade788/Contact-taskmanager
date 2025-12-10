// components/ProtectedLayout.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, scheduleAutoLogout } from '@/lib/auth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // check auth on mount
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    // schedule logout based on expires_at
    scheduleAutoLogout();
    setChecked(true);
  }, [router]);

  if (!checked) return <div>Checking authentication...</div>;
  return <>{children}</>;
}
