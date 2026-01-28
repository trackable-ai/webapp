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
import {
  X,
  Hash,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Receipt,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderAdded?: () => void;
}

interface ExtractedData {
  merchant: string;
  items: string;
  trackingNumber: string;
  orderDate: string;
  confidence: number;
}

export function AddOrderModal({
  open,
  onOpenChange,
  onOrderAdded,
}: AddOrderModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  // Step 2 state - extracted/editable fields
  const [merchant, setMerchant] = useState("");
  const [items, setItems] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [finalTrackingNumber, setFinalTrackingNumber] = useState("");

  // UI state
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setUploadedFile(null);
      setImagePreviewUrl(null);
      setTrackingNumber("");
      setMerchant("");
      setItems("");
      setOrderDate("");
      setFinalTrackingNumber("");
      setIsExtracting(false);
      setIsSubmitting(false);
      setExtractedData(null);
    }
  }, [open]);

  // Create preview URL when file is selected
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedFile]);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleContinue = async () => {
    if (!uploadedFile && !trackingNumber.trim()) {
      toast.error("Please upload a file or enter a tracking number");
      return;
    }

    // If we have a file, extract data from it
    if (uploadedFile) {
      setIsExtracting(true);
      try {
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
          throw new Error("Failed to extract order details");
        }

        const data = await response.json();

        // Populate extracted data
        if (data.extracted) {
          setMerchant(data.extracted.merchant || "");
          setItems(data.extracted.items || "");
          setFinalTrackingNumber(
            data.extracted.trackingNumber || trackingNumber
          );
          setOrderDate(data.extracted.orderDate || getTodayDate());
          setExtractedData(data.extracted);
        } else {
          // No extraction, use defaults
          setFinalTrackingNumber(trackingNumber);
          setOrderDate(getTodayDate());
        }
      } catch (error) {
        console.error("Extraction error:", error);
        // Proceed anyway, user can fill in manually
        setFinalTrackingNumber(trackingNumber);
        setOrderDate(getTodayDate());
        toast.error("Could not extract details. Please fill in manually.");
      } finally {
        setIsExtracting(false);
      }
    } else {
      // No file, just tracking number
      setFinalTrackingNumber(trackingNumber);
      setOrderDate(getTodayDate());
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!merchant.trim()) {
      toast.error("Please enter a merchant name");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant,
          items: items
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
          trackingNumber: finalTrackingNumber,
          orderDate,
          source: uploadedFile ? "screenshot" : "manual",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
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

  const canContinue = uploadedFile || trackingNumber.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[520px] gap-0 p-0"
        showCloseButton={false}
      >
        {step === 1 ? (
          <>
            {/* Step 1: Upload */}
            <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-5">
              <div className="flex flex-col gap-1">
                <DialogTitle className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Add Order
                </DialogTitle>
                <DialogDescription className="text-[13px] text-[#7A7A7A]">
                  Upload a receipt or order confirmation
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
                onFileSelect={handleFileSelect}
                disabled={isExtracting}
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
                  or paste a tracking number
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
                onClick={handleContinue}
                disabled={!canContinue || isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Confirm */}
            <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-5">
              <div className="flex flex-col gap-1">
                <DialogTitle className="font-heading text-lg font-semibold text-[#0D0D0D]">
                  Confirm Order Details
                </DialogTitle>
                <DialogDescription className="text-[13px] text-[#7A7A7A]">
                  Review the extracted information before adding
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
              {/* Image preview + extracted info */}
              <div className="flex gap-4">
                {/* Image preview */}
                {imagePreviewUrl && uploadedFile?.type.startsWith("image/") ? (
                  <div className="h-40 w-[120px] flex-shrink-0 overflow-hidden rounded border border-[#E8E8E8] bg-[#FAFAFA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreviewUrl}
                      alt="Receipt preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-[120px] flex-shrink-0 items-center justify-center rounded border border-[#E8E8E8] bg-[#FAFAFA]">
                    <Receipt className="h-8 w-8 text-[#B0B0B0]" />
                  </div>
                )}

                {/* Extracted details */}
                <div className="flex flex-1 flex-col gap-3">
                  {extractedData && (
                    <div className="flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1.5 text-xs font-medium text-[#10B981] w-fit">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI extracted order details
                    </div>
                  )}

                  {/* Merchant field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#7A7A7A]">
                      Merchant
                    </label>
                    <input
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="e.g., Apple Store"
                      className="rounded border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-2 text-sm font-medium text-[#0D0D0D] placeholder:text-[#B0B0B0] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>

                  {/* Items field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#7A7A7A]">Items</label>
                    <input
                      type="text"
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                      placeholder="e.g., MacBook Pro 14&quot;"
                      className="rounded border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-2 text-sm text-[#0D0D0D] placeholder:text-[#B0B0B0] focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tracking number and date fields */}
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-xs text-[#7A7A7A]">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={finalTrackingNumber}
                    onChange={(e) => setFinalTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="rounded border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-2.5 text-[13px] text-[#0D0D0D] placeholder:text-[#B0B0B0] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
                <div className="flex w-[140px] flex-col gap-1.5">
                  <label className="text-xs text-[#7A7A7A]">Order Date</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="rounded border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-2.5 text-[13px] text-[#0D0D0D] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#E8E8E8] px-6 py-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
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
            </div>
          </>
        )}
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

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}
