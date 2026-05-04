import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getWorkoutById } from '@/data/workouts';
import { EditWorkoutForm } from './edit-workout-form';

interface PageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, workoutId);

  if (!workout) notFound();

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">Edit workout</h1>
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
