import { Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  batch: string;
  testimonial: string;
  imageUrl?: string;
}

const TestimonialCard = ({
  name,
  role,
  company,
  batch,
  testimonial,
}: TestimonialCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
          <Quote className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-foreground/80 text-sm leading-relaxed mb-4 italic">
            "{testimonial}"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{name}</p>
              <p className="text-muted-foreground text-xs">
                {role} at {company} • Batch {batch}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
