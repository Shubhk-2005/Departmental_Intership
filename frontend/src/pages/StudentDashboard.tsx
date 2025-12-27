import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import AlumniCard from "@/components/cards/AlumniCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  internships,
  alumniDirectory,
  domains,
  internshipStatuses,
} from "@/data/dummyData";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, onSnapshot, orderBy } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Briefcase } from "lucide-react";
import PlacementAnalyticsCharts from "@/components/charts/PlacementAnalyticsCharts";
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
} from "recharts";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Building2,
  Filter,
  Search,
  Shield,
  Bell,
  Lock,
  GraduationCap,
  Settings,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Drives State
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<any>(null);
  
  // Placement Stats Filter State
  const [selectedYear, setSelectedYear] = useState("All Years");
  
  // Real Data State (Aggregated)
  const [dbStats, setDbStats] = useState({
      placed: 0,
      totalEligible: 0,
      percentage: 0,
      higherStudies: 0
  });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]); // Full data for charts

  useEffect(() => {
    // Fetch Drives
    const q = query(collection(db, "placement_drives"), orderBy("postedAt", "desc"));
    const unsubscribeDrives = onSnapshot(q, (snapshot) => {
      const drivesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrives(drivesData);
    });

    return () => unsubscribeDrives();
  }, []);

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const recordsRef = collection(db, "placement_stats_yearly");
              const snapshot = await getDocs(recordsRef);
              const data = snapshot.docs.map(doc => doc.data());
              
              // Extract unique years
              const years = Array.from(new Set(data.map((d: any) => d.year))).sort();
              setAvailableYears(years);
              setAnalyticsData(data); // Store full data

              // Filter
              let filteredData = data;
              if (selectedYear !== "All Years") {
                  filteredData = data.filter((d: any) => d.year === selectedYear);
              }

              // Calculate Aggregated Stats
              const placedCount = filteredData.reduce((acc, curr: any) => acc + (Number(curr.placed) || 0), 0);
              const higherStudiesCount = filteredData.reduce((acc, curr: any) => acc + (Number(curr.higherStudies) || 0), 0);
              const totalEligible = filteredData.reduce((acc, curr: any) => acc + (Number(curr.eligible) || 0), 0);
              
              const totalSuccess = placedCount + higherStudiesCount;
              
              setDbStats({
                  placed: placedCount,
                  totalEligible: totalEligible,
                  higherStudies: higherStudiesCount,
                  percentage: totalEligible > 0 ? Math.round((placedCount / totalEligible) * 100) : 0
              });

          } catch (error) {
              console.error("Error fetching stats:", error);
          }
      };

      fetchStats();
  }, [selectedYear]);

  const filteredStats = dbStats;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success("Profile picture updated");
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    {
      value: "overview",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      value: "add-internship",
      label: "Add Opportunity",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      value: "view-internships",
      label: "My Opportunities",
      icon: <List className="h-4 w-4" />,
    },
    {
      value: "statistics",
      label: "Placement Stats",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      value: "alumni",
      label: "Alumni Directory",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      value: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <DashboardLayout
      role="student"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, Student
          </h1>
          <p className="text-muted-foreground">
            Manage your internships and view placement statistics
          </p>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Summary Card */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        AM
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      Arjun Malhotra
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Roll No: CE2024001
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Computer Engineering
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">CGPA</span>
                    <span className="font-medium text-foreground">8.9</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Batch</span>
                    <span className="font-medium text-foreground">2024</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                      Placed
                    </span>
                  </div>
                  <Button className="w-full mt-2" variant="outline">
                    View Full Profile
                  </Button>
                </div>
              </div>

              {/* Quick Stats & Notifications */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground">
                      Applications
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      12
                    </p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground">Interviews</p>
                    <p className="text-2xl font-bold text-foreground mt-1">4</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground">Offers</p>
                    <p className="text-2xl font-bold text-foreground mt-1">1</p>
                  </div>
                </div>

                {/* Notifications & Upcoming Drives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notifications */}
                  <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      Recent Notifications
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "TCS Interview Scheduled",
                          time: "2 hours ago",
                        },
                        {
                          title: "New Drive: Infosys Added",
                          time: "1 day ago",
                        },
                        { title: "Resume Verified", time: "2 days ago" },
                      ].map((note, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-start pb-3 border-b border-border last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {note.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {note.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Drives */}
                  <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4">
                      Upcoming Drives ({drives.length})
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {drives.map((drive) => (
                        <div
                          key={drive.id}
                          className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                          onClick={() => setSelectedDrive(drive)}
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {drive.company}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {drive.role}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">
                              {drive.date}
                            </span>
                          </div>
                        </div>
                      ))}
                      {drives.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No upcoming drives.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={!!selectedDrive} onOpenChange={(open) => !open && setSelectedDrive(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {selectedDrive?.company}
                </DialogTitle>
                <DialogDescription>
                  Detailed information about this Drive.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium text-foreground">{selectedDrive?.role}</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium text-foreground">{selectedDrive?.date}</span>
                 </div>
                 
                 <div className="bg-muted/30 p-4 rounded-lg border border-border mt-4">
                    <h4 className="text-sm font-semibold mb-2">Description & Eligibility</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedDrive?.description || "No additional details provided."}
                    </p>
                 </div>
              </div>

               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setSelectedDrive(null)}>Close</Button>
               </div>
            </DialogContent>
          </Dialog>
          </>
        )}

        {/* Add Internship Form */}
        {activeTab === "add-internship" && (
          <div className="form-section max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Add New Opportunity
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Placement">Placement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-campus">On-campus</SelectItem>
                      <SelectItem value="Off-campus">Off-campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="e.g., TCS, Infosys" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Position</Label>
                  <Input id="role" placeholder="e.g., Software Intern" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (if applicable)</Label>
                  <Input id="duration" placeholder="e.g., 3 months" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {internshipStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedStatus === "Ongoing" ||
                  selectedStatus === "Completed") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit">Submit Details</Button>
                <Button type="button" variant="outline">
                  Clear Form
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* View Internships */}
        {activeTab === "view-internships" && (
          <div className="form-section">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              My Opportunities
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {internships.slice(0, 5).map((intern) => (
                    <tr
                      key={intern.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 px-4 text-foreground">
                        {intern.company}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {intern.role}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {(intern as any).category || "Internship"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            (intern as any).type === "On-campus"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {(intern as any).type || "Off-campus"}
                        </span>
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

        {/* Statistics */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  Placement Statistics
                </h2>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Placed"
                value={filteredStats.placed}
                subtitle={`${filteredStats.percentage}% success rate`}
                icon={<Users className="h-6 w-6" />}
              />
              <StatCard
                title="Higher Studies"
                value={filteredStats.higherStudies}
                subtitle="Pursued Masters/PhD"
                icon={<Award className="h-6 w-6" />}
              />
              <StatCard
                title="Total Eligible"
                value={filteredStats.totalEligible}
                subtitle="Students registered"
                icon={<TrendingUp className="h-6 w-6" />}
              />
            </div>

            {/* Visualizations Component */}
            <div className="mt-6">
                <PlacementAnalyticsCharts 
                    data={analyticsData}
                    selectedYear={selectedYear}
                    availableYears={availableYears}
                />
            </div>
          </div>
        )}

        {/* Alumni Directory */}
        {activeTab === "alumni" && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Alumni Directory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumniDirectory.map((alumni) => (
                <AlumniCard
                  key={alumni.id}
                  name={alumni.name}
                  graduationYear={alumni.graduationYear}
                  company={alumni.company}
                  role={alumni.role}
                  linkedinUrl={alumni.linkedinUrl}
                />
              ))}
            </div>
          </div>
        )}
        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Profile Picture
              </h3>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-secondary/20 flex items-center justify-center overflow-hidden border-2 border-border">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      AM
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-upload" className="block">
                    Change Profile Photo
                  </Label>
                  <Input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square JPG, PNG. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Account Security
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-pass">Current Password</Label>
                  <Input id="current-pass" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pass">New Password</Label>
                  <Input id="new-pass" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pass">Confirm New Password</Label>
                  <Input id="confirm-pass" type="password" />
                </div>
                <Button
                  onClick={() => toast.success("Password updated successfully")}
                >
                  Update Password
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    onCheckedChange={(c) =>
                      toast.success(
                        `Email notifications ${c ? "enabled" : "disabled"}`
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Push Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive browser notifications
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    onCheckedChange={(c) =>
                      toast.success(
                        `Push notifications ${c ? "enabled" : "disabled"}`
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
