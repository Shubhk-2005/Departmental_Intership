import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail } from "firebase/auth";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TransitionToAlumniModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  currentEmail: string;
}

const TransitionToAlumniModal: React.FC<TransitionToAlumniModalProps> = ({ isOpen, onClose, uid, currentEmail }) => {
  const [personalEmail, setPersonalEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalEmail || !password) {
      toast.error("Please provide both your new email and current password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found.");

      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(currentEmail, password);
      await reauthenticateWithCredential(user, credential);

      // 2. Update Auth Email
      await updateEmail(user, personalEmail);

      // 3. Update Firestore User Role
      const userRef = doc(db, "Users", uid);
      await updateDoc(userRef, {
        email: personalEmail,
        role: "alumni",
      });

      // 4. Create Alumni Profile
      const alumniRef = doc(db, "alumni_profiles", uid);
      await setDoc(alumniRef, {
        userId: uid,
        company: company || "Not specified",
        role: role || "Not specified",
        isPublic: true,
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast.success("Successfully transitioned to Alumni account! Please log in again using your new email.");
      
      // Auto-refresh to force new auth state/roles to load
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (error: any) {
      console.error("Transition error:", error);
      if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error("That email is already registered to another account.");
      } else {
        toast.error(error.message || "Failed to complete transition.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transition to Alumni</DialogTitle>
          <DialogDescription>
            Update your account with a personal email to maintain access after graduation. Your past data will be preserved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="personalEmail">New Personal Email *</Label>
            <Input
              id="personalEmail"
              type="email"
              placeholder="e.g., student@gmail.com"
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Current Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password to verify..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Required for security purposes to change your email.</p>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <h4 className="text-sm font-medium mb-3">Optional: Current Employment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="e.g., TCS"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Job Role</Label>
                <Input
                  id="role"
                  placeholder="e.g., Software Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transitioning...
                </>
              ) : (
                "Convert to Alumni"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransitionToAlumniModal;
