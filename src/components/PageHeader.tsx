interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, action }: PageHeaderProps) => (
  <div className="page-header">
    <div>
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {action}
  </div>
);
