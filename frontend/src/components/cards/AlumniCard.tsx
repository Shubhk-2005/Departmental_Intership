import { Linkedin, Briefcase, GraduationCap, Mail, Eye, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AlumniCardProps {
  name: string;
  graduationYear: string;
  company: string;
  role: string;
  linkedinUrl?: string;
  email?: string;
}

const AlumniCard = ({
  name,
  graduationYear,
  company,
  role,
  linkedinUrl,
  email,
}: AlumniCardProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
              <span className="text-primary font-bold text-xl">
                {name?.charAt(0) || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg truncate">{name || "Unknown"}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <GraduationCap className="h-4 w-4" />
                <span>Batch {graduationYear || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Briefcase className="h-4 w-4" />
                <span className="truncate">{role || "N/A"} {company && `at ${company}`}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-4 w-4" />
                <span>Click to view full profile</span>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {name?.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <div>{name || "Unknown"}</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Alumni Profile
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Personal Information Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{name || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{graduationYear || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {email ? (
                    <a href={`mailto:${email}`} className="hover:text-primary transition-colors hover:underline">
                      {email}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">LinkedIn Profile</label>
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  {linkedinUrl ? (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      View Profile
                    </a>
                  ) : (
                    <span className="text-foreground">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">Professional Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Current Company</label>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{company || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Current Role</label>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{role || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {linkedinUrl && (
            <div className="pt-4 border-t">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full"
              >
                <Button className="w-full gap-2" size="lg">
                  <Linkedin className="h-5 w-5" />
                  Connect on LinkedIn
                </Button>
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlumniCard;
