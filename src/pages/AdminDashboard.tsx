import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  placementStats,
  internships,
  companies,
  academicYears,
  placementStatuses,
  companyWisePlacements,
  yearWiseTrends,
  packageDistribution,
} from "@/data/dummyData";
import {
  LayoutDashboard,
  Settings,
  List,
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Building2,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const navItems = [
    { path: "#overview", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { path: "#analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { path: "#internships", label: "Internships", icon: <List className="h-4 w-4" /> },
    { path: "#settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  const COLORS = ["#1e3a5f", "#2d5a87", "#4a7dad", "#6b9dc7", "#8ebde0"];

  // Simulate filter effect by adjusting stats
  const getFilteredStats = () => {
    let multiplier = 1;
    if (selectedYear !== "All Years") multiplier *= 0.85;
    if (selectedCompany !== "All Companies") multiplier *= 0.15;
    if (selectedStatus === "Placed") multiplier *= 0.9;
    if (selectedStatus === "Unplaced") multiplier *= 0.1;

    return {
      placed: Math.round(placementStats.placedStudents * multiplier),
      total: Math.round(placementStats.totalStudents * multiplier) || 1,
      percentage: Math.round(placementStats.placementPercentage * (multiplier > 0.5 ? 1 : 0.8)),
    };
  };

  const filteredStats = getFilteredStats();

  return (
    <DashboardLayout
      role="admin"
      navItems={navItems.map((item) => ({
        ...item,
        path: `/dashboard/admin${item.path}`,
      }))}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage placements, internships, and view analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {["overview", "analytics", "internships"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="form-section">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filter Controls</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {placementStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedYear("All Years");
                setSelectedCompany("All Companies");
                setSelectedStatus("All Status");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Students Placed"
              value={filteredStats.placed}
              subtitle={`Out of ${filteredStats.total}`}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Placement Rate"
              value={`${filteredStats.percentage}%`}
              icon={<TrendingUp className="h-6 w-6" />}
            />
            <StatCard
              title="Highest Package"
              value={placementStats.highestPackage}
              icon={<Award className="h-6 w-6" />}
            />
            <StatCard
              title="Companies Visited"
              value={placementStats.companiesVisited}
              icon={<Building2 className="h-6 w-6" />}
            />
          </div>
        )}

        {/* Analytics Charts */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company-wise Placements */}
            <div className="form-section">
              <h3 className="font-semibold text-foreground mb-4">
                Company-wise Placements
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyWisePlacements}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="company"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="placements" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Year-wise Trends */}
            <div className="form-section">
              <h3 className="font-semibold text-foreground mb-4">
                Year-wise Placement Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearWiseTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="placed"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Package Distribution */}
            <div className="form-section lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4">
                Package Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={packageDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="range"
                      type="category"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Internship Management Table */}
        {activeTab === "internships" && (
          <div className="form-section">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Internship Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Roll No.
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Domain
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {internships.map((intern) => (
                    <tr
                      key={intern.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 text-foreground font-medium">
                        {intern.studentName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {intern.rollNo}
                      </td>
                      <td className="py-3 px-4 text-foreground">{intern.company}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {intern.domain}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            intern.status === "Completed"
                              ? "bg-success/10 text-success"
                              : intern.status === "Ongoing"
                              ? "bg-info/10 text-info"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {intern.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
