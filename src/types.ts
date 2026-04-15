export type TaskStatus = "pending" | "active" | "done";
export type Priority = "low" | "medium" | "high";
export type GoalStatus = "active" | "completed" | "paused";
export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";
export type Mood = "dusuk" | "dengeli" | "iyi" | "harika";
export type ActivityLevel = "cok_dusuk" | "dusuk" | "orta" | "yuksek" | "cok_yuksek";
export type Gender = "kadin" | "erkek" | "belirtmek_istemiyorum" | "";
export type UserRole = "user" | "dietitian" | "admin";
export type RelationStatus = "active" | "paused";
export type MealPlanStatus = "active" | "inactive" | "draft";

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
  fullName: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export interface UserHealthProfile {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  dailyWaterGoalMl: number;
  dailyStepGoal: number;
  dailyCalorieGoal?: number;
  sleepGoalHours: number;
  notes: string;
  goalDescription: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  waterIntakeMl: number;
  stepsCount: number;
  sleepHours: number;
  calorieIntake?: number;
  weightKgSnapshot?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DietitianPatient {
  id: string;
  dietitianUserId: string;
  patientUserId: string;
  assignedAt: string;
  status: RelationStatus;
  internalNote: string;
}

export interface DietitianNote {
  id: string;
  dietitianUserId: string;
  patientUserId: string;
  title: string;
  noteContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  id: string;
  dietitianUserId: string;
  patientUserId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: MealPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanItem {
  id: string;
  mealPlanId: string;
  mealType: string;
  itemText: string;
  sortOrder: number;
}

export interface WeeklyCheckin {
  id: string;
  dietitianUserId: string;
  patientUserId: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: string;
  weightComment: string;
  waterComment: string;
  stepsComment: string;
  adherenceScore: number;
  nextGoal: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  isAuthenticated: boolean;
  currentUserId: string | null;
  profile: UserProfile;
  users: AuthUser[];
  healthProfiles: UserHealthProfile[];
  dailyLogs: DailyLog[];
  dietitianPatients: DietitianPatient[];
  dietitianNotes: DietitianNote[];
  mealPlans: MealPlan[];
  mealPlanItems: MealPlanItem[];
  weeklyCheckins: WeeklyCheckin[];
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
  | { type: "UPDATE_USER_ROLE"; payload: { userId: string; role: UserRole } }
  | { type: "UPSERT_HEALTH_PROFILE"; payload: UserHealthProfile }
  | { type: "UPSERT_DAILY_LOG"; payload: DailyLog }
  | { type: "ADD_WATER"; payload: { userId: string; date: string; amountMl: number } }
  | { type: "UPDATE_WEIGHT"; payload: { userId: string; weightKg: number; date: string } }
  | { type: "ASSIGN_PATIENT"; payload: DietitianPatient }
  | { type: "UPSERT_DIETITIAN_NOTE"; payload: DietitianNote }
  | { type: "DELETE_DIETITIAN_NOTE"; payload: string }
  | { type: "UPSERT_MEAL_PLAN"; payload: { plan: MealPlan; items: MealPlanItem[] } }
  | { type: "UPSERT_WEEKLY_CHECKIN"; payload: WeeklyCheckin }
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
