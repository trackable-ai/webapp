import { withAuth } from "@/lib/supabase/auth";
import { ingestImage } from "@/lib/trackable-agent/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      // Parse request body
      const body = await request.json();
      const { image_data, filename } = body;

      if (!image_data) {
        return NextResponse.json(
          { error: "image_data is required" },
          { status: 400 },
        );
      }

      // Call backend to extract order details from image
      const result = await ingestImage(
        {
          image_data,
          filename,
        },
        user.id,
      );

      if (!result.success) {
        return NextResponse.json(
          {
            error: result.error || "Failed to process image",
            // Return empty extracted data so user can fill in manually
            extracted: null,
          },
          { status: 200 }, // Return 200 so client can still proceed
        );
      }

      return NextResponse.json({
        success: true,
        job_id: result.job_id,
        source_id: result.source_id,
        status: result.status,
        extracted: result.extracted,
      });
    } catch (error) {
      console.error("Upload route error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
