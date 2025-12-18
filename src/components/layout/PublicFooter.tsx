import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container-narrow section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* College Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-foreground/10 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">ABC Institute of Technology</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Established 1985
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Committed to excellence in engineering education and producing 
              industry-ready professionals through comprehensive training and 
              placement programs.
            </p>
          </div>

          {/* Department Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Department of Computer Engineering</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary-foreground/70" />
                <span className="text-primary-foreground/80">
                  Main Campus, Block A, Room 301<br />
                  Technology Avenue, City - 400001
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-foreground/70" />
                <span className="text-primary-foreground/80">+91 22 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-foreground/70" />
                <span className="text-primary-foreground/80">tpo@abctech.edu.in</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  College Website
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Department Portal
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Placement Brochure
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact TPO
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
          <p>© 2024 ABC Institute of Technology. All rights reserved.</p>
          <p className="mt-1">Placement & Internship Information System - Computer Engineering Department</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
