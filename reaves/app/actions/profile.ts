'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function fetchUserProfile() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { full_name: true, university: true, avatar_url: true }
    });

    if (profile) return profile;
    
    // Fallback if profile didn't sync yet
    return {
      full_name: user.user_metadata?.full_name || 'Researcher',
      university: user.user_metadata?.university || '',
      avatar_url: null
    };
  } catch (e) {
    console.error('Error fetching profile:', e);
    return null;
  }
}
