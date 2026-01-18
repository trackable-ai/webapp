import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  cents: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({
  cents,
  currency = "USD",
  className,
  size = "md",
}: PriceDisplayProps) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });

  const formattedPrice = formatter.format(cents / 100);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
  };

  return (
    <span className={cn("tabular-nums", sizeClasses[size], className)}>
      {formattedPrice}
    </span>
  );
}
