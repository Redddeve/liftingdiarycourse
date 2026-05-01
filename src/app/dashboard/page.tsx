import { DatePicker } from './date-picker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const mockWorkouts = [
  {
    id: '1',
    name: 'Push Day',
    completedAt: new Date(),
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: [
          { setNumber: 1, reps: 10, weightKg: '80' },
          { setNumber: 2, reps: 8, weightKg: '82.5' },
          { setNumber: 3, reps: 6, weightKg: '85' },
        ],
      },
      {
        id: '2',
        name: 'Overhead Press',
        sets: [
          { setNumber: 1, reps: 10, weightKg: '50' },
          { setNumber: 2, reps: 8, weightKg: '52.5' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Leg Day',
    completedAt: null,
    exercises: [
      {
        id: '3',
        name: 'Squat',
        sets: [
          { setNumber: 1, reps: 8, weightKg: '100' },
          { setNumber: 2, reps: 6, weightKg: '105' },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <DatePicker />

      <div className="mt-6 flex flex-col gap-4">
        {mockWorkouts.map((workout) => (
          <Card key={workout.id}>
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
                      <span>{s.reps}</span>
                      <span>{s.weightKg}</span>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
