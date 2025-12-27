import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  loading?: boolean;
}

const StatCard = ({ title, value, subtitle, icon, trend, loading }: StatCardProps) => {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg opacity-50">
             <div className="h-6 w-6 bg-primary/20 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-sm font-medium mt-2 ${
                trend.positive ? "text-success" : "text-destructive"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <div className="text-primary">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
