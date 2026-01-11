
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
  Label,
  LabelList,
} from "recharts";

interface AnalyticsData {
  year: string;
  eligible: number;
  placed: number;
  higherStudies: number;
  unplaced?: number;
}

interface PlacementAnalyticsChartsProps {
  data: AnalyticsData[];
  selectedYear: string;
  availableYears: string[];
  showBreakdown?: boolean;
}

// Professional color palette
const COLORS = {
  placed: "#10b981", // Emerald green
  higherStudies: "#3b82f6", // Blue
  eligible: "#8b5cf6", // Purple
  gradient1: "#06b6d4", // Cyan
  gradient2: "#8b5cf6", // Purple
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-foreground mb-2">{payload[0].payload.year || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label for pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${value} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const PlacementAnalyticsCharts = ({
  data,
  selectedYear,
  availableYears,
  showBreakdown = false,
}: PlacementAnalyticsChartsProps) => {
  // Helper to get pie data for a specific year record
  const getPieData = (record: AnalyticsData) => {
    return [
      { name: "Placed", value: Number(record.placed) || 0, color: COLORS.placed },
      {
        name: "Higher Studies",
        value: Number(record.higherStudies) || 0,
        color: COLORS.higherStudies,
      },
    ];
  };

  if (selectedYear === "All Years") {
    return (
      <div className="space-y-8">
        {/* 1. Main Stacked Bar Chart */}
        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                📊 Placement Overview (All Years)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Year-wise placement and higher studies distribution
              </p>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.placed} stopOpacity={0.9}/>
                    <stop offset="95%" stopColor={COLORS.placed} stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="colorHigherStudies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.higherStudies} stopOpacity={0.9}/>
                    <stop offset="95%" stopColor={COLORS.higherStudies} stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="placed"
                  stackId="a"
                  fill="url(#colorPlaced)"
                  name="Placed"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                >
                  <LabelList dataKey="placed" position="inside" fill="white" fontSize={12} fontWeight="bold" />
                </Bar>
                <Bar
                  dataKey="higherStudies"
                  stackId="a"
                  fill="url(#colorHigherStudies)"
                  name="Higher Studies"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                >
                  <LabelList dataKey="higherStudies" position="inside" fill="white" fontSize={12} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Yearly Breakdown (Grid of Pie Charts) - Conditional */}
        {showBreakdown && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="text-2xl">📈</span> Yearly Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((record) => (
                <div
                  key={record.year}
                  className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <h4 className="font-bold text-lg text-foreground mb-4 text-center">
                    🎓 Batch {record.year}
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <filter id="shadow" height="130%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                            <feOffset dx="2" dy="2" result="offsetblur"/>
                            <feComponentTransfer>
                              <feFuncA type="linear" slope="0.3"/>
                            </feComponentTransfer>
                            <feMerge> 
                              <feMergeNode/>
                              <feMergeNode in="SourceGraphic"/> 
                            </feMerge>
                          </filter>
                        </defs>
                        <Pie
                          data={getPieData(record)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          isAnimationActive={true}
                          animationDuration={1200}
                          animationEasing="ease-out"
                          style={{ filter: "url(#shadow)" }}
                        >
                          {getPieData(record).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-4 space-y-2 text-sm bg-muted/30 rounded-lg p-3">
                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground font-medium">Eligible</span>
                      <span className="font-bold text-foreground">{record.eligible}</span>
                    </div>
                     <div className="flex justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.placed }} />
                        <span className="text-muted-foreground">Placed</span>
                      </div>
                      <span className="font-bold" style={{ color: COLORS.placed }}>{record.placed}</span>
                    </div>
                     <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.higherStudies }} />
                        <span className="text-muted-foreground">Higher Studies</span>
                      </div>
                      <span className="font-bold" style={{ color: COLORS.higherStudies }}>{record.higherStudies}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    // Single Year View
    const record = data.find((d) => d.year === selectedYear);
    if (!record) return <div className="text-center py-10 text-muted-foreground">No data available for {selectedYear}</div>;

    const totalSuccess =
      (Number(record.placed) || 0) + (Number(record.higherStudies) || 0);
    const placementRate =
      record.eligible > 0
        ? Math.round((Number(record.placed) / record.eligible) * 100)
        : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <span>📊</span> Distribution ({selectedYear})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="shadow-single" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="2" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge> 
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={getPieData(record)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  style={{ filter: "url(#shadow-single)" }}
                >
                  {getPieData(record).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border p-6 shadow-lg flex flex-col justify-center">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <span>💡</span> Summary Insights
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground font-medium">Cohort Size</span>
              <span className="text-2xl font-bold text-foreground">{record.eligible}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Placement Rate</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{placementRate}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <span className="text-blue-700 dark:text-blue-400 font-medium">Higher Studies</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {record.higherStudies}
              </span>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm leading-relaxed text-foreground">
                <span className="font-semibold">In {selectedYear},</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">{record.placed}</span> students secured placements and{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">{record.higherStudies}</span> pursued higher studies out of{" "}
                <span className="font-bold">{record.eligible}</span> eligible students.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PlacementAnalyticsCharts;
