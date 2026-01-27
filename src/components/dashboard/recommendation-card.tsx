import { AlertCircle, Package, RotateCcw, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type RecommendationType = "warning" | "info" | "return";

interface RecommendationCardProps {
  type: RecommendationType;
  title: string;
  description: string;
  className?: string;
}

const typeConfig: Record<
  RecommendationType,
  { icon: LucideIcon; bg: string; iconColor: string }
> = {
  warning: {
    icon: AlertCircle,
    bg: "bg-[#FEF3C7]",
    iconColor: "text-[#F59E0B]",
  },
  info: {
    icon: Package,
    bg: "bg-[#EFF6FF]",
    iconColor: "text-[#3B82F6]",
  },
  return: {
    icon: RotateCcw,
    bg: "bg-[#F5F3FF]",
    iconColor: "text-[#8B5CF6]",
  },
};

export function RecommendationCard({
  type,
  title,
  description,
  className,
}: RecommendationCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex gap-3 rounded p-3", config.bg, className)}>
      <Icon className={cn("h-[18px] w-[18px] shrink-0", config.iconColor)} />
      <div className="flex flex-col gap-1">
        <span className="font-heading text-[13px] font-medium text-[#0D0D0D]">
          {title}
        </span>
        <span className="text-xs font-normal text-[#7A7A7A]">{description}</span>
      </div>
    </div>
  );
}
