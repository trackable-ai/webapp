import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 40, text: "text-xl" },
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.svg"
        alt="Trackable"
        width={icon}
        height={icon}
        className="shrink-0"
      />
      {showText && (
        <span
          className={cn(
            "font-heading font-semibold text-[#0D0D0D]",
            text
          )}
        >
          Trackable
        </span>
      )}
    </div>
  );
}
