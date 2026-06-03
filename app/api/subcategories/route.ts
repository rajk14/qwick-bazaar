import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subcategories = await prisma.subCategory.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" }
  });
  return NextResponse.json(subcategories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const subcategory = await prisma.subCategory.create({
    data: {
      categoryId: body.categoryId,
      name: body.name,
      slug: body.slug,
      imageUrl: body.imageUrl,
      sortOrder: Number(body.sortOrder ?? 0)
    }
  });
  return NextResponse.json(subcategory, { status: 201 });
}
