import { ActivityLevel, DailyLog, UserHealthProfile } from "../types";
import { todayIso } from "./date";

export const activityLabels: Record<ActivityLevel, string> = {
  cok_dusuk: "Çok düşük",
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
  cok_yuksek: "Çok yüksek",
};

const activityMultipliers: Record<ActivityLevel, number> = {
  cok_dusuk: 1.2,
  dusuk: 1.375,
  orta: 1.55,
  yuksek: 1.725,
  cok_yuksek: 1.9,
};

export const emptyDailyLog = (userId: string, date = todayIso()): DailyLog => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    date,
    waterIntakeMl: 0,
    stepsCount: 0,
    sleepHours: 0,
    calorieIntake: 0,
    createdAt: now,
    updatedAt: now,
  };
};

export const createEmptyHealthProfile = (userId: string, username: string, email: string, fullName = username): UserHealthProfile => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    username,
    fullName,
    email,
    role: "user",
    age: 30,
    gender: "",
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 72,
    activityLevel: "orta",
    dailyWaterGoalMl: 2500,
    dailyStepGoal: 9000,
    dailyCalorieGoal: 2200,
    sleepGoalHours: 7.5,
    notes: "",
    goalDescription: "",
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const getUserHealthProfile = (profiles: UserHealthProfile[], userId: string | null) =>
  profiles.find((profile) => profile.userId === userId);

export const getDailyLog = (logs: DailyLog[], userId: string | null, date = todayIso()) =>
  logs.find((log) => log.userId === userId && log.date === date);

export const calculateBmi = (weightKg: number, heightCm: number) => {
  if (!weightKg || !heightCm) return 0;
  const heightMeters = heightCm / 100;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(1));
};

export const bmiCategory = (bmi: number) => {
  if (!bmi) return "Eksik veri";
  if (bmi < 18.5) return "Zayıf";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Fazla kilolu";
  return "Obez";
};

export const progressPercent = (value: number, target: number) => {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, value) / target) * 100));
};

export const weightDifferenceToTarget = (weightKg: number, targetWeightKg: number) =>
  Number((weightKg - targetWeightKg).toFixed(1));

export const idealWeightRangeText = (heightCm: number) => {
  if (!heightCm) return "Boy bilgisi bekleniyor";
  const heightMeters = heightCm / 100;
  const min = 18.5 * heightMeters * heightMeters;
  const max = 24.9 * heightMeters * heightMeters;
  return `Yaklaşık ${min.toFixed(1)} - ${max.toFixed(1)} kg`;
};

export const estimatedDailyCalorieNeed = (profile: UserHealthProfile) => {
  // Basit Mifflin-St Jeor yaklaşımı kullanılır. Bu değer tıbbi öneri değil,
  // aktivite seviyesine göre yaklaşık günlük enerji ihtiyacını göstermek içindir.
  const genderOffset = profile.gender === "kadin" ? -161 : 5;
  const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + genderOffset;
  return Math.round(bmr * activityMultipliers[profile.activityLevel]);
};

export const validateHealthProfile = (profile: UserHealthProfile) => {
  if (profile.age < 10 || profile.age > 120) return "Yaş 10-120 aralığında olmalı.";
  if (profile.heightCm < 50 || profile.heightCm > 300) return "Boy 50-300 cm aralığında olmalı.";
  if (profile.weightKg < 20 || profile.weightKg > 500) return "Kilo 20-500 kg aralığında olmalı.";
  if (profile.targetWeightKg < 20 || profile.targetWeightKg > 500) return "Hedef kilo 20-500 kg aralığında olmalı.";
  if (profile.dailyWaterGoalMl <= 0 || profile.dailyWaterGoalMl > 10000) return "Günlük su hedefi 1-10000 ml aralığında olmalı.";
  if (profile.dailyStepGoal < 0 || profile.dailyStepGoal > 100000) return "Adım hedefi 0-100000 aralığında olmalı.";
  if ((profile.dailyCalorieGoal ?? 0) < 0 || (profile.dailyCalorieGoal ?? 0) > 15000) return "Kalori hedefi 0-15000 aralığında olmalı.";
  if (profile.sleepGoalHours < 0 || profile.sleepGoalHours > 24) return "Uyku hedefi 0-24 saat aralığında olmalı.";
  return "";
};

export const validateDailyLog = (log: DailyLog) => {
  if (log.waterIntakeMl < 0 || log.waterIntakeMl > 15000) return "Su tüketimi 0-15000 ml aralığında olmalı.";
  if (log.stepsCount < 0 || log.stepsCount > 150000) return "Adım sayısı 0-150000 aralığında olmalı.";
  if (log.sleepHours < 0 || log.sleepHours > 24) return "Uyku süresi 0-24 saat aralığında olmalı.";
  if ((log.calorieIntake ?? 0) < 0 || (log.calorieIntake ?? 0) > 20000) return "Kalori alımı 0-20000 aralığında olmalı.";
  if ((log.weightKgSnapshot ?? 0) < 0 || (log.weightKgSnapshot ?? 0) > 500) return "Günlük kilo kaydı 0-500 kg aralığında olmalı.";
  return "";
};
