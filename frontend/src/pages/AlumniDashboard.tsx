import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AlumniCard from "@/components/cards/AlumniCard";
import StatCard from "@/components/cards/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { alumniDirectory } from "@/data/dummyData";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Search,
  Settings,
  Shield,
  Lock,
  Eye,
  BarChart3,
  TrendingUp,
  Award,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PlacementAnalyticsCharts from "@/components/charts/PlacementAnalyticsCharts";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHigherStudies, setIsHigherStudies] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Stats State
  const [stats, setStats] = useState({
      placed: 0,
      totalEligible: 0,
      percentage: 0,
      higherStudies: 0
  });
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const recordsRef = collection(db, "placement_stats_yearly");
              const snapshot = await getDocs(recordsRef);
              const data = snapshot.docs.map(doc => doc.data());
              
              if (data.length === 0) return;

              // Store full data and available years
              const years = Array.from(new Set(data.map((d: any) => d.year))).sort();
              setAvailableYears(years);
              setAnalyticsData(data);

              // Filter Data based on selectedYear
              let filteredData = data;
              if (selectedYear !== "All Years") {
                   filteredData = data.filter((d: any) => d.year === selectedYear);
              }

              const placedCount = filteredData.reduce((acc, curr: any) => acc + (Number(curr.placed) || 0), 0);
              const higherStudiesCount = filteredData.reduce((acc, curr: any) => acc + (Number(curr.higherStudies) || 0), 0);
              const totalEligible = filteredData.reduce((acc, curr: any) => acc + (Number(curr.eligible) || 0), 0);
              
              setStats({
                  placed: placedCount,
                  totalEligible: totalEligible,
                  percentage: totalEligible > 0 ? Math.round((placedCount / totalEligible) * 100) : 0,
                  higherStudies: higherStudiesCount
              });
          } catch (error) {
              console.error("Error fetching stats:", error);
          }
      };

      if (activeTab === "statistics") {
        fetchStats();
      }
  }, [activeTab, selectedYear]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    {
      value: "profile",
      label: "My Profile",
      icon: <UserCircle className="h-4 w-4" />,
    },
    {
      value: "directory",
      label: "Alumni Directory",
      icon: <Users className="h-4 w-4" />,
    },
    {
      value: "statistics",
      label: "Placement Stats",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      value: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const filteredAlumni = alumniDirectory.filter(
    (alumni) =>
      alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      role="alumni"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alumni Portal</h1>
          <p className="text-muted-foreground">
            Update your profile and connect with fellow alumni
          </p>
        </div>

        {/* Profile Form */}
        {activeTab === "profile" && (
          <div className="form-section max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Update Your Profile
            </h2>
            <form className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-secondary/20 border-2 border-border flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full max-w-xs"
                    id="profile-upload"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    defaultValue="Rahul Sharma"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    placeholder="e.g., 2023"
                    defaultValue="2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Current Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Microsoft"
                    defaultValue="Microsoft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Job Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Software Engineer"
                    defaultValue="Software Engineer"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    defaultValue="https://linkedin.com/in/rahul-sharma"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    defaultValue="rahul.sharma@microsoft.com"
                  />
                </div>
              </div>

              {/* Higher Studies Section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Persued Higher Studies (MS)?
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable this if you have persued a Master's
                      degree
                    </p>
                  </div>
                  <Switch
                    checked={isHigherStudies}
                    onCheckedChange={setIsHigherStudies}
                  />
                </div>

                {isHigherStudies && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="university_name">University Name</Label>
                      <Input
                        id="university_name"
                        placeholder="e.g. Stanford University"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student_id_card">Student ID Card</Label>
                      <Input id="student_id_card" type="file" accept=".pdf,.jpg,.png" />
                      <p className="text-xs text-muted-foreground">Upload your student ID card for verification</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="admit_card">
                        Admit Card / Offer Letter
                      </Label>
                      <Input
                        id="admit_card"
                        type="file"
                        accept=".pdf,.jpg,.png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your admit card or offer letter for verification
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit">Update Profile</Button>
                <Button type="button" variant="outline">
                  Reset Changes
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Alumni Directory */}
        {activeTab === "directory" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alumni by name, company, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((alumni) => (
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

            {filteredAlumni.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No alumni found matching your search.
                </p>
              </div>
            )}
          </div>
        )}
        {/* Statistics Tab */}
        {activeTab === "statistics" && (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-1">
                            Placement Statistics
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Overall department performance
                        </p>
                    </div>
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
                        title="Total Students Placed"
                        value={stats.placed}
                        subtitle={`Out of ${stats.totalEligible} registered`}
                        icon={<Users className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${stats.percentage}%`}
                        subtitle="Placement Rate"
                        icon={<TrendingUp className="h-6 w-6" />}
                        trend={{ value: "Aggregated", positive: true }}
                    />
                    <StatCard
                        title="Higher Studies"
                        value={stats.higherStudies}
                        subtitle="Pursued Masters/PhD"
                        icon={<Award className="h-6 w-6" />}
                    />
                </div>
                <div className="mt-6">
                    <PlacementAnalyticsCharts 
                        data={analyticsData} // Pass full data
                        selectedYear={selectedYear}
                        availableYears={availableYears}
                    />
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
                Manage privacy and account details
              </p>
            </div>

            {/* Privacy Settings */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4" /> Privacy Controls
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Public Profile
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Allow students to view your profile
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    onCheckedChange={(c) =>
                      toast.success(
                        `Profile visibility ${c ? "enabled" : "disabled"}`
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Show Contact Info
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Display email on directory listing
                    </p>
                  </div>
                  <Switch
                    onCheckedChange={(c) =>
                      toast.success(`Contact info ${c ? "visible" : "hidden"}`)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Security
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alumni-pass">Change Password</Label>
                  <Input
                    id="alumni-pass"
                    type="password"
                    placeholder="New Password"
                  />
                </div>
                <Button onClick={() => toast.success("Password updated")}>
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

export default AlumniDashboard;
