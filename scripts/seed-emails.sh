#!/bin/bash
# seed-emails.sh — Generate synthetic emails for testing Trackable's email ingestion pipeline.
# Usage: bash scripts/seed-emails.sh
#
# Fill in USER_ID with your Supabase UUID before running.

set -euo pipefail

USER_ID="${USER_ID:-<your-supabase-uuid>}"
API_URL="https://api.usetrackable.ai/api/v1/ingest/email"

if [[ "$USER_ID" == "<your-supabase-uuid>" ]]; then
  echo "ERROR: Set USER_ID before running."
  echo "  export USER_ID=\"your-uuid-here\" && bash scripts/seed-emails.sh"
  exit 1
fi

send_email() {
  local label="$1"
  local subject="$2"
  local from="$3"
  local content="$4"

  echo "==> Sending: $label"
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "X-User-ID: $USER_ID" \
    --data-raw "{\"email_subject\": $(echo "$subject" | jq -Rs .), \"email_from\": $(echo "$from" | jq -Rs .), \"email_content\": $(echo "$content" | jq -Rs .)}")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  echo "    Status: $http_code"
  echo "    Response: $body"
  echo ""
}

# ---------------------------------------------------------------------------
# Email 1: Amazon Order Confirmation
# ---------------------------------------------------------------------------
send_email "Amazon Order Confirmation" \
  "Your Amazon.com order #112-9374856-2938471" \
  "auto-confirm@amazon.com" \
  '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<div style="background:#232f3e;padding:16px;text-align:center">
  <span style="color:#fff;font-size:22px;font-weight:bold">amazon</span>
</div>
<div style="padding:20px">
  <h2 style="color:#232f3e">Order Confirmed</h2>
  <p>Hello,</p>
  <p>Thank you for your order. We will send a confirmation when your items ship.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="background:#f3f3f3"><th style="text-align:left;padding:8px">Item</th><th style="text-align:right;padding:8px">Qty</th><th style="text-align:right;padding:8px">Price</th></tr>
    <tr><td style="padding:8px">Sony WH-1000XM5 Wireless Headphones - Black</td><td style="text-align:right;padding:8px">1</td><td style="text-align:right;padding:8px">$348.00</td></tr>
    <tr><td style="padding:8px">Anker USB-C Charging Cable 6ft (2-Pack)</td><td style="text-align:right;padding:8px">1</td><td style="text-align:right;padding:8px">$13.99</td></tr>
  </table>
  <p><strong>Order Total:</strong> $361.99</p>
  <p><strong>Shipping:</strong> FREE Prime Delivery</p>
  <p><strong>Estimated Delivery:</strong> Wednesday, February 12, 2025</p>
  <p><strong>Shipping Address:</strong><br>123 Main St, Apt 4B<br>San Francisco, CA 94102</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
  <p style="font-size:12px;color:#888">Order #112-9374856-2938471</p>
</div></body></html>'

# ---------------------------------------------------------------------------
# Email 2: Apple Store Order Confirmation
# ---------------------------------------------------------------------------
send_email "Apple Store Order Confirmation" \
  "Your Apple Store order W1284930572 has been placed." \
  "no_reply@email.apple.com" \
  '<html><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f7">
<div style="background:#fff;padding:32px;border-radius:12px;margin:20px">
  <div style="text-align:center;margin-bottom:24px">
    <span style="font-size:28px;color:#1d1d1f">&#63743; Apple</span>
  </div>
  <h2 style="color:#1d1d1f;text-align:center">Thanks for your order.</h2>
  <p style="color:#6e6e73;text-align:center">Here is your order summary.</p>
  <div style="background:#f5f5f7;padding:16px;border-radius:8px;margin:16px 0">
    <p><strong>MacBook Air 15" M3 chip</strong></p>
    <p style="color:#6e6e73">Midnight / 16GB RAM / 512GB SSD</p>
    <p style="text-align:right;font-weight:bold">$1,299.00</p>
  </div>
  <p><strong>Order Number:</strong> W1284930572</p>
  <p><strong>Order Date:</strong> February 5, 2025</p>
  <p><strong>Estimated Delivery:</strong> February 14 - February 18, 2025</p>
  <p><strong>Ships to:</strong><br>456 Oak Avenue<br>Palo Alto, CA 94301</p>
  <hr style="border:none;border-top:1px solid #d2d2d7;margin:20px 0">
  <p style="font-size:12px;color:#86868b;text-align:center">Apple Store | apple.com</p>
</div></body></html>'

# ---------------------------------------------------------------------------
# Email 3: FedEx Shipping Notification
# ---------------------------------------------------------------------------
send_email "FedEx Shipping Notification" \
  "Your package has shipped - Tracking #789456123012" \
  "TrackingUpdates@fedex.com" \
  '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<div style="background:#4d148c;padding:16px">
  <span style="color:#ff6600;font-size:24px;font-weight:bold">FedEx</span>
</div>
<div style="padding:20px">
  <h2>Your package is on its way!</h2>
  <div style="background:#f4f0fc;padding:16px;border-radius:8px;margin:16px 0">
    <p style="margin:0"><strong>Tracking Number:</strong> 789456123012</p>
    <p style="margin:4px 0 0"><strong>Service:</strong> FedEx 2Day</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px"><strong>Shipped:</strong></td><td style="padding:8px">February 6, 2025</td></tr>
    <tr><td style="padding:8px"><strong>Expected Delivery:</strong></td><td style="padding:8px">Friday, February 8, 2025 by 8:00 PM</td></tr>
    <tr><td style="padding:8px"><strong>From:</strong></td><td style="padding:8px">Memphis, TN 38118</td></tr>
    <tr><td style="padding:8px"><strong>To:</strong></td><td style="padding:8px">San Francisco, CA 94102</td></tr>
  </table>
  <p style="font-size:14px;color:#666">Package shipped by Amazon.com — Order #112-9374856-2938471</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
  <p style="font-size:12px;color:#888">This is an automated shipment notification from FedEx.</p>
</div></body></html>'

# ---------------------------------------------------------------------------
# Email 4: UPS Shipping Notification
# ---------------------------------------------------------------------------
send_email "UPS Shipping Notification" \
  "UPS Ship Notification, Tracking Number 1Z999AA10123456784" \
  "pkginfo@ups.com" \
  '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<div style="background:#351c15;padding:16px">
  <span style="color:#ffb500;font-size:24px;font-weight:bold">UPS</span>
</div>
<div style="padding:20px">
  <h2 style="color:#351c15">Your Package Is On Its Way</h2>
  <div style="background:#fef9f0;padding:16px;border-radius:8px;margin:16px 0">
    <p style="margin:0"><strong>Tracking Number:</strong> 1Z999AA10123456784</p>
    <p style="margin:4px 0 0"><strong>Service:</strong> UPS Ground</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px"><strong>Ship Date:</strong></td><td style="padding:8px">February 5, 2025</td></tr>
    <tr><td style="padding:8px"><strong>Scheduled Delivery:</strong></td><td style="padding:8px">Monday, February 10, 2025</td></tr>
    <tr><td style="padding:8px"><strong>Weight:</strong></td><td style="padding:8px">5.2 lbs</td></tr>
    <tr><td style="padding:8px"><strong>Ship To:</strong></td><td style="padding:8px">456 Oak Avenue, Palo Alto, CA 94301</td></tr>
  </table>
  <p style="font-size:14px;color:#666">Shipped by: Apple Inc.</p>
  <p style="font-size:14px;color:#666">Reference: Order W1284930572</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
  <p style="font-size:12px;color:#888">This notice was sent at the request of the shipper.</p>
</div></body></html>'

# ---------------------------------------------------------------------------
# Email 5: Delivery Confirmation
# ---------------------------------------------------------------------------
send_email "FedEx Delivery Confirmation" \
  "Your FedEx package has been delivered - Tracking #789456123012" \
  "TrackingUpdates@fedex.com" \
  '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<div style="background:#4d148c;padding:16px">
  <span style="color:#ff6600;font-size:24px;font-weight:bold">FedEx</span>
</div>
<div style="padding:20px">
  <div style="background:#e8f5e9;padding:20px;border-radius:8px;text-align:center;margin:16px 0">
    <h2 style="color:#2e7d32;margin:0">Delivered</h2>
    <p style="color:#2e7d32;margin:4px 0 0">Friday, February 8, 2025 at 2:34 PM</p>
  </div>
  <div style="background:#f4f0fc;padding:16px;border-radius:8px;margin:16px 0">
    <p style="margin:0"><strong>Tracking Number:</strong> 789456123012</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px"><strong>Delivered To:</strong></td><td style="padding:8px">Front Door</td></tr>
    <tr><td style="padding:8px"><strong>Signed By:</strong></td><td style="padding:8px">RESIDENT</td></tr>
    <tr><td style="padding:8px"><strong>Delivery Address:</strong></td><td style="padding:8px">123 Main St, Apt 4B, San Francisco, CA 94102</td></tr>
  </table>
  <p style="font-size:14px;color:#666">Package shipped by Amazon.com — Order #112-9374856-2938471</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
  <p style="font-size:12px;color:#888">This is an automated delivery notification from FedEx.</p>
</div></body></html>'

# ---------------------------------------------------------------------------
# Email 6: Return/Refund Confirmation
# ---------------------------------------------------------------------------
send_email "Amazon Return Confirmation" \
  "Your refund for order #112-8847261-5593820 has been processed" \
  "returns@amazon.com" \
  '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<div style="background:#232f3e;padding:16px;text-align:center">
  <span style="color:#fff;font-size:22px;font-weight:bold">amazon</span>
</div>
<div style="padding:20px">
  <h2 style="color:#232f3e">Refund Processed</h2>
  <p>Hello,</p>
  <p>We have processed your refund for the following return:</p>
  <div style="background:#f0faf0;padding:16px;border-radius:8px;margin:16px 0">
    <p style="margin:0;color:#067d06;font-weight:bold">Refund Amount: $49.99</p>
    <p style="margin:4px 0 0;font-size:14px;color:#666">Credited to Visa ending in 4242</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="background:#f3f3f3"><th style="text-align:left;padding:8px">Returned Item</th><th style="text-align:right;padding:8px">Refund</th></tr>
    <tr><td style="padding:8px">Logitech MX Master 3S Wireless Mouse - Graphite</td><td style="text-align:right;padding:8px">$49.99</td></tr>
  </table>
  <p><strong>Return Reason:</strong> Item defective or does not work</p>
  <p><strong>Return ID:</strong> RMA-20250205-88472</p>
  <p style="font-size:14px;color:#666">Please allow 3-5 business days for the refund to appear on your statement.</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
  <p style="font-size:12px;color:#888">Order #112-8847261-5593820</p>
</div></body></html>'

# ---------------------------------------------------------------------------
# Email 7: Tracking Update — Out for Delivery
# ---------------------------------------------------------------------------
send_email "UPS Out for Delivery" \
  "UPS Update: Package Out for Delivery - 1Z999AA10123456784" \
  "pkginfo@ups.com" \
  '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<div style="background:#351c15;padding:16px">
  <span style="color:#ffb500;font-size:24px;font-weight:bold">UPS</span>
</div>
<div style="padding:20px">
  <div style="background:#fff3cd;padding:20px;border-radius:8px;text-align:center;margin:16px 0">
    <h2 style="color:#856404;margin:0">Out for Delivery</h2>
    <p style="color:#856404;margin:4px 0 0">Monday, February 10, 2025</p>
  </div>
  <div style="background:#fef9f0;padding:16px;border-radius:8px;margin:16px 0">
    <p style="margin:0"><strong>Tracking Number:</strong> 1Z999AA10123456784</p>
  </div>
  <h3>Shipment Progress</h3>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
    <tr><td style="padding:6px;color:#888">02/10 6:12 AM</td><td style="padding:6px"><strong>Out for Delivery</strong> — Palo Alto, CA</td></tr>
    <tr><td style="padding:6px;color:#888">02/10 4:30 AM</td><td style="padding:6px">Arrived at Facility — Palo Alto, CA</td></tr>
    <tr><td style="padding:6px;color:#888">02/09 9:15 PM</td><td style="padding:6px">Departed Facility — Oakland, CA</td></tr>
    <tr><td style="padding:6px;color:#888">02/07 2:00 PM</td><td style="padding:6px">In Transit — Reno, NV</td></tr>
    <tr><td style="padding:6px;color:#888">02/05 11:30 AM</td><td style="padding:6px">Shipped — Cupertino, CA</td></tr>
  </table>
  <p><strong>Estimated Delivery:</strong> Today by end of day</p>
  <p style="font-size:14px;color:#666">Shipped by: Apple Inc. — Order W1284930572</p>
</div></body></html>'

# ---------------------------------------------------------------------------
# Email 8: Digital Purchase Receipt (No Shipping)
# ---------------------------------------------------------------------------
send_email "Apple Digital Purchase Receipt" \
  "Your receipt from Apple - Feb 6, 2025" \
  "no_reply@email.apple.com" \
  '<html><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f7">
<div style="background:#fff;padding:32px;border-radius:12px;margin:20px">
  <div style="text-align:center;margin-bottom:24px">
    <span style="font-size:28px;color:#1d1d1f">&#63743; Apple</span>
  </div>
  <h2 style="color:#1d1d1f;text-align:center">Receipt</h2>
  <p style="color:#6e6e73;text-align:center">Your purchase is complete. No shipping required.</p>
  <div style="border:1px solid #d2d2d7;border-radius:8px;overflow:hidden;margin:16px 0">
    <table style="width:100%;border-collapse:collapse">
      <tr style="background:#f5f5f7"><th style="text-align:left;padding:12px">Item</th><th style="text-align:right;padding:12px">Price</th></tr>
      <tr><td style="padding:12px">iCloud+ 2TB Storage Plan (Monthly)</td><td style="text-align:right;padding:12px">$9.99</td></tr>
      <tr><td style="padding:12px">Final Cut Pro — Lifetime License</td><td style="text-align:right;padding:12px">$299.99</td></tr>
      <tr style="background:#f5f5f7"><td style="padding:12px"><strong>Total</strong></td><td style="text-align:right;padding:12px"><strong>$309.98</strong></td></tr>
    </table>
  </div>
  <p><strong>Apple ID:</strong> user@icloud.com</p>
  <p><strong>Date:</strong> February 6, 2025</p>
  <p><strong>Order ID:</strong> MGXK2938471</p>
  <p style="font-size:14px;color:#6e6e73">Billed to: Visa ending in 8821</p>
  <hr style="border:none;border-top:1px solid #d2d2d7;margin:20px 0">
  <p style="font-size:12px;color:#86868b;text-align:center">Apple Media Services | apple.com/bill</p>
</div></body></html>'

echo "=== Done. Sent 8 synthetic emails. ==="
