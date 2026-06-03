import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    imageUrl: body.imageUrl,
    message: "Send a Cloudinary or S3 URL in imageUrl. Binary upload can be connected to your provider here."
  });
}
