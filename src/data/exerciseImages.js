const IMG = "/images/exercises";

const MAP = {
  "Bench Press": "chest/BenchPress.png",
  "Incline DB Press": "chest/Incline Dumbbell Press.png",
  "Cable Fly": "chest/cable fly.png",
  "Push-Ups": "chest/push up.png",
  "Dumbbell Pullover": "chest/Dumbbell Pullover.png",
  "Pull-Ups": "back/pull-up.png",
  "Deadlift": "back/Deadlift.png",
  "Barbell Row": "back/Barbell Row.png",
  "Lat Pulldown": "back/Lat Pulldown.png",
  "Seated Cable Row": "back/Seated Cable Row.png",
  "Squat": "legs/Barbell Squat.png",
  "Leg Press": "legs/Leg Press.png",
  "Romanian DL": "legs/Romanian Deadlift.png",
  "Leg Curl": "legs/Leg Curl.png",
  "Bulgarian Split Squat": "legs/Bulgarian Split Squat.png",
  "Hip Thrust": "legs/Hip Thrust.png",
  "Glute Kickback": "legs/Glute Kickback.png",
  "Overhead Press": "shoulders/Overhead Press.png",
  "Lateral Raises": "shoulders/Lateral Raise.png",
  "Face Pulls": "shoulders/Face Pull.png",
  "Arnold Press": "shoulders/Arnold Press.png",
  "Bicep Curls": "arms/Bicep Curl.png",
  "Tricep Dips": "arms/Dips.png",
  "Hammer Curls": "arms/Hammer Curl.png",
  "Skull Crushers": "arms/Skull Crusher.png",
  "Cable Pushdown": "arms/Tricep Pushdown.png",
  "Plank": "core/Plank.png",
  "Cable Crunch": "core/Cable Crunch.png",
  "Dragon Flag": "core/Dragon Flag.png",
  "Hanging Leg Raise": "core/Hanging Leg Raise.png",
  "Ab Wheel Rollout": "core/Ab Wheel Rollout.png",
  "Treadmill Run": "cardio/Treadmill Running.png",
  "HIIT Intervals": "cardio/HIIT Sprint.png",
  "Jump Rope": "cardio/Jump Rope.png",
  "Rowing Machine": "cardio/rowing machine.png",
};

const PICS = import.meta.env.VITE_PLACEHOLDER_IMAGE_URL || "https://placehold.co/400x300/1a1a2e/e0e0e0?text=";

const MUSCLE_FALLBACKS = {
  Chest: `${PICS}Chest`,
  Back: `${PICS}Back`,
  Legs: `${PICS}Legs`,
  Glutes: `${PICS}Glutes`,
  Shoulders: `${PICS}Shoulders`,
  Arms: `${PICS}Arms`,
  Core: `${PICS}Core`,
  Cardio: `${PICS}Cardio`,
};

export function getExerciseImage(exercise) {
  if (!exercise) return MUSCLE_FALLBACKS.Core;
  const mapped = MAP[exercise.name];
  if (mapped) return `${IMG}/${mapped}`;

  const name = encodeURIComponent(exercise.name || "");
  if (name) return `${PICS}${name}`;

  const muscle = exercise.muscle || "Core";
  return MUSCLE_FALLBACKS[muscle] || MUSCLE_FALLBACKS.Core;
}