"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeadlineCountdown } from "@/components/common";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import type { ReturnPolicy } from "@/types";

interface ReturnPolicyCardProps {
  policy: ReturnPolicy;
  className?: string;
}

export function ReturnPolicyCard({ policy, className }: ReturnPolicyCardProps) {
  const returnTypeLabels = {
    full_refund: "Full Refund",
    store_credit: "Store Credit",
    exchange_only: "Exchange Only",
    no_returns: "No Returns",
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Return Policy
          </CardTitle>
          {policy.isEligible ? (
            <Badge
              variant="outline"
              className="bg-status-delivered/10 text-status-delivered border-status-delivered/20"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Eligible
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground border-border"
            >
              <XCircle className="mr-1 h-3 w-3" />
              Not Eligible
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deadline */}
        {policy.isEligible && policy.daysRemaining !== undefined && (
          <DeadlineCountdown daysRemaining={policy.daysRemaining} />
        )}

        {/* Policy details */}
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Return Type</span>
            <span className="font-medium">{returnTypeLabels[policy.returnType]}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Return Window</span>
            <span className="font-medium">{policy.returnWindowDays} days</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Return Shipping</span>
            <span className="font-medium">
              {policy.freeReturn ? (
                <span className="text-status-delivered">Free</span>
              ) : (
                "Customer pays"
              )}
            </span>
          </div>

          {policy.restockingFeePercent !== undefined &&
            policy.restockingFeePercent > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restocking Fee</span>
                <span className="font-medium">{policy.restockingFeePercent}%</span>
              </div>
            )}

          {policy.deadlineAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Return By</span>
              <span className="font-medium">
                {format(new Date(policy.deadlineAt), "MMMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Conditions */}
        {policy.conditionRequirements && policy.conditionRequirements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              Requirements
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {policy.conditionRequirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {policy.returnInstructions && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{policy.returnInstructions}</p>
          </div>
        )}

        {/* Actions */}
        {policy.isEligible && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="flex-1">Start Return</Button>
            {policy.returnPortalUrl && (
              <Button variant="outline" asChild>
                <a
                  href={policy.returnPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Return Portal
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
