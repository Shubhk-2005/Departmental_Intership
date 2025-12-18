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
  Settings,
  Shield,
  Lock,
  Eye,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { value: "profile", label: "My Profile", icon: <UserCircle className="h-4 w-4" /> },
    { value: "directory", label: "Alumni Directory", icon: <Users className="h-4 w-4" /> },
    { value: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
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
        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Settings</h2>
              <p className="text-sm text-muted-foreground">Manage privacy and account details</p>
            </div>
            
            {/* Privacy Settings */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4" /> Privacy Controls
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Public Profile</p>
                    <p className="text-sm text-muted-foreground">Allow students to view your profile</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={(c) => toast.success(`Profile visibility ${c ? 'enabled' : 'disabled'}`)} />
                </div>
                 <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Show Contact Info</p>
                    <p className="text-sm text-muted-foreground">Display email on directory listing</p>
                  </div>
                  <Switch onCheckedChange={(c) => toast.success(`Contact info ${c ? 'visible' : 'hidden'}`)} />
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
                  <Input id="alumni-pass" type="password" placeholder="New Password" />
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
