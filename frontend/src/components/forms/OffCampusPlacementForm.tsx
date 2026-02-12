import { useState } from "react";
import { useCreateOffCampusPlacement } from "@/hooks/useOffCampusPlacements";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface OffCampusPlacementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alumniName: string;
  graduationYear: string;
}

export function OffCampusPlacementForm({
  open,
  onOpenChange,
  alumniName,
  graduationYear,
}: OffCampusPlacementFormProps) {
  const createPlacement = useCreateOffCampusPlacement();

  const [formData, setFormData] = useState({
    companyName: "",
    companyLocation: "",
    jobRole: "",
    package: "",
    joiningDate: "",
    employmentType: "Full-time",
  });

  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload JPG, PNG, or PDF.");
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }

      setIdCardFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdCardPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setIdCardPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setIdCardFile(null);
    setIdCardPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCardFile) {
      toast.error("Please upload your company ID card");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("alumniName", alumniName);
      formDataToSend.append("graduationYear", graduationYear);
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("companyLocation", formData.companyLocation);
      formDataToSend.append("jobRole", formData.jobRole);
      formDataToSend.append("package", formData.package || "");
      formDataToSend.append("joiningDate", formData.joiningDate);
      formDataToSend.append("employmentType", formData.employmentType);
      formDataToSend.append("companyIdCard", idCardFile);

      await createPlacement.mutateAsync(formDataToSend);

      toast.success("Off-campus placement added successfully!");
      
      // Reset form
      setFormData({
        companyName: "",
        companyLocation: "",
        jobRole: "",
        package: "",
        joiningDate: "",
        employmentType: "Full-time",
      });
      setIdCardFile(null);
      setIdCardPreview(null);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit placement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Off-Campus Placement</DialogTitle>
          <DialogDescription>
            Share your off-campus placement details to help track alumni success.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
                placeholder="e.g., Google, Microsoft"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyLocation">
                Company Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyLocation"
                value={formData.companyLocation}
                onChange={(e) =>
                  setFormData({ ...formData, companyLocation: e.target.value })
                }
                required
                placeholder="e.g., Bangalore, Mumbai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobRole">
              Job Role/Position <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobRole"
              value={formData.jobRole}
              onChange={(e) =>
                setFormData({ ...formData, jobRole: e.target.value })
              }
              required
              placeholder="e.g., Software Engineer, Data Analyst"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="package">Package/Salary (LPA)</Label>
              <Input
                id="package"
                type="number"
                step="0.1"
                value={formData.package}
                onChange={(e) =>
                  setFormData({ ...formData, package: e.target.value })
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joiningDate">
                Joining Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData({ ...formData, joiningDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">
              Employment Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) =>
                setFormData({ ...formData, employmentType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idCard">
              Company ID Card <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Upload your company ID card (JPG, PNG, or PDF, max 5MB)
            </p>

            {!idCardFile ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  id="idCard"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <Label
                  htmlFor="idCard"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Click to upload ID card
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG, or PDF (max 5MB)
                  </span>
                </Label>
              </div>
            ) : (
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {idCardPreview ? (
                    <img
                      src={idCardPreview}
                      alt="ID Card Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {idCardFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(idCardFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPlacement.isPending}>
              {createPlacement.isPending ? "Submitting..." : "Submit Placement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
