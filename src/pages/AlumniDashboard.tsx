import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AlumniCard from "@/components/cards/AlumniCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { alumniDirectory } from "@/data/dummyData";
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Search,
} from "lucide-react";

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { path: "#profile", label: "My Profile", icon: <UserCircle className="h-4 w-4" /> },
    { path: "#directory", label: "Alumni Directory", icon: <Users className="h-4 w-4" /> },
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
      navItems={navItems.map((item) => ({
        ...item,
        path: `/dashboard/alumni${item.path}`,
      }))}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alumni Portal</h1>
          <p className="text-muted-foreground">
            Update your profile and connect with fellow alumni
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {["profile", "directory"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
            >
              {tab === "profile" ? "My Profile" : "Alumni Directory"}
            </Button>
          ))}
        </div>

        {/* Profile Form */}
        {activeTab === "profile" && (
          <div className="form-section max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Update Your Profile
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" defaultValue="Rahul Sharma" />
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
      </div>
    </DashboardLayout>
  );
};

export default AlumniDashboard;
