'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const university = formData.get('university') as string;

  if (!email || !password || !fullName) {
    return { error: 'Email, password, and full name are required' };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // 1. Create the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        university: university,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 2. The crucial requested step: Use Prisma to explicitly sync the auth user to the profile table
  if (data.user) {
    try {
      await prisma.profile.create({
        data: {
          id: data.user.id,
          full_name: fullName,
          university: university || null,
        },
      });
    } catch (dbError: any) {
      console.error('[signUpAction] Prisma profile creation failed:', dbError);
      // Even if profile creation fails, the user is created in Supabase.
      // E.g., if there's a unique constraint issue, log it.
    }
  }

  redirect('/dashboard');
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/login');
}
