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
  Download,
  FileText,
  Plus,
  Briefcase,
  Bell,
  Lock,
  Shield,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea component exists, if not I will use Input or check imports
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
  Pie,
  Cell,
} from "recharts";
import { useTestimonials } from "@/hooks/useTestimonials";
import { MessageSquare, Trash2 } from "lucide-react";

// Drives Tab Component
const DrivesTab = () => {
  const [drives, setDrives] = useState([
    {
      id: 1,
      company: "Google",
      role: "Software Engineer",
      date: "2024-02-15",
      description: "Open for all branches. CGPA > 8.0",
    },
    {
      id: 2,
      company: "Microsoft",
      role: "Data Scientist",
      date: "2024-02-20",
      description: "Data Structures and Algorithms test required.",
    },
  ]);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    date: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newDrive = {
      id: Date.now(),
      ...formData,
    };

    setDrives([newDrive, ...drives]);
    setFormData({
      company: "",
      role: "",
      date: "",
      description: "",
    });
    toast.success("New drive added successfully");
  };

  const handleDelete = (id: number) => {
    setDrives(drives.filter((d) => d.id !== id));
    toast.success("Drive removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Manage Upcoming Drives
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Drive Form */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm h-fit">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Drive
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="d-company">Company Name</Label>
              <Input
                id="d-company"
                placeholder="e.g. Amazon"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-role">Role</Label>
              <Input
                id="d-role"
                placeholder="e.g. SDE I"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-date">Date</Label>
              <Input
                id="d-date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-desc">Description / Eligibility</Label>
              <Input
                id="d-desc"
                placeholder="Criteria, rounds etc."
                 value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              Publish Drive
            </Button>
          </form>
        </div>

        {/* Drives List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-foreground mb-4">
            Upcoming Drives ({drives.length})
          </h3>
          <div className="grid gap-4">
            {drives.map((drive) => (
              <div
                key={drive.id}
                className="bg-card rounded-lg border border-border p-4 shadow-sm flex justify-between items-start gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      {drive.company}
                    </h4>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full flex items-center gap-1">
                       <Calendar className="h-3 w-3" /> {drive.date}
                    </span>
                  </div>
                  <p className="text-sm text-primary mb-1">{drive.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {drive.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => handleDelete(drive.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {drives.length === 0 && (
              <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                No upcoming drives scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Moved TestimonialsTab definition before AdminDashboard to avoid "used before declaration"
const TestimonialsTab = () => {
  const { testimonials, addTestimonial, deleteTestimonial } = useTestimonials();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    batch: "",
    testimonial: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.testimonial) return;
    addTestimonial(formData);
    setFormData({
      name: "",
      role: "",
      company: "",
      batch: "",
      testimonial: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Manage Testimonials
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Testimonial Form */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm h-fit">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Testimonial
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-name">Name</Label>
              <Input
                id="t-name"
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="t-role">Role</Label>
                <Input
                  id="t-role"
                  placeholder="e.g. SDE"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-company">Company</Label>
                <Input
                  id="t-company"
                  placeholder="e.g. Google"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-batch">Batch</Label>
              <Input
                id="t-batch"
                placeholder="e.g. 2024"
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-message">Testimonial</Label>
              <Input
                id="t-message"
                placeholder="Share the experience..."
                className="min-h-[100px]"
                // as="textarea"
                value={formData.testimonial}
                onChange={(e) =>
                  setFormData({ ...formData, testimonial: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Add Testimonial
            </Button>
          </form>
        </div>

        {/* Testimonials List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-foreground mb-4">
            Current Testimonials ({testimonials.length})
          </h3>
          <div className="grid gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-card rounded-lg border border-border p-4 shadow-sm flex justify-between items-start gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{t.name}</h4>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                      {t.batch}
                    </span>
                  </div>
                  <p className="text-sm text-primary mb-2">
                    {t.role} @ {t.company}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{t.testimonial}"
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => deleteTestimonial(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                No testimonials added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const navItems = [
    {
      value: "overview",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      value: "internships",
      label: "Internships",
      icon: <List className="h-4 w-4" />,
    },
    {
      value: "drives",
      label: "Drives",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      value: "testimonials",
      label: "Testimonials",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      value: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const COLORS = ["#1e3a5f", "#2d5a87", "#4a7dad", "#6b9dc7", "#8ebde0"];

  // Simulate filter effect by adjusting stats
  const getFilteredStats = () => {
    let multiplier = 1;
    if (selectedYear !== "All Years") multiplier *= 0.85;
    if (selectedStatus === "Placed") multiplier *= 0.9;
    if (selectedStatus === "Unplaced") multiplier *= 0.1;

    return {
      placed: Math.round(placementStats.placedStudents * multiplier),
      total: Math.round(placementStats.totalStudents * multiplier) || 1,
      percentage: Math.round(
        placementStats.placementPercentage * (multiplier > 0.5 ? 1 : 0.8)
      ),
    };
  };

  const filteredStats = getFilteredStats();

  return (
    <DashboardLayout
      role="admin"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage placements, internships, and view analytics
          </p>
        </div>

        {/* Overview Stats */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      action: "New Internship Posted",
                      detail: "Software Engineer at Google",
                      time: "2 hours ago",
                    },
                    {
                      action: "Student Registered",
                      detail: "Rahul Sharma (Comp Engg)",
                      time: "4 hours ago",
                    },
                    {
                      action: "Application Verified",
                      detail: "Priya Patel for Amazon",
                      time: "1 day ago",
                    },
                    {
                      action: "New Company Added",
                      detail: "Salesforce",
                      time: "2 days ago",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start pb-3 border-b border-border last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applications/Internships Mini Table */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Recent Internships
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        <th className="px-3 py-2">Student</th>
                        <th className="px-3 py-2">Company</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internships.slice(0, 4).map((intern) => (
                        <tr
                          key={intern.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-3 py-2 font-medium">
                            {intern.studentName}
                          </td>
                          <td className="px-3 py-2">{intern.company}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
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
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Analytics Filters & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border border-border">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Reset Filters"
                  onClick={() => {
                    setSelectedYear("All Years");
                    setSelectedStatus("All Status");
                  }}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={() =>
                  toast.success("Analytics Report Downloaded", {
                    description:
                      "The PDF report has been saved to your device.",
                  })
                }
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company-wise Placements */}
              <div className="form-section">
                <h3 className="font-semibold text-foreground mb-4">
                  Company-wise Placements
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyWisePlacements}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="company"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="placements"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
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
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="year"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />
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
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        dataKey="range"
                        type="category"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Internship Management Table */}
        {activeTab === "internships" && (
          <div className="form-section">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Internship Management
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {placementStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success("Data Exported", {
                      description: "Internship data exported to CSV.",
                    })
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
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
                      <td className="py-3 px-4 text-foreground">
                        {intern.company}
                      </td>
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

        {/* Drives Tab */}
        {activeTab === "drives" && <DrivesTab />}

        {/* Testimonials */}
        {activeTab === "testimonials" && <TestimonialsTab />}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                System Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage portal configuration and security
              </p>
            </div>

            {/* System Preferences */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" /> System Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Maintenance Mode
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Disable access for students/alumni
                    </p>
                  </div>
                  <Switch
                    onCheckedChange={(c) =>
                      toast.success(
                        `Maintenance mode ${c ? "enabled" : "disabled"}`
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Placement Season
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Open applications for current batch
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    onCheckedChange={(c) =>
                      toast.success(
                        `Placement season ${c ? "active" : "inactive"}`
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Admin Security
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-pass">New Password</Label>
                  <Input id="admin-pass" type="password" />
                </div>
                <Button onClick={() => toast.success("Admin password updated")}>
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
