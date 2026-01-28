"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/jpg,application/pdf";
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadZone({
  onFileSelect,
  accept = DEFAULT_ACCEPT,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = accept.split(",").map((t) => t.trim());
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPG, or PDF.");
      return false;
    }
    if (file.size > maxSizeBytes) {
      toast.error(
        `File too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`
      );
      return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
        isDragging
          ? "border-[#3B82F6] bg-[#EFF6FF]"
          : "border-[#E8E8E8] hover:border-[#B0B0B0]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          isDragging ? "bg-[#3B82F6]/10" : "bg-[#EFF6FF]"
        )}
      >
        <Upload
          className={cn(
            "h-6 w-6",
            isDragging ? "text-[#3B82F6]" : "text-[#3B82F6]"
          )}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-[#0D0D0D]">
          Drop your receipt or order confirmation here
        </p>
        <p className="text-[13px] text-[#7A7A7A]">or click to browse files</p>
      </div>
      <p className="text-xs text-[#B0B0B0]">
        Supports PNG, JPG, PDF up to 10MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
