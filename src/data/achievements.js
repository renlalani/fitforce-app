export const ALL_ACHIEVEMENTS = [
  {
    id: "first-workout",
    icon: "💪",
    label: "First Workout",
    desc: "Complete your first workout",
    color: "#3b82f6",
    check: ({ workoutSessions }) => workoutSessions.length >= 1,
  },
  {
    id: "streak-7",
    icon: "🔥",
    label: "7-Day Streak",
    desc: "7 consecutive days of workouts",
    color: "#ff3b3b",
    check: ({ streak }) => streak >= 7,
  },
  {
    id: "streak-30",
    icon: "⭐",
    label: "30-Day Streak",
    desc: "30 consecutive days of workouts",
    color: "#f59e0b",
    check: ({ streak }) => streak >= 30,
  },
  {
    id: "volume-10k",
    icon: "🏋️",
    label: "Volume 10k",
    desc: "10,000 kg total workout volume",
    color: "#22c55e",
    check: ({ totalVolume }) => totalVolume >= 10000,
  },
  {
    id: "pr-setter",
    icon: "⚡",
    label: "PR Setter",
    desc: "Set a personal record",
    color: "#f59e0b",
    check: ({ bestPRs }) => bestPRs.length > 0,
  },
  {
    id: "nutrition-pro",
    icon: "🥗",
    label: "Nutrition Pro",
    desc: "Hit your protein goal 7 days",
    color: "#22c55e",
    check: ({ nutritionStreak }) => nutritionStreak >= 7,
  },
  {
    id: "hydration-hero",
    icon: "💧",
    label: "Hydration Hero",
    desc: "Drink 8 glasses of water daily for a week",
    color: "#14b8a6",
    check: ({ waterAvg }) => waterAvg >= 7,
  },
  {
    id: "level-5",
    icon: "🎯",
    label: "Level 5",
    desc: "Reach experience level 5",
    color: "#a855f7",
    check: ({ level }) => level >= 5,
  },
  {
    id: "level-10",
    icon: "👑",
    label: "Level 10",
    desc: "Reach experience level 10",
    color: "#f59e0b",
    check: ({ level }) => level >= 10,
  },
  {
    id: "level-20",
    icon: "🌟",
    label: "Level 20",
    desc: "Reach experience level 20",
    color: "#ff3b3b",
    check: ({ level }) => level >= 20,
  },
  {
    id: "workout-10",
    icon: "📋",
    label: "Dedicated",
    desc: "Complete 10 workouts",
    color: "#3b82f6",
    check: ({ workoutSessions }) => workoutSessions.length >= 10,
  },
  {
    id: "workout-50",
    icon: "🏆",
    label: "Veteran",
    desc: "Complete 50 workouts",
    color: "#a855f7",
    check: ({ workoutSessions }) => workoutSessions.length >= 50,
  },
  {
    id: "workout-100",
    icon: "💎",
    label: "Legend",
    desc: "Complete 100 workouts",
    color: "#f59e0b",
    check: ({ workoutSessions }) => workoutSessions.length >= 100,
  },
  {
    id: "cardio-king",
    icon: "🏃",
    label: "Cardio King",
    desc: "Burn 5,000 calories from cardio",
    color: "#14b8a6",
    check: ({ totalCalories }) => totalCalories >= 5000,
  },
  {
    id: "xp-1000",
    icon: "⭐",
    label: "XP Hunter",
    desc: "Earn 1,000 XP",
    color: "#f97316",
    check: ({ xp }) => xp >= 1000,
  },
  {
    id: "xp-5000",
    icon: "🌟",
    label: "XP Master",
    desc: "Earn 5,000 XP",
    color: "#a855f7",
    check: ({ xp }) => xp >= 5000,
  },
  {
    id: "xp-10000",
    icon: "💫",
    label: "XP Legend",
    desc: "Earn 10,000 XP",
    color: "#ff3b3b",
    check: ({ xp }) => xp >= 10000,
  },
  {
    id: "strength",
    icon: "💪",
    label: "Strength Level",
    desc: "Reach 100kg on any lift",
    color: "#ff3b3b",
    check: ({ prs }) => prs.some(p => p.weight >= 100),
  },
];

export function computeAchievements(userData) {
  const results = {};
  ALL_ACHIEVEMENTS.forEach(a => {
    results[a.id] = a.check(userData);
  });
  return results;
}

export function getNewlyUnlocked(previousUnlocks, currentUnlocks) {
  const unlocked = [];
  Object.entries(currentUnlocks).forEach(([id, val]) => {
    if (val && !previousUnlocks[id]) unlocked.push(id);
  });
  return unlocked;
}
