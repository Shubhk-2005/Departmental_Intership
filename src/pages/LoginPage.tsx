import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, User, Lock } from "lucide-react";

const LoginPage = () => {
  const { role } = useParams<{ role: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const roleConfig = {
    admin: {
      title: "Admin Login",
      description: "Access the administrative dashboard",
      placeholder: "admin@abctech.edu.in",
      dashboardPath: "/dashboard/admin",
    },
    student: {
      title: "Student Login",
      description: "Access your student dashboard",
      placeholder: "rollnumber@student.abctech.edu.in",
      dashboardPath: "/dashboard/student",
    },
    alumni: {
      title: "Alumni Login",
      description: "Access the alumni portal",
      placeholder: "alumni@abctech.edu.in",
      dashboardPath: "/dashboard/alumni",
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to dashboard (no actual auth)
    window.location.href = config.dashboardPath;
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Header */}
      <header className="bg-primary py-4">
        <div className="container-narrow section-padding flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary-foreground/10 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-primary-foreground font-semibold">T&P Portal</span>
          </Link>
          <Link to="/">
            <Button variant="nav" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {config.description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {role === "student" ? "Roll Number / Email" : "Email Address"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="text"
                    placeholder={config.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Login
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Department of Computer Engineering<br />
            ABC Institute of Technology
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
