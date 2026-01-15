import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import AlumniCard from "@/components/cards/AlumniCard";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  GraduationCap,
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
import { useAlumni } from "@/hooks/useAlumni";
import { MessageSquare, Trash2, FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { PlacementRecordsTab } from "@/components/admin/PlacementRecordsTab";
import PlacementAnalyticsCharts from "@/components/charts/PlacementAnalyticsCharts";
import { db, auth } from "@/lib/firebase"; // Ensure auth is imported
import { collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";
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

// Competitive Exams Tab Component
// Competitive Exams Tab Component
const CompetitiveExamsTab = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all exams (admin view)
    const q = query(
      collection(db, "competitive_exams"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExams(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteDoc(doc(db, "competitive_exams", id));
      toast.success("Record deleted");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const studentExams = exams.filter(exam => exam.role === 'student');
  const alumniExams = exams.filter(exam => exam.role === 'alumni');

  const ExamTable = ({ title, data }: { title: string, data: any[] }) => (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm mb-6">
      <h3 className="font-semibold text-foreground mb-4">
        {title} ({data.length})
      </h3>
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Exam Type</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Score</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Exam Date</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Valid Until</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((exam) => (
                <tr key={exam.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm text-foreground font-medium">{exam.studentName}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{exam.examType}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{exam.score}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{exam.examDate}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{exam.validityPeriod}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleDelete(exam.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
          No {title.toLowerCase()} found.
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Competitive Exam Scores
        </h2>
      </div>

      <ExamTable title="Student Exam Records" data={studentExams} />
      <ExamTable title="Alumni Exam Records" data={alumniExams} />
    </div>
  );
};

// IMS Uploads Tab Component
const IMSUploadsTab = () => {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pendingFileData, setPendingFileData] = useState<any[]>([]);

  // Fetch existing IMS data from Firestore
  useEffect(() => {
    const fetchIMSData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ims_internships"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUploadedData(data);
      } catch (error) {
        console.error("Error fetching IMS data:", error);
        toast.error("Failed to load IMS data");
      }
    };
    fetchIMSData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setIsUploading(true);
    toast.info("Processing Excel file...");

    try {
      const reader = new FileReader();

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error("Failed to read file");
        setIsUploading(false);
      };

      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          // Validate required fields
          const requiredFields = [
            'Academic Year', 'Student Name', 'Roll Number', 'Branch',
            'Division', 'Year of Study', 'Number of Days of Internship',
            'Internship Start Date', 'Internship End Date', 'Organization Name',
            'Organization Address', 'Internship Report', 'Internship Completion Certificate'
          ];

          if (data.length === 0) {
            toast.error("Excel file is empty");
            setIsUploading(false);
            return;
          }

          const firstRow: any = data[0];
          const actualColumns = Object.keys(firstRow);

          // Normalize function to handle case-insensitive and whitespace trimming
          const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');

          // Check for missing fields with normalized comparison
          const normalizedActualColumns = actualColumns.map(normalize);
          const missingFields = requiredFields.filter(field =>
            !normalizedActualColumns.includes(normalize(field))
          );

          if (missingFields.length > 0) {
            console.log('Required fields:', requiredFields);
            console.log('Actual columns found:', actualColumns);
            toast.error(`Missing required fields: ${missingFields.join(', ')}. Found columns: ${actualColumns.slice(0, 5).join(', ')}...`);
            setIsUploading(false);
            return;
          }

          // Store parsed data and show dialog if there's existing data
          setPendingFileData(data);
          setIsUploading(false);

          if (uploadedData.length > 0) {
            setShowUploadDialog(true);
          } else {
            // No existing data, just upload directly
            await handleAddData(data);
          }

          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (parseError) {
          console.error("Error parsing Excel:", parseError);
          toast.error("Failed to parse Excel file");
          setIsUploading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      setIsUploading(false);
    }
  };

  // Replace all existing data with new data
  const handleReplaceData = async (data: any[]) => {
    setIsUploading(true);
    setShowUploadDialog(false);
    try {
      // Delete all existing records
      const deletePromises = uploadedData.map(record =>
        deleteDoc(doc(db, "ims_internships", record.id))
      );
      await Promise.all(deletePromises);

      // Add new records
      const batch: any[] = [];
      for (const record of data) {
        const docRef = await addDoc(collection(db, "ims_internships"), record);
        batch.push({ id: docRef.id, ...(record as object) });
      }

      setUploadedData(batch);
      toast.success(`Successfully replaced data with ${data.length} new records`);
    } catch (error) {
      console.error("Error replacing data:", error);
      toast.error("Failed to replace data");
    } finally {
      setIsUploading(false);
    }
  };

  // Add new data to existing data
  const handleAddData = async (data: any[]) => {
    setIsUploading(true);
    setShowUploadDialog(false);
    try {
      const batch: any[] = [];
      for (const record of data) {
        const docRef = await addDoc(collection(db, "ims_internships"), record);
        batch.push({ id: docRef.id, ...(record as object) });
      }

      setUploadedData(prev => [...batch, ...prev]);
      toast.success(`Successfully added ${data.length} new records`);
    } catch (error) {
      console.error("Error adding data:", error);
      toast.error("Failed to add data");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (uploadedData.length === 0) {
      toast.error("No data to download");
      return;
    }

    // Prepare data for Excel export
    const exportData = uploadedData.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IMS Internships");

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `IMS_Internships_${date}.xlsx`);
    toast.success("Data downloaded successfully");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "ims_internships", id));
      setUploadedData(prev => prev.filter(item => item.id !== id));
      toast.success("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  return (
    <>
      {/* Upload Mode Selection Dialog */}
      <AlertDialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Options</AlertDialogTitle>
            <AlertDialogDescription>
              You have {uploadedData.length} existing records. You are uploading {pendingFileData.length} new records.
              <br /><br />
              Would you like to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Replace All Data:</strong> Delete all existing records and upload new ones</li>
                <li><strong>Add to Existing:</strong> Keep existing records and add new ones</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowUploadDialog(false);
              setPendingFileData([]);
            }}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => handleReplaceData(pendingFileData)}
              disabled={isUploading}
            >
              Replace All Data
            </Button>
            <AlertDialogAction
              onClick={() => handleAddData(pendingFileData)}
              disabled={isUploading}
            >
              Add to Existing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-foreground">IMS Uploads</h2>
            <p className="text-sm text-muted-foreground">
              Upload and manage internship records from Excel files
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" disabled={uploadedData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4" /> Upload Excel File
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="excel-upload"
              />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-3">
                {isUploading ? "Uploading..." : "Upload Excel File"}
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                type="button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Supports .xlsx and .xls files
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">Required Excel Columns:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>• Academic Year</div>
                <div>• Student Name</div>
                <div>• Roll Number</div>
                <div>• Branch</div>
                <div>• Division</div>
                <div>• Year of Study</div>
                <div>• Number of Days of Internship</div>
                <div>• Internship Start Date</div>
                <div>• Internship End Date</div>
                <div>• Organization Name</div>
                <div>• Organization Address</div>
                <div>• Internship Report</div>
                <div>• Internship Completion Certificate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">
            Uploaded Records ({uploadedData.length})
          </h3>
          {uploadedData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Academic Year</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Roll Number</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Branch</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Organization</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Duration (Days)</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm text-foreground">{record['Academic Year']}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{record['Student Name']}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{record['Roll Number']}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{record['Branch']}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{record['Organization Name']}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{record['Number of Days of Internship']}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{record['Internship Start Date']}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{record['Internship End Date']}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              No data uploaded yet. Upload an Excel file to get started.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// IMS Reports Tab Component
const IMSReportsTab = () => {
  const [imsData, setImsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchIMSData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ims_internships"));
        const data = querySnapshot.docs.map(doc => doc.data());
        setImsData(data);
      } catch (error) {
        console.error("Error fetching IMS data:", error);
        toast.error("Failed to load IMS data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchIMSData();
  }, []);

  const downloadReport = async () => {
    if (!reportRef.current) {
      toast.error("Report not ready");
      return;
    }

    toast.info("Generating PDF report...");

    try {
      // Wait a bit for charts to fully render
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content is longer than one page, add multiple pages
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      const date = new Date().toISOString().split('T')[0];
      pdf.save(`IMS_Report_${date}.pdf`);
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("PDF Gen Error:", err);
      toast.error("Failed to generate PDF");
    }
  };

  // Calculate statistics
  const stats = {
    totalStudents: imsData.length,
    totalDays: imsData.reduce((sum, item) => sum + (Number(item['Number of Days of Internship']) || 0), 0),
    avgDays: imsData.length > 0 ? Math.round(imsData.reduce((sum, item) => sum + (Number(item['Number of Days of Internship']) || 0), 0) / imsData.length) : 0,
    uniqueBranches: new Set(imsData.map(item => item['Branch'])).size,
    uniqueOrganizations: new Set(imsData.map(item => item['Organization Name'])).size,
  };

  // Branch-wise distribution
  const branchData = Object.entries(
    imsData.reduce((acc: any, item) => {
      const branch = item['Branch'] || 'Unknown';
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {})
  ).map(([branch, count]) => ({ branch, count })).sort((a, b) => (b.count as number) - (a.count as number));

  // Year of Study distribution  
  const yearData = Object.entries(
    imsData.reduce((acc: any, item) => {
      const year = item['Year of Study'] || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {})
  ).map(([year, count]) => ({ name: year, value: count as number }));

  // Academic Year distribution
  const academicYearData = Object.entries(
    imsData.reduce((acc: any, item) => {
      const year = item['Academic Year'] || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {})
  ).map(([year, count]) => ({ year, count })).sort((a, b) => String(a.year).localeCompare(String(b.year)));

  // Top Organizations
  const organizationData = Object.entries(
    imsData.reduce((acc: any, item) => {
      const org = item['Organization Name'] || 'Unknown';
      acc[org] = (acc[org] || 0) + 1;
      return acc;
    }, {})
  ).map(([organization, count]) => ({ organization, count: count as number }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10);

  const COLORS = ["#1e3a5f", "#2d5a87", "#4a7dad", "#6b9dc7", "#8ebde0", "#a8d5f7"];

  if (isLoading) {
    return <div className="text-center py-10">Loading report data...</div>;
  }

  if (imsData.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-lg font-semibold mb-2">No Data Available</p>
        <p>Upload IMS data in the "IMS Uploads" tab to view reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">IMS Reports</h2>
          <p className="text-sm text-muted-foreground">
            Visual analytics and insights from internship management data
          </p>
        </div>
        <Button onClick={downloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF Report
        </Button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-8 bg-white p-8 rounded-lg" style={{ minWidth: '800px' }}>
        {/* Header for PDF */}
        <div className="text-center border-b-2 border-gray-300 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IMS Internship Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-gray-500 text-sm mt-1">Total Records: {imsData.length}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Total Students</p>
            <p className="text-4xl font-bold text-blue-700">{stats.totalStudents}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Total Days</p>
            <p className="text-4xl font-bold text-green-700">{stats.totalDays}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Avg Days</p>
            <p className="text-4xl font-bold text-purple-700">{stats.avgDays}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border-2 border-pink-200 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Organizations</p>
            <p className="text-4xl font-bold text-pink-700">{stats.uniqueOrganizations}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Two Column Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Academic Year Distribution */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Year Distribution</h3>
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer>
                  <BarChart data={academicYearData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fill: '#374151' }} />
                    <YAxis tick={{ fill: '#374151' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                    <Bar dataKey="count" fill="#4a7dad" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Year of Study Pie Chart */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Year of Study Distribution</h3>
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={yearData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {yearData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Organizations */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top 10 Partner Organizations</h3>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={organizationData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fill: '#374151' }} />
                  <YAxis dataKey="organization" type="category" width={140} tick={{ fill: '#374151', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                  <Bar dataKey="count" fill="#6b9dc7" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Summary Statistics</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-4 px-4 font-bold text-gray-900">Metric</th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-4 px-4 text-gray-700">Total Students Completed Internships</td>
                <td className="py-4 px-4 font-bold text-gray-900">{stats.totalStudents}</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-4 px-4 text-gray-700">Total Internship Days (Cumulative)</td>
                <td className="py-4 px-4 font-bold text-gray-900">{stats.totalDays} days</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-4 px-4 text-gray-700">Average Duration per Student</td>
                <td className="py-4 px-4 font-bold text-gray-900">{stats.avgDays} days</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-4 px-4 text-gray-700">Number of Unique Branches</td>
                <td className="py-4 px-4 font-bold text-gray-900">{stats.uniqueBranches}</td>
              </tr>
              <tr className="hover:bg-gray-100">
                <td className="py-4 px-4 text-gray-700">Number of Partner Organizations</td>
                <td className="py-4 px-4 font-bold text-gray-900">{stats.uniqueOrganizations}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm border-t-2 border-gray-300 pt-6">
          <p>This report was automatically generated by the Internship Management System</p>
          <p className="mt-1">Department of Computer Engineering</p>
        </div>
      </div>
    </div>
  );
};

// AlumniTab Component
const AlumniTab = () => {
  const { data: alumniDirectory = [], isLoading: alumniLoading } = useAlumni();
  const [alumniSearchQuery, setAlumniSearchQuery] = useState("");

  const filteredAlumni = alumniDirectory.filter(
    (alumni) =>
      alumni.name.toLowerCase().includes(alumniSearchQuery.toLowerCase()) ||
      alumni.company.toLowerCase().includes(alumniSearchQuery.toLowerCase()) ||
      alumni.role.toLowerCase().includes(alumniSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Alumni Directory</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search alumni..."
            value={alumniSearchQuery}
            onChange={(e) => setAlumniSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {alumniLoading ? (
        <div className="text-center py-10">Loading alumni data...</div>
      ) : filteredAlumni.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
          No alumni found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlumni.map((alumni) => (
            <AlumniCard key={alumni.id} {...alumni} />
          ))}
        </div>
      )}
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

        const years = Array.from(new Set(data.map((d: any) => d.year))).sort();
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
      label: "Placement Stats",
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
      value: "alumni",
      label: "Alumni Directory",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      value: "placement-records",
      label: "Placement Records",
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
    {
      value: "competitive-exams",
      label: "Competitive Exams",
      icon: <Award className="h-4 w-4" />,
    },
    {
      value: "ims-uploads",
      label: "IMS Uploads",
      icon: <Upload className="h-4 w-4" />,
    },
    {
      value: "ims-reports",
      label: "IMS Reports",
      icon: <BarChart3 className="h-4 w-4" />,
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
    if (!data) return [];
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

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm border-t-2 border-gray-300 pt-6 mt-8">
                <p>This report was automatically generated by the Internship Management System</p>
                <p className="mt-1">Department of Computer Engineering</p>
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
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${intern.status === "Completed"
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

        {/* Alumni Directory Tab */}
        {activeTab === "alumni" && <AlumniTab />}

        {/* Placement Records Tab */}
        {activeTab === "placement-records" && <PlacementRecordsTab />}

        {/* Competitive Exams Tab */}
        {activeTab === "competitive-exams" && <CompetitiveExamsTab />}

        {/* IMS Uploads Tab */}
        {activeTab === "ims-uploads" && <IMSUploadsTab />}

        {/* IMS Reports Tab */}
        {activeTab === "ims-reports" && <IMSReportsTab />}

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