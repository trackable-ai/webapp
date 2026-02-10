"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadZone } from "./upload-zone";
import { X, Hash, Check, Receipt, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderAdded?: () => void;
}

export function AddOrderModal({
  open,
  onOpenChange,
  onOrderAdded,
}: AddOrderModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setUploadedFile(null);
      setTrackingNumber("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!uploadedFile && !trackingNumber.trim()) {
      toast.error("Please upload a file or enter a tracking number");
      return;
    }

    setIsSubmitting(true);
    try {
      if (uploadedFile) {
        // Image path: ingest the image, backend creates order asynchronously
        const base64 = await fileToBase64(uploadedFile);
        const response = await fetch("/api/orders/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_data: base64,
            filename: uploadedFile.name,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process image");
        }
      } else {
        // Tracking number path: create order with tracking number
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackingNumber: trackingNumber.trim(),
            source: "manual",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create order");
        }
      }

      toast.success("Order added successfully");
      onOpenChange(false);
      onOrderAdded?.();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to add order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = uploadedFile || trackingNumber.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[520px] gap-0 p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-5">
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-heading text-lg font-semibold text-[#0D0D0D]">
              Add Order
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#7A7A7A]">
              Upload a receipt or enter a tracking number
            </DialogDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded text-[#7A7A7A] transition-colors hover:bg-[#FAFAFA] hover:text-[#0D0D0D]"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <UploadZone
            onFileSelect={setUploadedFile}
            disabled={isSubmitting}
            className={cn(uploadedFile && "border-[#3B82F6] bg-[#EFF6FF]")}
          />

          {uploadedFile && (
            <div className="flex items-center gap-2 text-sm text-[#0D0D0D]">
              <Receipt className="h-4 w-4 text-[#3B82F6]" />
              <span className="truncate">{uploadedFile.name}</span>
              <button
                onClick={() => setUploadedFile(null)}
                className="ml-auto text-[#7A7A7A] hover:text-[#0D0D0D]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E8E8E8]" />
            <span className="text-xs text-[#7A7A7A]">
              or enter a tracking number
            </span>
            <div className="h-px flex-1 bg-[#E8E8E8]" />
          </div>

          {/* Tracking number input */}
          <div className="flex items-center gap-2 rounded border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3">
            <Hash className="h-4 w-4 text-[#B0B0B0]" />
            <input
              type="text"
              placeholder="Enter tracking number (e.g., 1Z999AA10123456784)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-[#0D0D0D] placeholder:text-[#B0B0B0] focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E8E8E8] px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Add Order
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix: "data:image/png;base64,"
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
