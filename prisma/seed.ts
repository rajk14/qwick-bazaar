import { PrismaClient } from "@prisma/client";
import { brands, categories, products, slugify, stores } from "../lib/catalog-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.store.deleteMany();

  const brandMap = new Map<string, string>();
  for (const brand of brands) {
    const record = await prisma.brand.create({ data: brand });
    brandMap.set(record.name, record.id);
  }

  const categoryMap = new Map<string, string>();
  const subCategoryMap = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl,
        sortOrder: category.sortOrder,
        isActive: category.isActive
      }
    });
    categoryMap.set(category.slug, record.id);

    for (const [index, subcategory] of category.subcategories.entries()) {
      const subSlug = slugify(subcategory);
      const subRecord = await prisma.subCategory.create({
        data: {
          categoryId: record.id,
          name: subcategory,
          slug: subSlug,
          imageUrl: `https://images.unsplash.com/800x600/?${encodeURIComponent(subcategory)},grocery`,
          sortOrder: index + 1
        }
      });
      subCategoryMap.set(`${category.slug}:${subSlug}`, subRecord.id);
    }
  }

  const storeRecords = [];
  for (const store of stores) {
    storeRecords.push(await prisma.store.create({ data: store }));
  }

  for (const product of products) {
    const productRecord = await prisma.product.create({
      data: {
        categoryId: categoryMap.get(product.categorySlug)!,
        subCategoryId: subCategoryMap.get(`${product.categorySlug}:${product.subCategorySlug}`)!,
        brandId: brandMap.get(product.brandName),
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.imageUrl,
        mrp: product.mrp,
        sellingPrice: product.sellingPrice,
        unit: product.unit,
        packSize: product.packSize,
        barcode: product.barcode,
        sku: product.sku,
        tags: product.tags,
        isVeg: product.isVeg,
        isActive: product.isActive,
        popularity: product.popularity
      }
    });

    for (const [index, store] of storeRecords.entries()) {
      await prisma.inventory.create({
        data: {
          productId: productRecord.id,
          storeId: store.id,
          stock: 12 + ((productRecord.sku.length + index * 7) % 90),
          lowStockThreshold: 8
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
