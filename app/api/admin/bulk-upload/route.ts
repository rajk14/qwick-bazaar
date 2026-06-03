import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/catalog-data";

export async function POST(request: NextRequest) {
  const csv = await request.text();
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((item) => item.trim());
  const rows = lines
    .filter(Boolean)
    .map((line) =>
      Object.fromEntries(
        line.split(",").map((value, index) => [headers[index], value.trim()])
      )
    );

  let created = 0;
  for (const row of rows) {
    const category = await prisma.category.findUnique({ where: { slug: row.categorySlug } });
    if (!category) continue;
    const subCategory = await prisma.subCategory.findFirst({
      where: { categoryId: category.id, slug: row.subCategorySlug }
    });
    if (!subCategory) continue;
    const brand = await prisma.brand.upsert({
      where: { name: row.brandName || "Qwick Select" },
      update: {},
      create: { name: row.brandName || "Qwick Select" }
    });

    await prisma.product.create({
      data: {
        categoryId: category.id,
        subCategoryId: subCategory.id,
        brandId: brand.id,
        name: row.name,
        slug: slugify(`${row.name}-${Date.now()}-${created}`),
        description: row.description || `${row.name} for quick delivery.`,
        imageUrl: row.imageUrl || category.imageUrl,
        mrp: Number(row.mrp),
        sellingPrice: Number(row.sellingPrice),
        unit: row.unit || "pack",
        packSize: row.packSize || "1 pack",
        sku: row.sku || `QB-BULK-${Date.now()}-${created}`,
        tags: [row.categorySlug, row.subCategorySlug],
        isVeg: true,
        isActive: true
      }
    });
    created += 1;
  }

  return NextResponse.json({ created });
}
