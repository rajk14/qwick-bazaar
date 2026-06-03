import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { subCategories: true },
    orderBy: { sortOrder: "asc" }
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      imageUrl: body.imageUrl,
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: body.isActive === "false" ? false : Boolean(body.isActive ?? true)
    }
  });
  return NextResponse.json(category, { status: 201 });
}
