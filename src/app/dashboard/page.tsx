import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getWorkoutsForDate, type WorkoutWithDetails } from '@/data/workouts';
import { DatePicker } from './date-picker';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{workout.name}</CardTitle>
          <Badge variant={workout.completedAt ? 'default' : 'secondary'}>
            {workout.completedAt ? 'Completed' : 'In progress'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {workout.exercises.map((exercise, i) => (
          <div key={exercise.id}>
            {i > 0 && <Separator className="mb-4" />}
            <p className="text-sm font-medium mb-2">{exercise.name}</p>
            <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1 px-1">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
            </div>
            {exercise.sets.map((s) => (
              <div
                key={s.setNumber}
                className="grid grid-cols-3 text-sm px-1 py-1 rounded-md odd:bg-muted/40"
              >
                <span>{s.setNumber}</span>
                <span>{s.reps ?? '—'}</span>
                <span>{s.weightKg ?? '—'}</span>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();

  const userWorkouts = await getWorkoutsForDate(userId, date);

  return (
    <main className="max-w-5xl mx-auto w-full px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <Suspense>
        <DatePicker date={date} />
      </Suspense>

      <div className="mt-6">
        {userWorkouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No workouts logged for this day.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
