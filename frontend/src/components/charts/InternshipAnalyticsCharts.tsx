import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Internship {
  id: string;
  studentName: string;
  rollNumber?: string;
  studentEmail?: string;
  companyName: string;
  domain: string;
  status: string;
  [key: string]: any;
}

interface InternshipAnalyticsChartsProps {
  data: Internship[];
}

const COLORS = {
  primary: "#3b82f6", // Blue
  success: "#10b981", // Emerald green
  warning: "#f59e0b", // Amber
  info: "#06b6d4", // Cyan
  purple: "#8b5cf6", // Purple
  gray: "#6b7280",
};

const PIE_COLORS = [COLORS.success, COLORS.primary, COLORS.warning, COLORS.purple, COLORS.info, COLORS.gray];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-foreground mb-2">{payload[0].payload.name || payload[0].payload.domain || payload[0].payload.company || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  if (percent < 0.05) return null; // Hide text for very small slices

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="font-bold text-xs tracking-wide"
      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
    >
      {`${value} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const InternshipAnalyticsCharts = ({ data }: InternshipAnalyticsChartsProps) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No internship data available for analytics.</div>;
  }

  // 1. Status Distribution
  const statusCounts = data.reduce((acc: any, curr) => {
    const status = curr.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => {
    let color = COLORS.gray;
    if (name === "Completed") color = COLORS.success;
    else if (name === "Ongoing") color = COLORS.primary;
    else if (name === "Applied") color = COLORS.warning;
    return { name, value, color };
  });

  // 2. Domain Distribution
  const domainCounts = data.reduce((acc: any, curr) => {
    let domain = curr.domain || "Unknown";
    // Normalize domain string slightly
    domain = domain.trim();
    if (domain === "") domain = "Unknown";
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

  const domainData = Object.entries(domainCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a: any, b: any) => (b.count as number) - (a.count as number))
    .slice(0, 7); // Top 7 domains

  // 3. Top Companies
  const companyCounts = data.reduce((acc: any, curr) => {
    let company = curr.companyName || "Unknown";
    company = company.trim();
    if (company === "") company = "Unknown";
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {});

  const companyData = Object.entries(companyCounts)
    .map(([company, count]) => ({ company, count }))
    .sort((a: any, b: any) => (b.count as number) - (a.count as number))
    .slice(0, 10); // Top 10 companies

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center flex items-center justify-center gap-2">
            <span>📊</span> Internship Status
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Distribution Bar Chart */}
        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center flex items-center justify-center gap-2">
            <span>💻</span> Top Domains
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="domain" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar dataKey="count" fill={COLORS.purple} radius={[4, 4, 0, 0]} name="Students">
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Companies Bar Chart */}
      <div className="bg-gradient-to-br from-card to-card/50 rounded-xl border border-border p-6 shadow-lg">
        <h3 className="text-lg font-bold text-foreground mb-4 text-center flex items-center justify-center gap-2">
          <span>🏢</span> Top Companies
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={companyData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="company" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar dataKey="count" fill={COLORS.info} radius={[0, 4, 4, 0]} name="Students" />
              </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InternshipAnalyticsCharts;
