import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AlumniCard from "@/components/cards/AlumniCard";
import StatCard from "@/components/cards/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { examTypes, currencies } from "@/data/dummyData";
import { useAlumni, useMyAlumniProfile, useCreateAlumniProfile, useUpdateAlumniProfile } from "@/hooks/useAlumni";
import { useAuth } from "@/contexts/AuthContext";
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
import { api } from "@/services/api.service";

const AlumniDashboard = () => {
  // Hooks
  const { userData } = useAuth();
  const { data: alumniDirectory = [], isLoading: alumniLoading } = useAlumni();
  const { data: myProfile, isLoading: profileLoading } = useMyAlumniProfile();
  const createProfile = useCreateAlumniProfile();
  const updateProfile = useUpdateAlumniProfile();

  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHigherStudies, setIsHigherStudies] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    graduationYear: "",
    company: "",
    role: "",
    linkedinUrl: "",
    email: "",
    isPublic: true,
    // Higher Studies fields
    isHigherStudies: false,
    higherStudiesUniversity: "",
    higherStudiesProgram: "",
    higherStudiesCountry: "",
    lorFacultyName: "",
  });
  
  // File upload states
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [admitCardFile, setAdmitCardFile] = useState<File | null>(null);
  const [lorFile, setLorFile] = useState<File | null>(null);

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
      // Set file for upload
      setProfilePhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load existing profile data when available
  useEffect(() => {
    if (myProfile) {
      setFormData({
        name: myProfile.name,
        graduationYear: myProfile.graduationYear,
        company: myProfile.company,
        role: myProfile.role,
        linkedinUrl: myProfile.linkedinUrl || "",
        email: userData?.email || "",
        isPublic: myProfile.isPublic !== undefined ? myProfile.isPublic : true,
        // Higher Studies fields
        isHigherStudies: myProfile.isHigherStudies || false,
        higherStudiesUniversity: myProfile.higherStudiesUniversity || "",
        higherStudiesProgram: myProfile.higherStudiesProgram || "",
        higherStudiesCountry: myProfile.higherStudiesCountry || "",
        lorFacultyName: myProfile.lorFacultyName || "",
      });
    } else if (userData) {
      // Pre-fill with user data
      setFormData(prev => ({
        ...prev,
        name: userData.name || "",
        email: userData.email || "",
      }));
    }
  }, [myProfile, userData]);

  // Handle form submission with file uploads
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('=== STARTING FORM SUBMISSION ===');
      
      const fileUrls: any = {};
      
      // Upload files to Firebase Storage via PHP API
      toast.info("Uploading files...");
      
      // Upload profile photo
      if (profilePhotoFile) {
        console.log('Uploading profile photo...');
        try {
          const response = await api.upload.uploadProfilePhoto(profilePhotoFile);
          fileUrls.profilePhotoUrl = response.data.file.url;
          console.log('Profile photo uploaded:', fileUrls.profilePhotoUrl);
        } catch (err) {
          console.error('Profile photo upload failed:', err);
          toast.error('Failed to upload profile photo');
        }
      }
      
      // Upload student ID
      if (studentIdFile) {
        console.log('Uploading student ID...');
        try {
          const response = await api.upload.uploadDocument(studentIdFile);
          fileUrls.studentIdCardUrl = response.data.file.url;
          console.log('Student ID uploaded:', fileUrls.studentIdCardUrl);
        } catch (err) {
          console.error('Student ID upload failed:', err);
          toast.error('Failed to upload student ID');
        }
      }
      
      // Upload admit card
      if (admitCardFile) {
        console.log('Uploading admit card...');
        try {
          const response = await api.upload.uploadDocument(admitCardFile);
          fileUrls.admitCardUrl = response.data.file.url;
          console.log('Admit card uploaded:', fileUrls.admitCardUrl);
        } catch (err) {
          console.error('Admit card upload failed:', err);
          toast.error('Failed to upload admit card');
        }
      }
      
      // Upload LOR
      if (lorFile) {
        console.log('Uploading LOR...');
        try {
          const response = await api.upload.uploadDocument(lorFile);
          fileUrls.lorDocumentUrl = response.data.file.url;
          console.log('LOR uploaded:', fileUrls.lorDocumentUrl);
        } catch (err) {
          console.error('LOR upload failed:', err);
          toast.error('Failed to upload LOR');
        }
      }
      
      console.log('Preparing profile data...');
      
      // Prepare profile data
      const profileData: any = {
        name: formData.name,
        graduationYear: formData.graduationYear,
        company: formData.company,
        role: formData.role,
        linkedinUrl: formData.linkedinUrl || '',
        email: userData?.email || '',
        isPublic: formData.isPublic,
        userId: userData?.uid || "unknown",
        ...fileUrls,
      };
      
      // Add Higher Studies fields if enabled
      if (formData.isHigherStudies) {
        profileData.isHigherStudies = true;
        profileData.higherStudiesUniversity = formData.higherStudiesUniversity;
        profileData.higherStudiesProgram = formData.higherStudiesProgram;
        profileData.higherStudiesCountry = formData.higherStudiesCountry;
        profileData.lorFacultyName = formData.lorFacultyName;
      } else {
        profileData.isHigherStudies = false;
      }
      
      // Filter out empty values
      const cleanedData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined && value !== '')
      );
      
      console.log('Submitting to API:', cleanedData);
      
      if (myProfile?.id) {
        // Update existing profile
        console.log('Updating profile ID:', myProfile.id);
        await updateProfile.mutateAsync({ id: myProfile.id, data: cleanedData });
        toast.success("Profile updated successfully!");
      } else {
        // Create new profile
        console.log('Creating new profile');
        await createProfile.mutateAsync(cleanedData);
        toast.success("Profile created successfully!");
      }
      
      // Clear file states after successful upload
      setProfilePhotoFile(null);
      setStudentIdFile(null);
      setAdmitCardFile(null);
      setLorFile(null);
      
      console.log('=== FORM SUBMISSION COMPLETE ===');
      
    } catch (error: any) {
      console.error('=== PROFILE SAVE ERROR ===', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save profile';
      toast.error(`Error: ${errorMessage}`);
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
      value: "competitive-exams",
      label: "Competitive Exams",
      icon: <Award className="h-4 w-4" />,
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
              {myProfile ? "Update Your Profile" : "Create Your Profile"}
            </h2>
            
            {profileLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading profile...</p>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      placeholder="e.g., 2023"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Current Company</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Microsoft"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Job Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Software Engineer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/your-profile"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled
                    />
                  </div>
                </div>

              {/* Higher Studies Section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Pursuing Higher Studies (MS)?
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable this if you are pursuing a Master's degree
                    </p>
                  </div>
                  <Switch
                    checked={formData.isHigherStudies}
                    onCheckedChange={(checked) => setFormData({ ...formData, isHigherStudies: checked })}
                  />
                </div>

                {formData.isHigherStudies && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="higherStudiesUniversity">University Name</Label>
                      <Input
                        id="higherStudiesUniversity"
                        placeholder="e.g. Stanford University"
                        value={formData.higherStudiesUniversity}
                        onChange={(e) => setFormData({ ...formData, higherStudiesUniversity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="higherStudiesProgram">Program/Degree</Label>
                      <Input
                        id="higherStudiesProgram"
                        placeholder="e.g. MS in Computer Science"
                        value={formData.higherStudiesProgram}
                        onChange={(e) => setFormData({ ...formData, higherStudiesProgram: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="higherStudiesCountry">Country</Label>
                      <Input
                        id="higherStudiesCountry"
                        placeholder="e.g. United States"
                        value={formData.higherStudiesCountry}
                        onChange={(e) => setFormData({ ...formData, higherStudiesCountry: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentIdFile">Student ID Card</Label>
                      <Input 
                        id="studentIdFile" 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => setStudentIdFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">Upload your student ID card</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="admitCardFile">
                        Admit Card / Offer Letter
                      </Label>
                      <Input
                        id="admitCardFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setAdmitCardFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your admit card or offer letter
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lorFacultyName">LOR - Faculty Name</Label>
                      <Input
                        id="lorFacultyName"
                        placeholder="Name of faculty who issued LOR"
                        value={formData.lorFacultyName}
                        onChange={(e) => setFormData({ ...formData, lorFacultyName: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Faculty member who provided Letter of Recommendation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lorFile">Upload LOR Document</Label>
                      <Input
                        id="lorFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setLorFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your Letter of Recommendation (PDF preferred)
                      </p>
                    </div>
                  </div>
                )}
                
                {!formData.isHigherStudies && (
                  <p className="text-sm text-muted-foreground italic py-2">
                    Not pursuing higher studies
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={createProfile.isPending || updateProfile.isPending}>
                  {createProfile.isPending || updateProfile.isPending ? "Saving..." : myProfile ? "Update Profile" : "Create Profile"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => myProfile && setFormData({
                    name: myProfile.name,
                    graduationYear: myProfile.graduationYear,
                    company: myProfile.company,
                    role: myProfile.role,
                    linkedinUrl: myProfile.linkedinUrl || "",
                    email: userData?.email || "",
                    isPublic: myProfile.isPublic !== undefined ? myProfile.isPublic : true,
                    isHigherStudies: myProfile.isHigherStudies || false,
                    higherStudiesUniversity: myProfile.higherStudiesUniversity || "",
                    higherStudiesProgram: myProfile.higherStudiesProgram || "",
                    higherStudiesCountry: myProfile.higherStudiesCountry || "",
                    lorFacultyName: myProfile.lorFacultyName || "",
                  })}
                >
                  Reset Changes
                </Button>
              </div>
            </form>
            )}
          </div>
        )}

        {/* Competitive Exams Tab */}
        {activeTab === "competitive-exams" && (
          <div className="form-section max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Competitive Exam Scores
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add your competitive exam scores (GRE/TOEFL/GATE/CAT/IELTS/GMAT)
            </p>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alumni_exam_type">Exam Type</Label>
                  <select
                    id="alumni_exam_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select exam type</option>
                    {examTypes.map((exam) => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni_exam_score">Score/Percentile</Label>
                  <Input
                    id="alumni_exam_score"
                    placeholder="e.g., 320 or 99.5%"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni_exam_date">Exam Date</Label>
                  <Input id="alumni_exam_date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni_exam_validity">Valid Until</Label>
                  <Input id="alumni_exam_validity" type="date" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alumni_score_report">Score Report (Optional)</Label>
                  <Input
                    id="alumni_score_report"
                    type="file"
                    accept=".pdf,.jpg,.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your official score report
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit">Add Exam Score</Button>
                <Button type="button" variant="outline">
                  Clear Form
                </Button>
              </div>
            </form>

            {/* Display existing exam scores */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                My Exam Scores
              </h3>
              <div className="space-y-3">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-foreground">GRE</h4>
                      <p className="text-sm text-muted-foreground">Score: 320</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Date: 15 May 2024 • Valid until: 15 May 2029
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-foreground">TOEFL</h4>
                      <p className="text-sm text-muted-foreground">Score: 110</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Date: 20 Jun 2024 • Valid until: 20 Jun 2026
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
