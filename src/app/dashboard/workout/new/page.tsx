import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { NewWorkoutForm } from './new-workout-form';

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">New workout</h1>
      <NewWorkoutForm />
    </div>
  );
}
