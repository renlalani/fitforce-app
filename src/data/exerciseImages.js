const PICS = "https://picsum.photos/seed/";
const SIZE = "/400/300";

const KNOWN = {
  1: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format",
  2: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop&auto=format",
  3: "https://images.unsplash.com/photo-1603287681836-b174ce5074b2?w=400&h=300&fit=crop&auto=format",
  4: "https://images.unsplash.com/photo-1598971639058-999901d212d5?w=400&h=300&fit=crop&auto=format",
  6: "https://images.unsplash.com/photo-1534367606726-01950b5a0aa1?w=400&h=300&fit=crop&auto=format",
  7: "https://images.unsplash.com/photo-1603287681836-b174ce5074b2?w=400&h=300&fit=crop&auto=format",
  8: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop&auto=format",
  11: "https://images.unsplash.com/photo-1574680178050-55c6a6a960e0?w=400&h=300&fit=crop&auto=format",
  12: "https://images.unsplash.com/photo-1517838837275-b1c7a5f0c5b5?w=400&h=300&fit=crop&auto=format",
  13: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop&auto=format",
  18: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop&auto=format",
  22: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop&auto=format",
  27: "https://images.unsplash.com/photo-1566241142559-40e1dab0b6c6?w=400&h=300&fit=crop&auto=format",
  32: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop&auto=format",
};

const MUSCLE_FALLBACKS = {
  Chest: `${PICS}chest${SIZE}`,
  Back: `${PICS}back${SIZE}`,
  Legs: `${PICS}legs${SIZE}`,
  Glutes: `${PICS}glutes${SIZE}`,
  Shoulders: `${PICS}shoulders${SIZE}`,
  Arms: `${PICS}arms${SIZE}`,
  Core: `${PICS}core${SIZE}`,
  Cardio: `${PICS}cardio${SIZE}`,
};

export function getExerciseImage(exercise) {
  if (!exercise) return MUSCLE_FALLBACKS.Core;
  const id = exercise.id || exercise.exerciseId;
  if (id) {
    if (KNOWN[id]) return KNOWN[id];
    return `${PICS}exercise${id}${SIZE}`;
  }
  const muscle = exercise.muscle || "Core";
  return MUSCLE_FALLBACKS[muscle] || MUSCLE_FALLBACKS.Core;
}
