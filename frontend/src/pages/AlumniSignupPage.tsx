import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, User, Lock, Mail, Building, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { api } from "@/services/api.service";

interface FoundStudent {
  uid: string | null;
  name: string | null;
  department: string | null;
  graduationYear: string | null;
  rollNumber: string | null;
  collegeEmail: string;
}

const AlumniSignupPage = () => {
  const navigate = useNavigate();
  const [collegeEmail, setCollegeEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Student lookup state
  const [lookingUp, setLookingUp] = useState(false);
  const [foundStudent, setFoundStudent] = useState<FoundStudent | null>(null);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // Step 1: Lookup student by college email when the field loses focus
  const handleCollegeEmailBlur = async () => {
    if (!collegeEmail || !collegeEmail.includes("@")) return;

    setLookingUp(true);
    setFoundStudent(null);
    setLookupDone(false);
    setLookupError("");

    try {
      const response = await api.auth.lookupStudent(collegeEmail);
      const student: FoundStudent = response.data.student;
      setFoundStudent(student);
      setLookupDone(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "No student account found with this college email.";
      setLookupError(msg);
      setLookupDone(true);
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!collegeEmail || !currentEmail || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!collegeEmail.includes("@") || !currentEmail.includes("@")) {
      setError("Please enter valid email addresses");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!foundStudent) {
      setError("Please wait for your college email to be verified before registering.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create Firebase Auth user with their PERSONAL email
      const userCredential = await createUserWithEmailAndPassword(auth, currentEmail, password);
      const user = userCredential.user;

      // Update display name from student record
      if (foundStudent.name) {
        await updateProfile(user, { displayName: foundStudent.name });
      }

      // Step 2: Create the User doc in Firestore (role = alumni)
      await setDoc(doc(db, "Users", user.uid), {
        uid: user.uid,
        role: "alumni",
        email: currentEmail,             // personal/login email
        collegeEmail: collegeEmail,      // college email (lookup key)
        name: foundStudent.name ?? "",
        department: foundStudent.department ?? "",
        graduationYear: foundStudent.graduationYear ?? "",
        rollNumber: foundStudent.rollNumber ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Step 3: Create Alumni Profile in alumniProfiles collection
      // Pre-populated with the student data fetched from the backend
      await setDoc(doc(db, "alumniProfiles", user.uid), {
        userId: user.uid,
        name: foundStudent.name ?? "",
        department: foundStudent.department ?? "",
        graduationYear: foundStudent.graduationYear ?? "",
        rollNumber: foundStudent.rollNumber ?? "",
        collegeEmail: collegeEmail,
        email: currentEmail,
        company: "",
        role: "",
        workDomain: "",
        isPublic: true,
        createdAt: new Date().toISOString(),
      });

      toast.success("Alumni account created successfully! Your student data has been transferred.");
      navigate("/login/alumni");

    } catch (err: any) {
      console.error("Signup Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This personal email is already registered. Please use a different email or log in.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16 animate-fade-in">
            <div className="bg-white/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight">T&P Portal</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight animate-slide-up text-white">
              Join the Alumni Network
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Reconnect with your Faculty, Juniors and explore career opportunities with fellow graduates.
            </p>

            <div className="mt-8 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {[
                "Your student data is automatically transferred",
                "Keep your academic history & achievements",
                "Access the alumni network instantly",
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-3 text-primary-foreground/90">
                  <CheckCircle2 className="h-5 w-5 text-white/70 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-primary-foreground/60">
            © 2026 FCRIT. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Signup Form */}
      <div className="flex items-center justify-center p-4 lg:p-8 bg-muted/30 relative">
        <div className="absolute top-4 left-4">
          <Link to="/login/alumni" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>

        <div className="w-full max-w-md relative z-10 animate-scale-in">
          <div className="glass-card rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-slide-up">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground animate-fade-in">Alumni Registration</h1>
              <p className="text-muted-foreground text-sm mt-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Enter your college email to verify your student record
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* College Email Field */}
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="collegeEmail">College Email ID</Label>
                <div className="relative group">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="collegeEmail"
                    type="email"
                    placeholder="your.name@fcrit.ac.in"
                    value={collegeEmail}
                    onChange={(e) => {
                      setCollegeEmail(e.target.value);
                      setFoundStudent(null);
                      setLookupDone(false);
                      setLookupError("");
                    }}
                    onBlur={handleCollegeEmailBlur}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                {/* Lookup feedback */}
                {lookingUp && (
                  <p className="text-xs text-muted-foreground animate-pulse">🔍 Looking up your student record...</p>
                )}
                {lookupDone && foundStudent && (
                  <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-md p-2 animate-fade-in">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">Student record found!</p>
                      <p className="text-xs text-muted-foreground">
                        {foundStudent.name && <><span className="font-medium">{foundStudent.name}</span> · </>}
                        {foundStudent.department && <>{foundStudent.department} · </>}
                        {foundStudent.graduationYear && <>Batch {foundStudent.graduationYear}</>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Your data will be transferred automatically ✓</p>
                    </div>
                  </div>
                )}
                {lookupDone && !foundStudent && lookupError && (
                  <p className="text-xs text-red-500 animate-fade-in">⚠️ {lookupError}</p>
                )}
                {!lookupDone && !lookingUp && (
                  <p className="text-xs text-muted-foreground">Used to verify your alumni status and transfer your student profile.</p>
                )}
              </div>

              {/* Personal Email Field */}
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <Label htmlFor="currentEmail">Personal Email ID</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="currentEmail"
                    type="email"
                    placeholder="you@gmail.com"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">This will be your login email after graduation.</p>
              </div>

              {/* Password */}
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm animate-fade-in bg-red-500/10 p-2 rounded border border-red-500/20 text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full animate-slide-up mt-2"
                size="lg"
                style={{ animationDelay: '0.4s' }}
                disabled={loading || !foundStudent}
              >
                {loading ? "Creating Account..." : "Register as Alumni"}
              </Button>

              {!foundStudent && !loading && (
                <p className="text-xs text-center text-muted-foreground">
                  Enter your college email above to enable registration.
                </p>
              )}
            </form>

            <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login/alumni" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniSignupPage;
