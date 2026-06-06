type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground font-sans">{subtitle}</p>
    </div>
  );
};

export default DashboardHeader;
