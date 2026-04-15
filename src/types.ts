export type TaskStatus = "pending" | "active" | "done";
export type Priority = "low" | "medium" | "high";
export type GoalStatus = "active" | "completed" | "paused";
export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";
export type Mood = "dusuk" | "dengeli" | "iyi" | "harika";

export interface Task {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: TaskStatus;
  priority: Priority;
  reminder: string;
  date: string;
  notes?: string;
  goalId?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: GoalStatus;
  term: "short" | "long";
  subtasks: string[];
}

export interface Meal {
  id: string;
  date: string;
  category: MealCategory;
  food: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface HealthEntry {
  id: string;
  date: string;
  weight: number;
  height: number;
  water: number;
  sleep: number;
  steps: number;
  bloodPressure: string;
  pulse: number;
  mood: Mood;
  energy: number;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  targetPerWeek: number;
  completedDates: string[];
}

export interface DayNote {
  date: string;
  text: string;
  reflection: string;
}

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  calorieTarget: number;
  waterTarget: number;
  stepTarget: number;
  sleepTarget: number;
  darkMode: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export interface AppState {
  isAuthenticated: boolean;
  currentUserId: string | null;
  profile: UserProfile;
  users: AuthUser[];
  tasks: Task[];
  goals: Goal[];
  meals: Meal[];
  health: HealthEntry[];
  habits: Habit[];
  notes: DayNote[];
}

export type AppAction =
  | { type: "REGISTER_USER"; payload: AuthUser }
  | { type: "LOGIN_USER"; payload: AuthUser }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_MEAL"; payload: Meal }
  | { type: "DELETE_MEAL"; payload: string }
  | { type: "UPSERT_HEALTH"; payload: HealthEntry }
  | { type: "ADD_HABIT"; payload: Habit }
  | { type: "TOGGLE_HABIT_DATE"; payload: { habitId: string; date: string } }
  | { type: "UPSERT_NOTE"; payload: DayNote };
