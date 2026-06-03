import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const inventory = await prisma.inventory.findMany({
    include: { product: true, store: true },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(inventory);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const inventory = await prisma.inventory.upsert({
    where: {
      productId_storeId: {
        productId: body.productId,
        storeId: body.storeId
      }
    },
    update: {
      stock: Number(body.stock),
      lowStockThreshold: Number(body.lowStockThreshold ?? 5)
    },
    create: {
      productId: body.productId,
      storeId: body.storeId,
      stock: Number(body.stock),
      lowStockThreshold: Number(body.lowStockThreshold ?? 5)
    }
  });
  return NextResponse.json(inventory);
}
