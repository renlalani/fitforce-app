const PICS = "https://placehold.co/400x300/1a1a2e/e0e0e0?text=";

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
  const name = encodeURIComponent(exercise.name || "");
  if (name) return `${PICS}${name}`;
  const muscle = exercise.muscle || "Core";
  return MUSCLE_FALLBACKS[muscle] || MUSCLE_FALLBACKS.Core;
}
