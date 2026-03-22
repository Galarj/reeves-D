'use client';

import { useState, useEffect } from 'react';
import { fetchUserProfile } from '@/app/actions/profile';

export interface UserProfile {
  full_name: string | null;
  university: string | null;
  avatar_url: string | null;
}

export function useUser() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const data = await fetchUserProfile();
      setProfile(data);
      setLoading(false);
    }
    loadUser();
  }, []);

  return { profile, loading };
}
