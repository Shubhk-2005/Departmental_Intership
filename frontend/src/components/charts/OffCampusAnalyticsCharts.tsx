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

interface Placement {
  id: string;
  alumniName: string;
  graduationYear: string;
  companyName: string;
  companyLocation: string;
  jobRole: string;
  package: number | null;
  joiningDate: string;
  employmentType: string;
  companyIdCardUrl: string;
  submittedAt: string;
  status: string;
}

interface OffCampusAnalyticsChartsProps {
  data: Placement[];
}

const COLORS = {
  primary: "#3b82f6", // Blue
  success: "#10b981", // Emerald green
  warning: "#f59e0b", // Amber
  info: "#06b6d4", // Cyan
  purple: "#8b5cf6", // Purple
  gray: "#6b7280",
};

const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.info, COLORS.gray];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-foreground mb-2">{payload[0].payload.name || payload[0].payload.company || payload[0].payload.range || payload[0].name}</p>
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

const OffCampusAnalyticsCharts = ({ data }: OffCampusAnalyticsChartsProps) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No off-campus placement data available for analytics.</div>;
  }

  // 1. Employment Type Distribution
  const typeCounts = data.reduce((acc: any, curr) => {
    const type = curr.employmentType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeCounts).map(([name, value], index) => {
    return { name, value, color: PIE_COLORS[index % PIE_COLORS.length] };
  });

  // 2. Package Range Distribution
  const ranges = {
    "Under 5 LPA": 0,
    "5-10 LPA": 0,
    "10-15 LPA": 0,
    "15-20 LPA": 0,
    "Above 20 LPA": 0,
    "Not Disclosed": 0,
  };

  data.forEach((curr) => {
    if (curr.package === null || curr.package === undefined) {
      ranges["Not Disclosed"] += 1;
    } else {
      const pkg = Number(curr.package);
      if (pkg < 5) ranges["Under 5 LPA"] += 1;
      else if (pkg >= 5 && pkg < 10) ranges["5-10 LPA"] += 1;
      else if (pkg >= 10 && pkg < 15) ranges["10-15 LPA"] += 1;
      else if (pkg >= 15 && pkg < 20) ranges["15-20 LPA"] += 1;
      else ranges["Above 20 LPA"] += 1;
    }
  });

  const packageData = Object.entries(ranges).filter(([_, count]) => count > 0).map(([range, count]) => ({
    range,
    count,
  }));

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
        {/* Employment Type Chart */}
        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center flex items-center justify-center gap-2">
            <span>💼</span> Employment Type
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
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
                  {typeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Distribution Bar Chart */}
        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 text-center flex items-center justify-center gap-2">
            <span>💰</span> Salary Packages
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar dataKey="count" fill={COLORS.success} radius={[4, 4, 0, 0]} name="Alumni">
                  {packageData.map((entry, index) => (
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
          <span>🏢</span> Top Hiring Companies
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={companyData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="company" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} name="Alumni" />
              </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OffCampusAnalyticsCharts;
