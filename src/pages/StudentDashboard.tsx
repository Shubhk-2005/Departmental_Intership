import { useState } from "react";
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
  placementStats,
  internships,
  alumniDirectory,
  companies,
  domains,
  internshipStatuses,
} from "@/data/dummyData";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Building2,
} from "lucide-react";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);

  const navItems = [
    { path: "#overview", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { path: "#add-internship", label: "Add Internship", icon: <PlusCircle className="h-4 w-4" /> },
    { path: "#view-internships", label: "View Internships", icon: <List className="h-4 w-4" /> },
    { path: "#statistics", label: "Placement Stats", icon: <BarChart3 className="h-4 w-4" /> },
    { path: "#alumni", label: "Alumni Directory", icon: <Users className="h-4 w-4" /> },
  ];

  // Simple navigation via state
  const handleNavClick = (tab: string) => {
    setActiveTab(tab.replace("#", ""));
  };

  return (
    <DashboardLayout
      role="student"
      navItems={navItems.map((item) => ({
        ...item,
        path: `/dashboard/student${item.path}`,
      }))}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, Student</h1>
          <p className="text-muted-foreground">
            Manage your internships and view placement statistics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {["overview", "add-internship", "view-internships", "statistics", "alumni"].map(
            (tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => handleNavClick(tab)}
              >
                {tab
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Button>
            )
          )}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Students Placed"
              value={placementStats.placedStudents}
              subtitle={`Out of ${placementStats.totalStudents}`}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Placement Rate"
              value={`${placementStats.placementPercentage}%`}
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

        {/* Add Internship Form */}
        {activeTab === "add-internship" && (
          <div className="form-section max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Add New Internship
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" placeholder="e.g., 3 months" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select>
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
              </div>
              <div className="flex gap-3">
                <Button type="submit">Submit Internship</Button>
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
              My Internships
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
                      Domain
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {internships.slice(0, 3).map((intern) => (
                    <tr
                      key={intern.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 px-4 text-foreground">{intern.company}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {intern.role}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {intern.domain}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {intern.duration}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Placed"
              value={placementStats.placedStudents}
              subtitle={`${placementStats.placementPercentage}% placement rate`}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Highest Package"
              value={placementStats.highestPackage}
              subtitle="Top offer this year"
              icon={<Award className="h-6 w-6" />}
            />
            <StatCard
              title="Average Package"
              value={placementStats.averagePackage}
              subtitle="Across all placements"
              icon={<TrendingUp className="h-6 w-6" />}
            />
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
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
