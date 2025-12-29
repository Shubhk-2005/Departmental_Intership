import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Loader2,
  AlertCircle,
  Plus,
  Save,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, setDoc, getDocs } from "firebase/firestore";

// NEW Interface for Yearly Aggregated Data
interface YearlyRecord {
  year: string;
  eligible: number;
  placed: number;
  higherStudies: number;
  unplaced: number; // To be calculated: Eligible - (Placed + HigherStudies)
}

interface AnalyticsData {
  totalEligible: number;
  totalPlaced: number;
  totalHigherStudies: number;
  avgPlacementPercentage: number;
}

export const PlacementRecordsTab = () => {
  const [records, setRecords] = useState<YearlyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  
  // Manual Entry State
  const [manualForm, setManualForm] = useState({
    year: "",
    eligible: "",
    placed: "",
    higherStudies: ""
  });

  // Fetch Existing Records on Mount
  useEffect(() => {
    const fetchRecords = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "placement_stats_yearly"));
            const fetchedData: YearlyRecord[] = [];
            querySnapshot.forEach((doc) => {
                fetchedData.push(doc.data() as YearlyRecord);
            });
            // Sort by Year descending
            fetchedData.sort((a,b) => b.year.localeCompare(a.year));
            setRecords(fetchedData);
        } catch (error) {
            console.error("Error fetching records:", error);
            toast.error("Failed to load existing records");
        }
    };

    fetchRecords();
  }, []);

  const handleManualSave = async () => {
    if (!manualForm.year) {
      toast.error("Year is required (e.g., 2023-24)");
      return;
    }
    
    setLoading(true);
    try {
        const eligible = Number(manualForm.eligible) || 0;
        const placed = Number(manualForm.placed) || 0;
        const higherStudies = Number(manualForm.higherStudies) || 0;
        const unplaced = Math.max(0, eligible - (placed + higherStudies));

        const newRecord: YearlyRecord = {
            year: manualForm.year,
            eligible,
            placed,
            higherStudies,
            unplaced
        };

        // Save to Firestore
        await setDoc(doc(db, "placement_stats_yearly", manualForm.year), newRecord);

        // Update local state
        setRecords(prev => {
            const others = prev.filter(r => r.year !== manualForm.year);
            const updated = [...others, newRecord].sort((a,b) => b.year.localeCompare(a.year));
            return updated;
        });

        toast.success(`Record for ${manualForm.year} saved!`);
        setIsManualOpen(false);
        setManualForm({ year: "", eligible: "", placed: "", higherStudies: "" });
    } catch (error) {
        console.error("Manual save error:", error);
        toast.error("Failed to save record");
    } finally {
        setLoading(false);
    }
  };

  // Parse Excel File & Save to Firestore
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map and validate data based on NEW columns
        const mappedData: YearlyRecord[] = data.map((row: any) => {
            const eligible = Number(row["Eligible"]) || 0;
            const placed = Number(row["Placed"]) || 0;
            const higherStudies = Number(row["Higher Studies"]) || 0;
            
            return {
                year: String(row["Year"]),
                eligible,
                placed,
                higherStudies,
                unplaced: Math.max(0, eligible - (placed + higherStudies))
            }
        });

        // Batch write to Firestore (Collection: 'placement_stats_yearly')
        const batch = writeBatch(db);
        const recordsRef = collection(db, "placement_stats_yearly");
        
        mappedData.forEach((record) => {
             // Use Year as ID for easy updates/overwrites
            const docRef = doc(recordsRef, record.year);
            batch.set(docRef, record);
        });

        await batch.commit();

        // Sort by Year descending
        mappedData.sort((a,b) => b.year.localeCompare(a.year));
        setRecords(mappedData);
        toast.success(`Successfully uploaded stats for ${mappedData.length} years`);
      } catch (error) {
        console.error("Error parsing/uploading:", error);
        toast.error("Failed. Ensure columns: Year, Eligible, Placed, Higher Studies");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Upload Placement Records
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload Excel to update yearly stats (merges with existing data)
          </p>
        </div>
        <Button onClick={() => setIsManualOpen(!isManualOpen)} variant="outline" className="gap-2">
            {isManualOpen ? <X className="h-4 w-4"/> : <Plus className="h-4 w-4"/>}
            {isManualOpen ? "Cancel" : "Add Year Manually"}
        </Button>
      </div>

      {/* Manual Entry Form */}
      {isManualOpen && (
        <div className="bg-card p-6 rounded-lg border border-border mt-4 animate-in slide-in-from-top-2">
            <h3 className="font-semibold mb-4">Add Single Year Record</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Year (e.g. 2023-24)</label>
                    <Input 
                        placeholder="2023-24" 
                        value={manualForm.year}
                        onChange={e => setManualForm({...manualForm, year: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Total Eligible</label>
                    <Input 
                        type="number"
                        placeholder="0" 
                        value={manualForm.eligible}
                        onChange={e => setManualForm({...manualForm, eligible: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Placed</label>
                    <Input 
                        type="number" 
                        placeholder="0"
                        value={manualForm.placed}
                        onChange={e => setManualForm({...manualForm, placed: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Higher Studies</label>
                    <Input 
                        type="number" 
                        placeholder="0"
                        value={manualForm.higherStudies}
                        onChange={e => setManualForm({...manualForm, higherStudies: e.target.value})}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleManualSave} disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Save Record
                </Button>
            </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-card p-6 rounded-lg border border-border dashed hover:bg-muted/30 transition-colors">
        <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>
          <span className="font-medium text-foreground">
            Click to upload Excel File (.xlsx, .xls)
          </span>
          <span className="text-xs text-muted-foreground">
            Expected Columns: Year, Eligible, Placed, Higher Studies
          </span>
          <Input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>
      </div>

      {records.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            Upload a placement record file to see statistics and charts.
          </AlertDescription>
        </Alert>
      ) : (
          <div className="bg-card p-6 rounded-lg border shadow-sm overflow-hidden">
             {/* Table Preview */}
             <h3 className="font-semibold mb-4">Data Preview (Saved)</h3>
             <p className="text-sm text-muted-foreground mb-4">
                This data is now available in the <b>Analytics</b> tab.
             </p>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                         <tr>
                             <th className="px-4 py-2">Year</th>
                             <th className="px-4 py-2">Eligible</th>
                             <th className="px-4 py-2">Placed</th>
                             <th className="px-4 py-2">Higher Studies</th>
                             </tr>
                     </thead>
                     <tbody>
 
                         {records.map((r) => (
                             <tr key={r.year} className="border-b">
                                 <td className="px-4 py-2 font-medium">{r.year}</td>
                                 <td className="px-4 py-2">{r.eligible}</td>
                                 <td className="px-4 py-2 text-success">{r.placed}</td>
                                 <td className="px-4 py-2 text-info">{r.higherStudies}</td>
                                 </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
      )}
    </div>
  );
};
