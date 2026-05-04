import { db } from '@/db';
import { workouts, workoutExercises, exercises, exerciseSets } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export type WorkoutWithDetails = {
  id: string;
  name: string;
  loggedAt: Date;
  completedAt: Date | null;
  exercises: {
    id: string;
    name: string;
    sets: { setNumber: number; reps: number | null; weightKg: string | null }[];
  }[];
};

export async function getWorkoutsForDate(
  userId: string,
  date: Date,
): Promise<WorkoutWithDetails[]> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workout: workouts,
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: exerciseSets,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(exerciseSets, eq(exerciseSets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.loggedAt, dayStart),
        lt(workouts.loggedAt, dayEnd),
      ),
    )
    .orderBy(workouts.loggedAt, workoutExercises.orderIndex, exerciseSets.setNumber);

  const workoutMap = new Map<string, WorkoutWithDetails>();

  for (const row of rows) {
    if (!workoutMap.has(row.workout.id)) {
      workoutMap.set(row.workout.id, {
        id: row.workout.id,
        name: row.workout.name,
        loggedAt: row.workout.loggedAt,
        completedAt: row.workout.completedAt,
        exercises: [],
      });
    }
    const w = workoutMap.get(row.workout.id)!;

    if (row.workoutExercise && row.exercise) {
      let ex = w.exercises.find((e) => e.id === row.workoutExercise!.id);
      if (!ex) {
        ex = { id: row.workoutExercise.id, name: row.exercise.name, sets: [] };
        w.exercises.push(ex);
      }
      if (row.set) {
        ex.sets.push({
          setNumber: row.set.setNumber,
          reps: row.set.reps,
          weightKg: row.set.weightKg,
        });
      }
    }
  }

  return Array.from(workoutMap.values());
}

export async function getWorkoutById(
  userId: string,
  workoutId: string,
): Promise<WorkoutWithDetails | null> {
  const rows = await db
    .select({
      workout: workouts,
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: exerciseSets,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(exerciseSets, eq(exerciseSets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.orderIndex, exerciseSets.setNumber);

  if (rows.length === 0) return null;

  const first = rows[0].workout;
  const result: WorkoutWithDetails = {
    id: first.id,
    name: first.name,
    loggedAt: first.loggedAt,
    completedAt: first.completedAt,
    exercises: [],
  };

  for (const row of rows) {
    if (row.workoutExercise && row.exercise) {
      let ex = result.exercises.find((e) => e.id === row.workoutExercise!.id);
      if (!ex) {
        ex = { id: row.workoutExercise.id, name: row.exercise.name, sets: [] };
        result.exercises.push(ex);
      }
      if (row.set) {
        ex.sets.push({
          setNumber: row.set.setNumber,
          reps: row.set.reps,
          weightKg: row.set.weightKg,
        });
      }
    }
  }

  return result;
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { name: string; loggedAt: Date },
) {
  return db
    .update(workouts)
    .set({ name: data.name, loggedAt: data.loggedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
}

export async function createWorkout(
  userId: string,
  data: { name: string; loggedAt: Date },
) {
  return db.insert(workouts).values({ ...data, userId }).returning();
}
