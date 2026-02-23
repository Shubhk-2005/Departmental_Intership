import { useState } from "react";
import {
  useOffCampusPlacements,
  useDeleteOffCampusPlacement,
} from "@/hooks/useOffCampusPlacements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileSpreadsheet,
  Search,
  Trash2,
  ExternalLink,
  Eye,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api.service";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import OffCampusAnalyticsCharts from "@/components/charts/OffCampusAnalyticsCharts";

interface Placement {
  id: string;
  alumniName: string;
  graduationYear: string;
  companyName: string;
  companyLocation: string;
  jobRole: string;
  package: number | null;
  joiningDate: string;
  employmentType: string;
  companyIdCardUrl: string;
  submittedAt: string;
  status: string;
}

export function OffCampusPlacementsTab() {
  const { data: placements = [], isLoading } = useOffCampusPlacements();
  const deletePlacement = useDeleteOffCampusPlacement();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(
    null
  );
  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [placementToDelete, setPlacementToDelete] = useState<string | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"csv" | "analytics">("csv");
  const hiddenReportRef = useRef<HTMLDivElement>(null);

  // Filter placements based on search
  const filteredPlacements = placements.filter((placement: Placement) => {
    const query = searchQuery.toLowerCase();
    return (
      placement.alumniName?.toLowerCase().includes(query) ||
      placement.companyName?.toLowerCase().includes(query) ||
      placement.jobRole?.toLowerCase().includes(query) ||
      placement.companyLocation?.toLowerCase().includes(query) ||
      placement.graduationYear?.includes(query)
    );
  });

  const handleViewIdCard = (placement: Placement) => {
    setSelectedPlacement(placement);
    setIdCardDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setPlacementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!placementToDelete) return;

    try {
      await deletePlacement.mutateAsync(placementToDelete);
      toast.success("Placement deleted successfully");
      setDeleteDialogOpen(false);
      setPlacementToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete placement");
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await api.offCampusPlacements.exportCSV();
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `off-campus-placements_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (error: any) {
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!hiddenReportRef.current) return;
    try {
      const canvas = await html2canvas(hiddenReportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Off_Campus_Placements_Report.pdf`);
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("PDF Gen Error:", err);
      toast.error("Failed to generate PDF");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CardTitle>Off-Campus Placements</CardTitle>
              <div className="flex bg-muted p-1 rounded-lg">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === "csv"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                    }`}
                    onClick={() => setViewMode("csv")}
                  >
                    Data View
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === "analytics"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                    }`}
                    onClick={() => setViewMode("analytics")}
                  >
                    Analytics View
                  </button>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {viewMode === "csv" && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search placements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              )}
              {viewMode === "csv" ? (
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting || placements.length === 0}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
              ) : (
                <Button
                  onClick={handleDownloadPDF}
                  disabled={placements.length === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "csv" ? (
            <>
              {filteredPlacements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No placements found matching your search"
                      : "No off-campus placements submitted yet"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alumni Name</TableHead>
                        <TableHead>Grad Year</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Joining Date</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlacements.map((placement: Placement) => (
                        <TableRow key={placement.id}>
                          <TableCell className="font-medium">
                            {placement.alumniName}
                          </TableCell>
                          <TableCell>{placement.graduationYear}</TableCell>
                          <TableCell>{placement.companyName}</TableCell>
                          <TableCell>{placement.companyLocation}</TableCell>
                          <TableCell>{placement.jobRole}</TableCell>
                          <TableCell>
                            {placement.package
                              ? `${placement.package} LPA`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {placement.employmentType}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(placement.joiningDate)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(placement.submittedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewIdCard(placement)}
                                title="View ID Card"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(placement.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {filteredPlacements.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredPlacements.length} of {placements.length}{" "}
                  placements
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {/* VISIBLE CHART CONTAINER */}
              <div className="bg-background rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card p-4 rounded-lg border shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">Total Off-Campus Placements</p>
                    <p className="text-2xl font-bold">{placements.length}</p>
                  </div>
                </div>
                <OffCampusAnalyticsCharts data={placements} />
              </div>

              {/* HIDDEN REPORT CONTAINER (For PDF Generation Only) */}
              <div
                ref={hiddenReportRef}
                style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '1200px' }}
                className="space-y-6 bg-white p-8"
              >
                <div className="mb-4 text-center border-b pb-4">
                  <h2 className="text-3xl font-bold text-black">Off-Campus Placements Analytics Report</h2>
                  <p className="text-gray-600 mt-2">Comprehensive Report</p>
                  <p className="text-gray-500 text-sm mt-1">Generated on {new Date().toLocaleDateString('en-US')}</p>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="border p-4 rounded-lg text-center bg-gray-50">
                    <p className="text-sm text-gray-500">Total Off-Campus Placements</p>
                    <p className="text-3xl font-bold text-black">{placements.length}</p>
                  </div>
                </div>

                <OffCampusAnalyticsCharts data={placements} />

                <div className="text-center text-gray-500 text-sm border-t-2 border-gray-300 pt-6 mt-8">
                  <p>This report was automatically generated by the Internship Management System</p>
                  <p className="mt-1">Department of Computer Engineering</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ID Card View Dialog */}
      <Dialog open={idCardDialogOpen} onOpenChange={setIdCardDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Company ID Card - {selectedPlacement?.alumniName}
            </DialogTitle>
          </DialogHeader>
          {selectedPlacement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Company:</span>{" "}
                  {selectedPlacement.companyName}
                </div>
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  {selectedPlacement.jobRole}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {selectedPlacement.companyIdCardUrl.endsWith(".pdf") ? (
                  <div className="p-8 text-center">
                    <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF Document
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          selectedPlacement.companyIdCardUrl,
                          "_blank"
                        )
                      }
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open PDF
                    </Button>
                  </div>
                ) : (
                  <img
                    src={selectedPlacement.companyIdCardUrl}
                    alt="Company ID Card"
                    className="w-full h-auto"
                  />
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(selectedPlacement.companyIdCardUrl, "_blank")
                  }
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this off-campus placement record.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlacement.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
