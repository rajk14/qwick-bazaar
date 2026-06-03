import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { categories, products } from "@/lib/catalog-data";
import { Suspense } from "react";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const queryParams = (await searchParams) ?? {};
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-black">Category not found</h1>
        <Link className="mt-4 inline-block font-bold text-leaf" href="/">
          Back to shop
        </Link>
      </main>
    );
  }

  const query = String(queryParams.q ?? "").toLowerCase();
  const brand = String(queryParams.brand ?? "");
  const sort = String(queryParams.sort ?? "popular");
  const maxPrice = Number(queryParams.maxPrice ?? 0);
  const categoryProducts = products
    .filter((product) => product.categorySlug === slug)
    .filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query);
      const matchesBrand = !brand || product.brandName === brand;
      const matchesPrice = !maxPrice || product.sellingPrice <= maxPrice;
      return matchesQuery && matchesBrand && matchesPrice;
    })
    .sort((a, b) => {
      if (sort === "price-low") return a.sellingPrice - b.sellingPrice;
      if (sort === "price-high") return b.sellingPrice - a.sellingPrice;
      if (sort === "newest") return b.sku.localeCompare(a.sku);
      return b.popularity - a.popularity;
    });
  const brands = Array.from(new Set(categoryProducts.map((product) => product.brandName))).sort();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link className="mb-5 inline-block text-sm font-black text-leaf" href="/">
        Back to categories
      </Link>
      <section className="mb-6 overflow-hidden rounded-[28px] bg-ink text-white shadow-soft">
        <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="p-6 sm:p-8">
            <p className="mb-2 text-sm font-bold text-lime">Category</p>
            <h1 className="text-4xl font-black">{category.name}</h1>
            <p className="mt-3 max-w-xl text-sm font-medium text-white/70">
              Browse curated products, compare prices, filter by brand, and add essentials to cart.
            </p>
          </div>
          <img className="h-64 w-full object-cover" src={category.imageUrl} alt={category.name} />
        </div>
      </section>
      <Suspense fallback={<div className="h-16 rounded-2xl bg-white shadow-sm" />}>
        <SearchFilterBar brands={brands} />
      </Suspense>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categoryProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </main>
  );
}
