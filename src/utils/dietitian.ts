import { AppState, DietitianPatient, UserHealthProfile } from "../types";
import { bmiCategory, calculateBmi, createEmptyHealthProfile, getDailyLog, progressPercent } from "./healthCalculations";
import { todayIso } from "./date";

export const getDietitianRelations = (state: AppState, dietitianUserId: string) =>
  state.dietitianPatients.filter((relation) => relation.dietitianUserId === dietitianUserId && relation.status === "active");

export const isDietitianPatient = (state: AppState, dietitianUserId: string, patientUserId: string) =>
  getDietitianRelations(state, dietitianUserId).some((relation) => relation.patientUserId === patientUserId);

export const getDietitianPatientProfiles = (state: AppState, dietitianUserId: string) => {
  const patientIds = getDietitianRelations(state, dietitianUserId).map((relation) => relation.patientUserId);
  return patientIds
    .map((patientId) => {
      const profile = state.healthProfiles.find((item) => item.userId === patientId);
      if (profile) return profile;
      const user = state.users.find((item) => item.id === patientId);
      return user ? createEmptyHealthProfile(user.id, user.username, user.email, user.fullName) : null;
    })
    .filter((profile): profile is UserHealthProfile => Boolean(profile));
};

export const patientStatus = (profile: UserHealthProfile, state: AppState) => {
  const log = getDailyLog(state.dailyLogs, profile.userId, todayIso());
  if (!log) return "Veri Eksik";
  const bmi = calculateBmi(profile.weightKg, profile.heightCm);
  if (bmi >= 30 || progressPercent(log.waterIntakeMl, profile.dailyWaterGoalMl) < 40) return "Takip Gerekli";
  if (Math.abs(profile.weightKg - profile.targetWeightKg) <= 2) return "Hedefe Yakın";
  return "Güncel";
};

export const patientSummary = (profile: UserHealthProfile, state: AppState) => {
  const log = getDailyLog(state.dailyLogs, profile.userId, todayIso());
  const bmi = calculateBmi(profile.weightKg, profile.heightCm);
  return {
    bmi,
    bmiCategory: bmiCategory(bmi),
    waterProgress: log ? progressPercent(log.waterIntakeMl, profile.dailyWaterGoalMl) : 0,
    stepsProgress: log ? progressPercent(log.stepsCount, profile.dailyStepGoal) : 0,
    lastUpdate: log?.updatedAt ?? profile.updatedAt,
    status: patientStatus(profile, state),
  };
};

export const createRelation = (dietitianUserId: string, patientUserId: string, internalNote = ""): DietitianPatient => ({
  id: crypto.randomUUID(),
  dietitianUserId,
  patientUserId,
  assignedAt: new Date().toISOString(),
  status: "active",
  internalNote,
});
