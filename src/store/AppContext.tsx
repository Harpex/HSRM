import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";
import { seedState } from "../data/seed";
import { AppAction, AppState, Habit } from "../types";

const STORAGE_KEY = "life-track-pro-state";

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const recalculateStreak = (habit: Habit) => {
  const dates = [...habit.completedDates].sort().reverse();
  let streak = 0;
  const cursor = new Date();
  for (const completedDate of dates) {
    const iso = cursor.toISOString().slice(0, 10);
    if (completedDate === iso) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  return { ...habit, streak };
};

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "REGISTER_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
        isAuthenticated: true,
        currentUserId: action.payload.id,
        profile: {
          ...state.profile,
          name: action.payload.username,
          username: action.payload.username,
          email: action.payload.email,
        },
      };
    case "LOGIN_USER":
      return {
        ...state,
        isAuthenticated: true,
        currentUserId: action.payload.id,
        profile: {
          ...state.profile,
          name: action.payload.username,
          username: action.payload.username,
          email: action.payload.email,
        },
      };
    case "LOGOUT":
      return { ...state, isAuthenticated: false, currentUserId: null };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "UPDATE_USER_ROLE":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.userId ? { ...user, role: action.payload.role } : user)),
        healthProfiles: state.healthProfiles.map((profile) =>
          profile.userId === action.payload.userId ? { ...profile, role: action.payload.role, updatedAt: new Date().toISOString() } : profile,
        ),
      };
    case "UPSERT_HEALTH_PROFILE": {
      const exists = state.healthProfiles.some((profile) => profile.userId === action.payload.userId);
      return {
        ...state,
        healthProfiles: exists
          ? state.healthProfiles.map((profile) => (profile.userId === action.payload.userId ? action.payload : profile))
          : [...state.healthProfiles, action.payload],
        profile: {
          ...state.profile,
          username: action.payload.username,
          name: action.payload.username,
          email: action.payload.email,
          calorieTarget: action.payload.dailyCalorieGoal || state.profile.calorieTarget,
          waterTarget: action.payload.dailyWaterGoalMl / 1000,
          stepTarget: action.payload.dailyStepGoal,
          sleepTarget: action.payload.sleepGoalHours,
        },
      };
    }
    case "UPSERT_DAILY_LOG": {
      const exists = state.dailyLogs.some((log) => log.userId === action.payload.userId && log.date === action.payload.date);
      return {
        ...state,
        dailyLogs: exists
          ? state.dailyLogs.map((log) => (log.userId === action.payload.userId && log.date === action.payload.date ? action.payload : log))
          : [...state.dailyLogs, action.payload],
      };
    }
    case "ADD_WATER": {
      const now = new Date().toISOString();
      const current = state.dailyLogs.find((log) => log.userId === action.payload.userId && log.date === action.payload.date);
      const nextLog = current
        ? { ...current, waterIntakeMl: Math.max(0, current.waterIntakeMl + action.payload.amountMl), updatedAt: now }
        : {
            id: createId("daily-log"),
            userId: action.payload.userId,
            date: action.payload.date,
            waterIntakeMl: Math.max(0, action.payload.amountMl),
            stepsCount: 0,
            sleepHours: 0,
            createdAt: now,
            updatedAt: now,
          };
      return reducer(state, { type: "UPSERT_DAILY_LOG", payload: nextLog });
    }
    case "UPDATE_WEIGHT": {
      const profile = state.healthProfiles.find((item) => item.userId === action.payload.userId);
      const nextState = profile
        ? reducer(state, {
            type: "UPSERT_HEALTH_PROFILE",
            payload: { ...profile, weightKg: action.payload.weightKg, updatedAt: new Date().toISOString() },
          })
        : state;
      const current = nextState.dailyLogs.find((log) => log.userId === action.payload.userId && log.date === action.payload.date);
      if (!current) return nextState;
      return reducer(nextState, {
        type: "UPSERT_DAILY_LOG",
        payload: { ...current, weightKgSnapshot: action.payload.weightKg, updatedAt: new Date().toISOString() },
      });
    }
    case "ASSIGN_PATIENT": {
      const exists = state.dietitianPatients.some(
        (item) => item.dietitianUserId === action.payload.dietitianUserId && item.patientUserId === action.payload.patientUserId,
      );
      return {
        ...state,
        dietitianPatients: exists
          ? state.dietitianPatients.map((item) =>
              item.dietitianUserId === action.payload.dietitianUserId && item.patientUserId === action.payload.patientUserId ? action.payload : item,
            )
          : [...state.dietitianPatients, action.payload],
      };
    }
    case "UPSERT_DIETITIAN_NOTE": {
      const exists = state.dietitianNotes.some((note) => note.id === action.payload.id);
      return {
        ...state,
        dietitianNotes: exists ? state.dietitianNotes.map((note) => (note.id === action.payload.id ? action.payload : note)) : [action.payload, ...state.dietitianNotes],
      };
    }
    case "DELETE_DIETITIAN_NOTE":
      return { ...state, dietitianNotes: state.dietitianNotes.filter((note) => note.id !== action.payload) };
    case "UPSERT_MEAL_PLAN": {
      const exists = state.mealPlans.some((plan) => plan.id === action.payload.plan.id);
      const otherItems = state.mealPlanItems.filter((item) => item.mealPlanId !== action.payload.plan.id);
      return {
        ...state,
        mealPlans: exists ? state.mealPlans.map((plan) => (plan.id === action.payload.plan.id ? action.payload.plan : plan)) : [action.payload.plan, ...state.mealPlans],
        mealPlanItems: [...otherItems, ...action.payload.items],
      };
    }
    case "UPSERT_WEEKLY_CHECKIN": {
      const exists = state.weeklyCheckins.some((checkin) => checkin.id === action.payload.id);
      return {
        ...state,
        weeklyCheckins: exists
          ? state.weeklyCheckins.map((checkin) => (checkin.id === action.payload.id ? action.payload : checkin))
          : [action.payload, ...state.weeklyCheckins],
      };
    }
    case "ADD_TASK":
      return { ...state, tasks: [{ ...action.payload, id: action.payload.id || createId("task") }, ...state.tasks] };
    case "UPDATE_TASK":
      return { ...state, tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)) };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) };
    case "ADD_GOAL":
      return { ...state, goals: [{ ...action.payload, id: action.payload.id || createId("goal") }, ...state.goals] };
    case "UPDATE_GOAL":
      return { ...state, goals: state.goals.map((goal) => (goal.id === action.payload.id ? action.payload : goal)) };
    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.payload) };
    case "ADD_MEAL":
      return { ...state, meals: [{ ...action.payload, id: action.payload.id || createId("meal") }, ...state.meals] };
    case "DELETE_MEAL":
      return { ...state, meals: state.meals.filter((meal) => meal.id !== action.payload) };
    case "UPSERT_HEALTH": {
      const exists = state.health.some((entry) => entry.date === action.payload.date);
      return {
        ...state,
        health: exists
          ? state.health.map((entry) => (entry.date === action.payload.date ? action.payload : entry))
          : [...state.health, action.payload],
      };
    }
    case "ADD_HABIT":
      return { ...state, habits: [{ ...action.payload, id: action.payload.id || createId("habit") }, ...state.habits] };
    case "TOGGLE_HABIT_DATE":
      return {
        ...state,
        habits: state.habits.map((habit) => {
          if (habit.id !== action.payload.habitId) return habit;
          const completedDates = habit.completedDates.includes(action.payload.date)
            ? habit.completedDates.filter((date) => date !== action.payload.date)
            : [...habit.completedDates, action.payload.date];
          return recalculateStreak({ ...habit, completedDates });
        }),
      };
    case "UPSERT_NOTE": {
      const exists = state.notes.some((note) => note.date === action.payload.date);
      return {
        ...state,
        notes: exists
          ? state.notes.map((note) => (note.date === action.payload.date ? action.payload : note))
          : [...state.notes, action.payload],
      };
    }
    default:
      return state;
  }
};

const loadInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return seedState;
  try {
    const parsed = JSON.parse(stored);
    const users = (parsed.users ?? []).map((user: any) => ({
      ...user,
      fullName: user.fullName ?? user.username,
      role: user.role ?? "user",
    }));
    const healthProfiles = (parsed.healthProfiles ?? []).map((profile: any) => ({
      ...profile,
      fullName: profile.fullName ?? profile.username,
      role: profile.role ?? "user",
    }));
    return {
      ...seedState,
      ...parsed,
      profile: { ...seedState.profile, ...parsed.profile },
      users,
      currentUserId: parsed.currentUserId ?? null,
      healthProfiles,
      dailyLogs: parsed.dailyLogs ?? [],
      dietitianPatients: parsed.dietitianPatients ?? [],
      dietitianNotes: parsed.dietitianNotes ?? [],
      mealPlans: parsed.mealPlans ?? [],
      mealPlanItems: parsed.mealPlanItems ?? [],
      weeklyCheckins: parsed.weeklyCheckins ?? [],
    };
  } catch {
    return seedState;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.dataset.theme = state.profile.darkMode ? "dark" : "light";
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
};
