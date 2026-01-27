import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    icon: LucideIcon;
    text: string;
    color?: string;
  };
  className?: string;
}

export function MetricCard({ label, value, trend, className }: MetricCardProps) {
  const TrendIcon = trend?.icon;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-[#E8E8E8] bg-white p-5",
        className
      )}
    >
      <span className="text-xs font-normal text-[#7A7A7A]">{label}</span>
      <span className="font-heading text-[32px] font-semibold leading-tight text-[#0D0D0D]">
        {value}
      </span>
      {trend && TrendIcon && (
        <div className="flex items-center gap-1">
          <TrendIcon
            className={cn("h-3.5 w-3.5", trend.color || "text-[#10B981]")}
          />
          <span className="text-xs font-normal text-[#7A7A7A]">
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
}
