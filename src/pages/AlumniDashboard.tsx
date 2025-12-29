import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AlumniCard from "@/components/cards/AlumniCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { alumniDirectory } from "@/data/dummyData";
import {
  UserCircle,
  Users,
  Search,
  Settings,
  Eye,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  const [isPursuingHigherStudies, setIsPursuingHigherStudies] =
    useState<"yes" | "no" | "">("");

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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Alumni Portal</h1>
          <p className="text-muted-foreground">
            Update your profile and stay connected with the institution
          </p>
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Update Your Profile</h2>

            <form className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter your full name" />
                </div>

                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input placeholder="e.g., 2023" />
                </div>

                <div className="space-y-2">
                  <Label>Current Company</Label>
                  <Input placeholder="e.g., Google" />
                </div>

                <div className="space-y-2">
                  <Label>Job Role</Label>
                  <Input placeholder="e.g., Software Engineer" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>LinkedIn Profile URL</Label>
                  <Input placeholder="https://linkedin.com/in/username" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="your.email@example.com" />
                </div>
              </div>

              {/* Higher Education Section */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  Higher Education Details
                </h3>

                <div className="space-y-2">
                  <Label>Are you currently pursuing higher education?</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={isPursuingHigherStudies}
                    onChange={(e) =>
                      setIsPursuingHigherStudies(
                        e.target.value as "yes" | "no"
                      )
                    }
                  >
                    <option value="">Select an option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {isPursuingHigherStudies === "yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>University / Institution Name</Label>
                      <Input placeholder="Enter institution name" />
                    </div>

                    <div className="space-y-2">
                      <Label>Program / Course Name</Label>
                      <Input placeholder="e.g., M.Tech in AI" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID Card (Upload)</Label>
                      <Input
                        id="studentId"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="file-input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a clear copy of your university ID card (PDF, JPG, or PNG)
                      </p>
                    </div>


                    <div className="space-y-2">
                      <Label>Expected Graduation Year</Label>
                      <Input placeholder="e.g., 2026" />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="submit">Update Profile</Button>
                <Button variant="outline" type="button">
                  Reset
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* DIRECTORY TAB */}
        {activeTab === "directory" && (
          <div>
            <div className="mb-6 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search alumni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((alumni) => (
                <AlumniCard key={alumni.id} {...alumni} />
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-semibold">Settings</h2>

            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" /> Privacy Controls
              </h3>

              <div className="flex justify-between items-center">
                <p>Public Profile</p>
                <Switch
                  defaultChecked
                  onCheckedChange={(c) =>
                    toast.success(`Profile ${c ? "enabled" : "disabled"}`)
                  }
                />
              </div>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" /> Security
              </h3>

              <Input type="password" placeholder="New Password" />
              <Button onClick={() => toast.success("Password updated")}>
                Update Password
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AlumniDashboard;
