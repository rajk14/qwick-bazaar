import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const subcategory = await prisma.subCategory.update({
    where: { id },
    data: {
      categoryId: body.categoryId,
      name: body.name,
      slug: body.slug,
      imageUrl: body.imageUrl,
      sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder)
    }
  });
  return NextResponse.json(subcategory);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.subCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
