'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createWorkout } from '@/data/workouts';

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(200),
  loggedAt: z.string().date(),
});

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(data: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const parsed = CreateWorkoutSchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid input');

  await createWorkout(userId, {
    name: parsed.data.name,
    loggedAt: new Date(parsed.data.loggedAt),
  });

  redirect('/dashboard');
}
