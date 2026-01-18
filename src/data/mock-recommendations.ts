import type { AgentRecommendation, Notification } from "@/types";

export const mockRecommendations: AgentRecommendation[] = [
  {
    id: "rec_001",
    userId: "user_001",
    orderId: "ord_001",
    type: "deadline_warning",
    title: "Return window closing soon",
    description:
      "Your Nike Air Max 90 return window closes in 8 days. Would you like to start a return?",
    reasoning:
      "Based on your order history, you typically try multiple sizes. Since this is size 10, you may want to consider returning if the fit isn't right.",
    urgency: "medium",
    primaryAction: {
      label: "Start Return",
      type: "return",
      data: { orderId: "ord_001" },
    },
    secondaryAction: {
      label: "Keep Item",
      type: "dismiss",
    },
    status: "pending",
    expiresAt: "2025-02-09T23:59:59Z",
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "rec_002",
    userId: "user_001",
    orderId: "ord_002",
    type: "track",
    title: "MacBook Pro arriving Wednesday",
    description:
      "Your MacBook Pro 14\" is in transit and scheduled to arrive January 15th. Track your package for real-time updates.",
    urgency: "low",
    primaryAction: {
      label: "Track Package",
      type: "track",
      data: { orderId: "ord_002" },
    },
    status: "pending",
    createdAt: "2025-01-13T10:00:00Z",
  },
  {
    id: "rec_003",
    userId: "user_001",
    orderId: "ord_003",
    type: "deadline_warning",
    title: "Amazon return deadline approaching",
    description:
      "Your Sony headphones and headphone stand are returnable until February 4th (21 days left).",
    urgency: "low",
    primaryAction: {
      label: "View Return Options",
      type: "return",
      data: { orderId: "ord_003" },
    },
    secondaryAction: {
      label: "Remind Me Later",
      type: "snooze",
      data: { days: 7 },
    },
    status: "pending",
    expiresAt: "2025-02-04T23:59:59Z",
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "rec_004",
    userId: "user_001",
    orderId: "ord_004",
    type: "return",
    title: "Return in progress",
    description:
      "Your Uniqlo jacket return has been initiated. Remember to ship it back by January 26th to complete the return.",
    urgency: "medium",
    primaryAction: {
      label: "View Return Status",
      type: "view_return",
      data: { orderId: "ord_004" },
    },
    status: "viewed",
    createdAt: "2025-01-13T08:00:00Z",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    userId: "user_001",
    recommendationId: "rec_001",
    type: "deadline_warning",
    title: "Return deadline: 8 days left",
    body: "Nike Air Max 90 - Return by Feb 9",
    channels: ["in_app", "email"],
    read: false,
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "notif_002",
    userId: "user_001",
    type: "delivery_update",
    title: "Package in transit",
    body: "MacBook Pro 14\" - Arriving Jan 15",
    channels: ["in_app"],
    read: false,
    createdAt: "2025-01-13T10:30:00Z",
  },
  {
    id: "notif_003",
    userId: "user_001",
    type: "delivery_update",
    title: "Delivered",
    body: "Nike Air Max 90 was delivered to your front door",
    channels: ["in_app", "email"],
    read: true,
    readAt: "2025-01-10T15:00:00Z",
    createdAt: "2025-01-10T14:35:00Z",
  },
  {
    id: "notif_004",
    userId: "user_001",
    recommendationId: "rec_004",
    type: "return",
    title: "Return initiated",
    body: "Uniqlo jacket return started - ship by Jan 26",
    channels: ["in_app"],
    read: true,
    readAt: "2025-01-13T08:30:00Z",
    createdAt: "2025-01-13T08:00:00Z",
  },
];

export function getUnreadNotifications(): Notification[] {
  return mockNotifications.filter((n) => !n.read);
}

export function getPendingRecommendations(): AgentRecommendation[] {
  return mockRecommendations.filter((r) => r.status === "pending");
}

export function getUrgentRecommendations(): AgentRecommendation[] {
  return mockRecommendations.filter(
    (r) => r.status === "pending" && (r.urgency === "high" || r.urgency === "critical")
  );
}
