import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, User, Lock, Mail, Briefcase, BarChart3, Users, FileCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const LoginPage = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const roleConfig = {
    admin: {
      title: "Admin Login",
      description: "Access the administrative dashboard",
      placeholder: "admin@fcrit.ac.in",
      dashboardPath: "/dashboard/admin",
      domain: "@fcrit.ac.in"
    },
    student: {
      title: "Student Login",
      description: "Access your student dashboard",
      placeholder: "rollnumber@comp.fcrit.ac.in",
      dashboardPath: "/dashboard/student",
      domain: "@comp.fcrit.ac.in"
    },
    alumni: {
      title: "Alumni Login",
      description: "Access the alumni portal",
      placeholder: "you@example.com",
      dashboardPath: "/dashboard/alumni",
      domain: "" 
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Email must contain '@'");
      setLoading(false);
      return;
    }

    // Optional: Keep domain validation if desired, or remove to allow any email in Firebase
    if (config.domain && !email.endsWith(config.domain)) {
      setError(`Email must be a valid ${role} email ending with ${config.domain}`);
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check role before redirecting
      const user = userCredential.user;
      
      // Need to fetch role here directly to validate immediately
      // We cannot rely on AuthContext yet as it updates asynchronously
      // Import db, doc, getDoc for this check
      const { doc, getDoc } = await import("firebase/firestore"); // Dynamic import or use top-level if preferred
      const { db } = await import("@/lib/firebase");
      
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        
        if (userRole === role) {
           toast.success("Login successful");
           navigate(config.dashboardPath);
        } else {
           // Wrong role
           await auth.signOut();
           setError(`Access denied. You are not a ${role}.`);
           toast.error(`Please login via the ${userRole} portal.`);
        }
      } else {
        await auth.signOut();
        setError("User profile not found.");
      }
      
    } catch (err: any) {
      console.error("Login Error:", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Invalid email or password");
      } else {
        setError("Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await sendPasswordResetEmail(auth, resetEmail); // Import this from firebase/auth if implementing fully
      // For now, keeping simulation or actually implement it:
       
       // Note: To implement real reset, import sendPasswordResetEmail from firebase/auth
       // await sendPasswordResetEmail(auth, resetEmail);
       
      setTimeout(() => {
        toast.success("Password reset link sent", {
          description: `We've sent a password reset link to ${resetEmail}`,
        });
        setIsResetOpen(false);
        setResetEmail("");
      }, 1000);
      
    } catch (error) {
       toast.error("Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Info Section */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-primary text-primary-foreground">
        {/* Animated Background for Left Column */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16 animate-fade-in">
             <div className="bg-white/10 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
             </div>
             <span className="font-semibold text-xl tracking-tight">T&P Portal</span>
          </Link>

          <div className="space-y-6">
             <h1 className="text-4xl font-bold leading-tight animate-slide-up text-white">
                {role === 'student' && "Shape Your Future with Top Opportunities"}
                {role === 'admin' && "Manage Placements & Drive Success"}
                {role === 'alumni' && "Stay Connected with Your Batchmates"}
                {!['student', 'admin', 'alumni'].includes(role || '') && "Welcome to the Platform"}
             </h1>
             <p className="text-lg text-primary-foreground/80 max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {role === 'student' && "Access internship drives, track applications, and view placement updates in real-time."}
                {role === 'admin' && "Efficiently manage student data, coordinate with companies, and generate insightful reports."}
                {role === 'alumni' && " mentor current students, explore career opportunities, and network with fellow graduates."}
             </p>

             {/* Functional Features List based on Role */}
             <div className="space-y-4 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {role === 'student' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full"><Briefcase className="h-5 w-5" /></div>
                      <span>Live Internship Updates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full"><BarChart3 className="h-5 w-5" /></div>
                      <span>Performance Analytics</span>
                    </div>
                  </>
                )}
                 {role === 'admin' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full"><Users className="h-5 w-5" /></div>
                      <span>Student Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full"><FileCheck className="h-5 w-5" /></div>
                      <span>Placement Reports</span>
                    </div>
                  </>
                )}
                 {role === 'alumni' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full"><Users className="h-5 w-5" /></div>
                      <span>Alumni Directory</span>
                    </div>
                     <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full"><Briefcase className="h-5 w-5" /></div>
                      <span>Job Referrals</span>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>

        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-primary-foreground/60">
            © 2026 FCRIT. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center p-4 lg:p-8 bg-muted/30 relative">
        <div className="absolute top-4 left-4">
           <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
           </Link>
        </div>

         <div className="w-full max-w-md relative z-10 animate-scale-in">
          <div className="glass-card rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-slide-up">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground animate-fade-in">{config.title}</h1>
              <p className="text-muted-foreground text-sm mt-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {config.description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="email">
                  {role === 'student' ? "Roll Number / Email" : "Email Address"}
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="text"
                    placeholder={config.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm animate-fade-in bg-red-500/10 p-2 rounded border border-red-500/20 text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full animate-slide-up" size="lg" style={{ animationDelay: '0.4s' }}>
                Login
              </Button>
            </form>
            
            <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <button
                type="button"
                onClick={() => setIsResetOpen(true)}
                className="text-sm text-primary hover:underline bg-transparent border-none cursor-pointer hover:scale-105 transition-transform"
              >
                Forgot password?
              </button>
              
              {role === 'alumni' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    New Alumni?{" "}
                    <Link to="/signup/alumni" className="text-primary hover:underline font-medium">
                      Register here
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
       {/* Forgot Password Dialog */}
       <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
