import { GoalStatus, Priority, TaskStatus } from "../types";

const labels: Record<TaskStatus | Priority | GoalStatus, string> = {
  pending: "Bekliyor",
  active: "Devam ediyor",
  done: "Tamamlandı",
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  completed: "Tamamlandı",
  paused: "Ertelendi",
};

export const StatusBadge = ({ value }: { value: TaskStatus | Priority | GoalStatus }) => (
  <span className={`badge badge-${value}`}>{labels[value]}</span>
);
