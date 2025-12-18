import { Mail, Phone } from "lucide-react";

interface TeamMemberCardProps {
  name: string;
  designation: string;
  email: string;
  phone?: string;
  imageUrl?: string;
}

const TeamMemberCard = ({
  name,
  designation,
  email,
  phone,
}: TeamMemberCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm text-center">
      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
        <span className="text-primary font-bold text-2xl">
          {name.charAt(0)}
        </span>
      </div>
      <h3 className="font-semibold text-foreground text-lg">{name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{designation}</p>
      <div className="space-y-2">
        <a
          href={`mailto:${email}`}
          className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
        >
          <Mail className="h-4 w-4" />
          {email}
        </a>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Phone className="h-4 w-4" />
            {phone}
          </a>
        )}
      </div>
    </div>
  );
};

export default TeamMemberCard;
