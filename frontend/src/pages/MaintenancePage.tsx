import { AlertTriangle } from "lucide-react";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="bg-warning/10 p-4 rounded-full mb-6 animate-pulse">
        <AlertTriangle className="h-12 w-12 text-warning" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Under Maintenance
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
        The portal is currently undergoing scheduled maintenance to improve your
        experience. Access is temporarily restricted for students and alumni.
      </p>
      <div className="p-4 bg-muted/30 rounded-lg border border-border max-w-sm mx-auto">
        <p className="text-sm font-medium">Expected resolution: Soon</p>
        <p className="text-xs text-muted-foreground mt-1">
          Please check back later or contact the admin if this persists.
        </p>
      </div>
      <div className="mt-12 text-sm text-muted-foreground">
        Admin? <a href="/login/admin" className="text-primary hover:underline">Login here</a>
      </div>
    </div>
  );
};

export default MaintenancePage;
