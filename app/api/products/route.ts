import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/catalog-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "popular";

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
      category: categorySlug ? { slug: categorySlug } : undefined,
      brand: brand ? { name: brand } : undefined,
      sellingPrice: maxPrice ? { lte: Number(maxPrice) } : undefined
    },
    include: { category: true, subCategory: true, brand: true, inventory: true },
    orderBy:
      sort === "price-low"
        ? { sellingPrice: "asc" }
        : sort === "price-high"
          ? { sellingPrice: "desc" }
          : sort === "newest"
            ? { createdAt: "desc" }
            : { popularity: "desc" }
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const category = await prisma.category.findUniqueOrThrow({ where: { slug: body.categorySlug } });
  const subCategory = await prisma.subCategory.findFirstOrThrow({
    where: { categoryId: category.id, slug: body.subCategorySlug }
  });
  const brand = await prisma.brand.upsert({
    where: { name: body.brandName ?? "Qwick Select" },
    update: {},
    create: { name: body.brandName ?? "Qwick Select", logoUrl: body.logoUrl }
  });

  const name = body.name as string;
  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      subCategoryId: subCategory.id,
      brandId: brand.id,
      name,
      slug: body.slug ?? slugify(`${name}-${Date.now()}`),
      description: body.description ?? `${name} for quick delivery.`,
      imageUrl: body.imageUrl || category.imageUrl,
      mrp: Number(body.mrp),
      sellingPrice: Number(body.sellingPrice),
      unit: body.unit ?? "pack",
      packSize: body.packSize ?? "1 pack",
      barcode: body.barcode,
      sku: body.sku ?? `QB-${Date.now()}`,
      tags: body.tags ?? [category.slug, subCategory.slug],
      isVeg: Boolean(body.isVeg ?? true),
      isActive: Boolean(body.isActive ?? true)
    }
  });

  return NextResponse.json(product, { status: 201 });
}
