import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  tone?: "teal" | "coral" | "amber" | "green";
}

export const MetricCard = ({ title, value, detail, icon, tone = "teal" }: MetricCardProps) => (
  <article className={`metric-card ${tone}`}>
    <div className="metric-icon">{icon}</div>
    <div>
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  </article>
);
