import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, ShipmentStatus, ReturnStatus } from "@/types";

type StatusType = OrderStatus | ShipmentStatus | ReturnStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  // Order statuses
  pending: { label: "Pending", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  processing: { label: "Processing", variant: "secondary" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  returned: { label: "Returned", variant: "outline" },

  // Shipment statuses
  pre_transit: { label: "Label Created", variant: "secondary" },
  in_transit: { label: "In Transit", variant: "default" },
  out_for_delivery: { label: "Out for Delivery", variant: "default" },
  failed: { label: "Delivery Failed", variant: "destructive" },

  // Return statuses
  none: { label: "None", variant: "secondary" },
  eligible: { label: "Eligible", variant: "outline" },
  initiated: { label: "Return Started", variant: "default" },
  received: { label: "Received", variant: "default" },
  refunded: { label: "Refunded", variant: "default" },
  ineligible: { label: "Not Eligible", variant: "secondary" },
};

const statusColors: Record<StatusType, string> = {
  // Order statuses
  pending: "bg-status-pending/10 text-status-pending border-status-pending/20",
  confirmed: "bg-status-shipped/10 text-status-shipped border-status-shipped/20",
  processing: "bg-status-processing/10 text-status-processing border-status-processing/20",
  shipped: "bg-status-shipped/10 text-status-shipped border-status-shipped/20",
  delivered: "bg-status-delivered/10 text-status-delivered border-status-delivered/20",
  cancelled: "bg-status-alert/10 text-status-alert border-status-alert/20",
  returned: "bg-status-return/10 text-status-return border-status-return/20",

  // Shipment statuses
  pre_transit: "bg-status-pending/10 text-status-pending border-status-pending/20",
  in_transit: "bg-status-shipped/10 text-status-shipped border-status-shipped/20",
  out_for_delivery: "bg-status-processing/10 text-status-processing border-status-processing/20",
  failed: "bg-status-alert/10 text-status-alert border-status-alert/20",

  // Return statuses
  none: "bg-muted text-muted-foreground border-border",
  eligible: "bg-status-return/10 text-status-return border-status-return/20",
  initiated: "bg-status-processing/10 text-status-processing border-status-processing/20",
  received: "bg-status-shipped/10 text-status-shipped border-status-shipped/20",
  refunded: "bg-status-delivered/10 text-status-delivered border-status-delivered/20",
  ineligible: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  const colorClass = statusColors[status] || "";

  return (
    <Badge
      variant="outline"
      className={cn("font-medium border", colorClass, className)}
    >
      {config.label}
    </Badge>
  );
}
