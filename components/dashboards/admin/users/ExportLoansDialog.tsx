'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

interface ExportLoansDialogProps {
  token: string;
}

export function ExportLoansDialog({ token }: ExportLoansDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportLoans = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-loans`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export loans");
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      
      // Create a filename with current date
      const date = new Date().toISOString().split('T')[0];
      a.download = `loans_export_${date}.csv`;
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsOpen(false);
      
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export loans. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex font-header bg-green-700 hover:bg-green-600 text-white items-center gap-2">
          <Download className="h-4 w-4" />
          Export Internal Orders
        </Button>
      </DialogTrigger>
      <DialogContent className="font-header">
        <DialogHeader>
          <DialogTitle>Export Loans Data</DialogTitle>
          <DialogDescription>
            This will export all users who have taken loans as a CSV file.
            The file will include: First Name, Last Name, Email, Phone, Level,
            Employee ID, Government Entity, Salary Per Month, Loan Unit, and Loan Amount Collected.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={exportLoans}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? "Exporting..." : "Export CSV"}
            {isExporting && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}