import { Linkedin, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlumniCardProps {
  name: string;
  graduationYear: string;
  company: string;
  role: string;
  linkedinUrl?: string;
}

const AlumniCard = ({
  name,
  graduationYear,
  company,
  role,
  linkedinUrl,
}: AlumniCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-xl">
            {name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg truncate">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <GraduationCap className="h-4 w-4" />
            <span>Batch {graduationYear}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Briefcase className="h-4 w-4" />
            <span className="truncate">{role} at {company}</span>
          </div>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn Profile
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniCard;
