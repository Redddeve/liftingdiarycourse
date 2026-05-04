'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateWorkoutAction } from './actions';
import type { WorkoutWithDetails } from '@/data/workouts';

interface EditWorkoutFormProps {
  workout: WorkoutWithDetails;
}

export function EditWorkoutForm({ workout }: EditWorkoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const name = (
      form.elements.namedItem('name') as HTMLInputElement
    ).value.trim();
    const loggedAt = (form.elements.namedItem('loggedAt') as HTMLInputElement)
      .value;

    if (!name) {
      setError('Workout name is required.');
      return;
    }
    if (!loggedAt) {
      setError('Date is required.');
      return;
    }

    startTransition(async () => {
      try {
        await updateWorkoutAction(workout.id, { name, loggedAt });
        router.push('/dashboard');
      } catch {
        setError('Something went wrong. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={workout.name}
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loggedAt">Date</Label>
        <Input
          id="loggedAt"
          name="loggedAt"
          type="date"
          defaultValue={format(workout.loggedAt, 'yyyy-MM-dd')}
          required
          disabled={isPending}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
