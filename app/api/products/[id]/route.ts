import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      mrp: body.mrp === undefined ? undefined : Number(body.mrp),
      sellingPrice: body.sellingPrice === undefined ? undefined : Number(body.sellingPrice),
      unit: body.unit,
      packSize: body.packSize,
      barcode: body.barcode,
      sku: body.sku,
      tags: body.tags,
      isVeg: body.isVeg,
      isActive: body.isActive
    }
  });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      isActive: body.isActive,
      mrp: body.mrp === undefined ? undefined : Number(body.mrp),
      sellingPrice: body.sellingPrice === undefined ? undefined : Number(body.sellingPrice)
    }
  });
  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
