import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea"; 
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
  Legend,
} from "recharts";
import { useTestimonials } from "@/hooks/useTestimonials";
import { MessageSquare, Trash2, FileSpreadsheet } from "lucide-react";
import { PlacementRecordsTab } from "@/components/admin/PlacementRecordsTab";
import PlacementAnalyticsCharts from "@/components/charts/PlacementAnalyticsCharts";
import { db, auth } from "@/lib/firebase"; // Ensure auth is imported
import { collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { updatePassword } from "firebase/auth";

// Drives Tab Component
const DrivesTab = () => {
  const [drives, setDrives] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "placement_drives"), orderBy("postedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const drivesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrives(drivesData);
    });

    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    date: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await addDoc(collection(db, "placement_drives"), {
        ...formData,
        postedAt: new Date().toISOString()
      });
      
      setFormData({
        company: "",
        role: "",
        date: "",
        description: "",
      });
      toast.success("New drive posted successfully");
    } catch (error) {
      console.error("Error adding drive:", error);
      toast.error("Failed to post drive");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "placement_drives", id));
      toast.success("Drive removed");
    } catch (error) {
      console.error("Error deleting drive:", error);
      toast.error("Failed to remove drive");
    }
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
  const placementStatuses = ["All Status", "Ongoing", "Completed", "Applied"];
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [internships, setInternships] = useState([
    {
      id: 1,
      studentName: "Rahul Sharma",
      rollNo: "70582200001",
      company: "Google",
      domain: "Software Engineering",
      status: "Ongoing",
    },
    {
      id: 2,
      studentName: "Priya Patel",
      rollNo: "70582200002",
      company: "Microsoft",
      domain: "Data Science",
      status: "Completed",
    },
    {
      id: 3,
      studentName: "Amit Singh",
      rollNo: "70582200003",
      company: "Amazon",
      domain: "Cloud Computing",
      status: "Applied",
    },
  ]);
  
  // Real Data State
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Settings State
  const [settings, setSettings] = useState({
      maintenanceMode: false,
      placementSeason: true
  });
  const [newPassword, setNewPassword] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch Settings & Analytics
  useEffect(() => {
      const fetchData = async () => {
          try {
              // Fetch Analytics
              const querySnapshot = await getDocs(collection(db, "placement_stats_yearly"));
              const data = querySnapshot.docs.map(doc => doc.data());
              data.sort((a: any, b: any) => b.year.localeCompare(a.year));
              setAnalyticsData(data);
              
              const years = Array.from(new Set(data.map((d:any) => d.year))).sort();
              setAvailableYears(years);

              // Fetch Settings
              const settingsDoc = await getDoc(doc(db, "system_settings", "general"));
              if (settingsDoc.exists()) {
                  setSettings(settingsDoc.data() as any);
              }
          } catch (e) {
              console.error("Error fetching data:", e);
          } finally {
              setLoadingSettings(false);
          }
      };
      fetchData();
  }, []);

  const handleSettingChange = async (key: string, value: boolean) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings); // Optimistic update
      
      try {
          await setDoc(doc(db, "system_settings", "general"), newSettings, { merge: true });
          toast.success("Settings updated successfully");
      } catch (error) {
          console.error("Error updating settings:", error);
          toast.error("Failed to update settings");
          setSettings(settings); // Revert on error
      }
  };

  const handlePasswordUpdate = async () => {
      if (!newPassword || newPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
      }
      
      if (!auth.currentUser) {
           toast.error("No active user found");
           return;
      }

      try {
          await updatePassword(auth.currentUser, newPassword);
          toast.success("Admin password updated successfully");
          setNewPassword("");
      } catch (error: any) {
          console.error("Error updating password:", error);
          toast.error("Failed to update password: " + error.message);
      }
  };

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
      value: "placement-records",
      label: "Records & Upload",
      icon: <FileSpreadsheet className="h-4 w-4" />,
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

  // Filter Logic
  const filteredAnalyticsData = selectedYear === "All Years" 
      ? analyticsData 
      : analyticsData.filter((d: any) => d.year === selectedYear);

  // Aggregated Stats for Overview Cards
  const getAggregatedStats = () => {
      const placed = filteredAnalyticsData.reduce((acc, curr) => acc + (Number(curr.placed) || 0), 0);
      const eligible = filteredAnalyticsData.reduce((acc, curr) => acc + (Number(curr.eligible) || 0), 0);
      const higherStudies = filteredAnalyticsData.reduce((acc, curr) => acc + (Number(curr.higherStudies) || 0), 0);
      
      // Overall Placement Rate (Total Placed / Total Eligible) * 100
      const percentage = eligible > 0 ? Math.round((placed / eligible) * 100) : 0;

      // Avg Yearly Placement Rate = (Sum of Rate of Each Year) / Count of Years
      // This gives equal weight to each year regardless of batch size
      let totalYearlyRates = 0;
      let yearCount = 0;

      filteredAnalyticsData.forEach(d => {
          const e = Number(d.eligible) || 0;
          const p = Number(d.placed) || 0;
          if (e > 0) {
              totalYearlyRates += (p / e) * 100;
              yearCount++;
          }
      });

      const avgYearlyRate = yearCount > 0 ? Math.round(totalYearlyRates / yearCount) : 0;

      return {
          placed,
          total: eligible,
          percentage,
          higherStudies,
          avgYearlyRate // New metric
      };
  };

  const filteredStats = getAggregatedStats();
  const hiddenReportRef = useRef<HTMLDivElement>(null);

  // Download Report Logic
  const downloadAnalyticsReport = async () => {
    if (!hiddenReportRef.current) return;
    try {
      // Temporarily make it visible for capture (if display:none doesn't work with html2canvas)
      // Actually, standard practice is positioning it off-screen but visible in DOM
      const canvas = await html2canvas(hiddenReportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      pdf.save(`Analytics_Report_${selectedYear}.pdf`);
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("PDF Gen Error:", err);
      toast.error("Failed to generate PDF");
    }
  };

  const getPieData = () => {
      const data = filteredAnalyticsData[0]; // Should rely on single year filter
      if(!data) return [];
      return [
          { name: "Placed", value: Number(data.placed) || 0, color: "#10b981" },
          { name: "Higher Studies", value: Number(data.higherStudies) || 0, color: "#3b82f6" },
          // Removed Unplaced
      ];
  };

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
            // ... (keep existing overview code)
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
                title="Higher Studies"
                value={filteredStats.higherStudies}
                subtitle="Pursued Masters/PhD"
                icon={<Award className="h-6 w-6" />}
              />
              <StatCard
                title="Yearly Success"
                value={`${filteredStats.avgYearlyRate}%`}
                subtitle="Avg Placement Rate"
                icon={<Building2 className="h-6 w-6" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* ... (Recent Activity & Internships - keep existing) */}
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

               {/* Internships Table */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Recent Internships
                </h3>
                  {/* ... (Keep existing table) */}
                  <div className="text-center text-sm text-muted-foreground py-4">
                      Check Internship tab for details
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
                    <SelectItem value="All Years">All Years</SelectItem>
                    {availableYears.map((year) => (
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
                  }}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={downloadAnalyticsReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>

            {/* VISIBLE CHART CONTAINER */}
            <div className="space-y-6 bg-background p-4 rounded-md">
                 {/* Key Metrics Row (Available in View) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-lg border shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">Placed</p>
                    <p className="text-2xl font-bold text-success">{filteredStats.placed}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">Higher Studies</p>
                    <p className="text-2xl font-bold text-info">{filteredStats.higherStudies}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">Total Eligible</p>
                    <p className="text-2xl font-bold">{filteredStats.total}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-primary">{filteredStats.percentage}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                {/* Visible Charts: showBreakdown={false} so only Bar updates */}
                <PlacementAnalyticsCharts 
                    data={filteredAnalyticsData}
                    selectedYear={selectedYear}
                    availableYears={availableYears}
                    showBreakdown={false}
                />
                </div>
            </div>

            {/* HIDDEN REPORT CONTAINER (For PDF Generation Only) */}
            <div 
              ref={hiddenReportRef} 
              style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '1200px' }}
              className="space-y-6 bg-white p-8" // Use white bg for clean PDF
            >
                 <div className="mb-4 text-center border-b pb-4">
                     <h2 className="text-3xl font-bold text-black">Placement Analytics Report</h2>
                     <p className="text-gray-600 mt-2">{selectedYear === "All Years" ? "Comprehensive Report (All Years)" : `Academic Year: ${selectedYear}`}</p>
                 </div>

                 {/* Report Metrics */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="border p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Placed</p>
                      <p className="text-3xl font-bold text-green-600">{filteredStats.placed}</p>
                    </div>
                    <div className="border p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Higher Studies</p>
                      <p className="text-3xl font-bold text-blue-600">{filteredStats.higherStudies}</p>
                    </div>
                    <div className="border p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Total Eligible</p>
                      <p className="text-3xl font-bold text-black">{filteredStats.total}</p>
                    </div>
                    <div className="border p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-3xl font-bold text-primary">{filteredStats.percentage}%</p>
                    </div>
                </div>

                {/* Report Charts: showBreakdown={true} to include all pies if All Years */}
                <PlacementAnalyticsCharts 
                    data={filteredAnalyticsData}
                    selectedYear={selectedYear}
                    availableYears={availableYears}
                    showBreakdown={true}
                />
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

        {/* Placement Records Tab */}
        {activeTab === "placement-records" && <PlacementRecordsTab />}

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
                    checked={settings.maintenanceMode}
                    onCheckedChange={(c) => handleSettingChange("maintenanceMode", c)}
                    disabled={loadingSettings}
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
                    checked={settings.placementSeason}
                    onCheckedChange={(c) => handleSettingChange("placementSeason", c)}
                    disabled={loadingSettings}
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
                  <Input 
                    id="admin-pass" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <Button onClick={handlePasswordUpdate}>
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