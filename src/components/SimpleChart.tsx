interface ChartPoint {
  label: string;
  value: number;
  total?: number;
}

interface SimpleChartProps {
  title: string;
  data: ChartPoint[];
  suffix?: string;
}

export const SimpleChart = ({ title, data, suffix = "" }: SimpleChartProps) => {
  const max = Math.max(...data.map((point) => point.total ?? point.value), 1);

  return (
    <section className="panel">
      <div className="section-title">
        <h2>{title}</h2>
      </div>
      <div className="bar-chart">
        {data.map((point) => {
          const height = Math.max(8, (point.value / max) * 100);
          return (
            <div className="bar-item" key={point.label}>
              <div className="bar-shell">
                <span style={{ height: `${height}%` }} />
              </div>
              <strong>
                {point.value}
                {suffix}
              </strong>
              <small>{point.label}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
};
