"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Paperclip, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ACCEPTED_IMAGE_TYPES_STR = ACCEPTED_IMAGE_TYPES.join(",");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 4;

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

interface ChatInputProps {
  onSend: (message: string, files?: FileList) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Type your message...",
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const addImages = useCallback((files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    setImageLoading(true);

    setImages((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_FILES} images allowed.`);
        setImageLoading(false);
        return prev;
      }

      const toAdd = Array.from(files).slice(0, remaining);
      if (toAdd.length < files.length) {
        toast.error(`Only ${remaining} more image${remaining !== 1 ? "s" : ""} can be added.`);
      }

      const valid: File[] = [];
      for (const file of toAdd) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`"${file.name}" is not a supported image type. Use JPEG, PNG, GIF, or WebP.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`"${file.name}" exceeds the 5MB size limit.`);
          continue;
        }
        valid.push(file);
      }

      if (valid.length === 0) {
        setImageLoading(false);
        return prev;
      }

      const previews: ImagePreview[] = valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));

      setImageLoading(false);
      return [...prev, ...previews];
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.url));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSend = () => {
    const hasContent = message.trim() || images.length > 0;
    if (!hasContent || disabled) return;

    // Build a FileList from the images
    if (images.length > 0) {
      const dt = new DataTransfer();
      images.forEach((img) => dt.items.add(img.file));
      onSend(message.trim(), dt.files);
    } else {
      onSend(message.trim());
    }

    setMessage("");
    clearImages();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addImages(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag-and-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files") && !disabled) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addImages(files);
    }
  };

  // Paste handler for images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      addImages(imageFiles);
    }
  };

  const canSend = (message.trim() || images.length > 0) && !disabled;

  return (
    <div
      className={cn("relative flex flex-col gap-2", className)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-[#3B82F6] bg-[#EFF6FF]/90">
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-8 w-8 text-[#3B82F6]" />
            <p className="text-sm font-medium text-[#3B82F6]">
              Drop images here
            </p>
          </div>
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group h-16 w-16 rounded-lg overflow-hidden border border-border"
            >
              <img
                src={img.url}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute -top-0 -right-0 rounded-full bg-black/60 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          {imageLoading && (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 rounded-2xl border bg-background p-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES_STR}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={disabled || images.length >= MAX_FILES}
          onClick={handleFileClick}
          type="button"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach image</span>
        </Button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent py-2 text-sm outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />

        <Button
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl"
          onClick={handleSend}
          disabled={!canSend}
          type="button"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
}
