import { AppState, HealthEntry, Meal, Task } from "../types";
import { todayIso, weekDates } from "./date";

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const tasksForDate = (tasks: Task[], date = todayIso()) =>
  tasks.filter((task) => task.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));

export const mealsForDate = (meals: Meal[], date = todayIso()) => meals.filter((meal) => meal.date === date);

export const healthForDate = (health: HealthEntry[], date = todayIso()) =>
  health.find((entry) => entry.date === date) ?? health[health.length - 1];

export const dailyCalories = (meals: Meal[]) => sum(meals.map((meal) => meal.calories));

export const taskCompletionRate = (tasks: Task[]) => {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100);
};

export const weeklyTaskChart = (state: AppState) =>
  weekDates().map((date) => {
    const dayTasks = tasksForDate(state.tasks, date);
    return {
      label: new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(new Date(date)),
      value: dayTasks.filter((task) => task.status === "done").length,
      total: dayTasks.length,
    };
  });

export const goalProgressAverage = (state: AppState) => {
  const activeGoals = state.goals.filter((goal) => goal.status !== "completed");
  if (!activeGoals.length) return 100;
  return Math.round(sum(activeGoals.map((goal) => goal.progress)) / activeGoals.length);
};

export const badgeCount = (state: AppState) => {
  const completedTasks = state.tasks.filter((task) => task.status === "done").length;
  const completedGoals = state.goals.filter((goal) => goal.status === "completed").length;
  const habitStreaks = state.habits.filter((habit) => habit.streak >= 7).length;
  return completedTasks >= 20 ? 2 + completedGoals + habitStreaks : 1 + completedGoals + habitStreaks;
};
