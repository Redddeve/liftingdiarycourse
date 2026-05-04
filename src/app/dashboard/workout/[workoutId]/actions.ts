'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { updateWorkout } from '@/data/workouts';

const UpdateWorkoutSchema = z.object({
  name: z.string().min(1).max(200),
  loggedAt: z.iso.date(),
});

export type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(
  workoutId: string,
  data: UpdateWorkoutInput,
) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const parsed = UpdateWorkoutSchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid input');

  await updateWorkout(userId, workoutId, {
    name: parsed.data.name,
    loggedAt: new Date(parsed.data.loggedAt),
  });
}
