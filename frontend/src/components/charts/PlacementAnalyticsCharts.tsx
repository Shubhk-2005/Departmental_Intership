
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

const PlacementAnalyticsCharts = ({
  data,
  selectedYear,
  availableYears,
  showBreakdown = false,
}: PlacementAnalyticsChartsProps) => {
  // Helper to get pie data for a specific year record
  const getPieData = (record: AnalyticsData) => {
    return [
      { name: "Placed", value: Number(record.placed) || 0, color: "#10b981" },
      {
        name: "Higher Studies",
        value: Number(record.higherStudies) || 0,
        color: "#3b82f6",
      },
    ];
  };

  // Filter logic handled by parent or just internal logic
  // For "All Years", we show the Bar Chart AND a loop of Pie Charts
  // For "Single Year", we show just that year's Pie Chart + Summary

  if (selectedYear === "All Years") {
    return (
      <div className="space-y-8">
        {/* 1. Main Stacked Bar Chart */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">
            Placement Overview (All Years)
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="placed"
                  stackId="a"
                  fill="#10b981"
                  name="Placed"
                />
                <Bar
                  dataKey="higherStudies"
                  stackId="a"
                  fill="#3b82f6"
                  name="Higher Studies"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Yearly Breakdown (Grid of Pie Charts) - Conditional */}
        {showBreakdown && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Yearly Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((record) => (
                <div
                  key={record.year}
                  className="bg-card rounded-lg border border-border p-4 shadow-sm flex flex-col items-center"
                >
                  <h4 className="font-medium text-foreground mb-2">
                    Batch {record.year}
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieData(record)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                        >
                          {getPieData(record).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-4 space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Eligible</span>
                      <span className="font-medium">{record.eligible}</span>
                    </div>
                     <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Placed</span>
                      <span className="font-medium text-success">{record.placed}</span>
                    </div>
                     <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Higher Studies</span>
                      <span className="font-medium text-info">{record.higherStudies}</span>
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
    if (!record) return <div>No data for {selectedYear}</div>;

    const totalSuccess =
      (Number(record.placed) || 0) + (Number(record.higherStudies) || 0);
    const placementRate =
      record.eligible > 0
        ? Math.round((Number(record.placed) / record.eligible) * 100)
        : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">
            Distribution ({selectedYear})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPieData(record)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {getPieData(record).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm flex flex-col justify-center">
          <h3 className="font-semibold text-foreground mb-4">
            Summary Insights
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Cohort Size</span>
              <span className="font-bold">{record.eligible} Students</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Placement Rate</span>
              <span className="font-bold text-success">{placementRate}%</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Higher Studies</span>
              <span className="font-bold text-info">
                {record.higherStudies}
              </span>
            </div>
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <p className="text-sm italic text-muted-foreground">
                In {selectedYear}, {record.placed} students were placed and{" "}
                {record.higherStudies} opted for higher studies out of{" "}
                {record.eligible} eligible students.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PlacementAnalyticsCharts;
