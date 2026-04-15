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
    return {
      ...seedState,
      ...parsed,
      profile: { ...seedState.profile, ...parsed.profile },
      users: parsed.users ?? [],
      currentUserId: parsed.currentUserId ?? null,
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
