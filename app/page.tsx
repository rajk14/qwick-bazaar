import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { categories, products } from "@/lib/catalog-data";
import { Suspense } from "react";

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};
  const query = String(params.q ?? "").toLowerCase();
  const brand = String(params.brand ?? "");
  const sort = String(params.sort ?? "popular");
  const inStock = params.stock === "in";
  const maxPrice = Number(params.maxPrice ?? 0);

  const brands = Array.from(new Set(products.map((product) => product.brandName))).sort();
  const filtered = products
    .filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesBrand = !brand || product.brandName === brand;
      const matchesPrice = !maxPrice || product.sellingPrice <= maxPrice;
      return matchesQuery && matchesBrand && matchesPrice && (!inStock || product.isActive);
    })
    .sort((a, b) => {
      if (sort === "price-low") return a.sellingPrice - b.sellingPrice;
      if (sort === "price-high") return b.sellingPrice - a.sellingPrice;
      if (sort === "newest") return b.sku.localeCompare(a.sku);
      return b.popularity - a.popularity;
    })
    .slice(0, 48);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <section className="mb-7 rounded-[28px] bg-ink px-5 py-6 text-white shadow-soft sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-lime">Qwick Bazaar Grocery</p>
            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Browse daily essentials, fresh produce, snacks, and household needs.
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold sm:min-w-80">
            <div className="rounded-2xl bg-white/10 p-3">
              <span className="block text-xl">20</span>Categories
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <span className="block text-xl">80+</span>Subcategories
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <span className="block text-xl">300+</span>Products
            </div>
          </div>
        </div>
      </section>

      <CategoryGrid categories={categories} />

      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Popular products</h2>
            <p className="text-sm font-medium text-black/55">Search, filter, sort, and add items to cart.</p>
          </div>
          <span className="text-sm font-bold text-black/50">{filtered.length} results</span>
        </div>
        <Suspense fallback={<div className="h-16 rounded-2xl bg-white shadow-sm" />}>
          <SearchFilterBar brands={brands} />
        </Suspense>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
