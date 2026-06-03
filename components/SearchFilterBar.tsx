"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SearchFilterBar({ brands }: { brands: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm md:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr]">
      <input
        className="rounded-xl bg-market px-4 py-3 text-sm font-semibold outline-none ring-leaf/20 focus:ring-4"
        placeholder="Search products"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(event) => update("q", event.target.value)}
      />
      <select
        className="rounded-xl bg-market px-4 py-3 text-sm font-semibold outline-none"
        defaultValue={searchParams.get("brand") ?? ""}
        onChange={(event) => update("brand", event.target.value)}
      >
        <option value="">All brands</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
      <select
        className="rounded-xl bg-market px-4 py-3 text-sm font-semibold outline-none"
        defaultValue={searchParams.get("sort") ?? "popular"}
        onChange={(event) => update("sort", event.target.value)}
      >
        <option value="popular">Popularity</option>
        <option value="price-low">Price low to high</option>
        <option value="price-high">Price high to low</option>
        <option value="newest">Newest</option>
      </select>
      <select
        className="rounded-xl bg-market px-4 py-3 text-sm font-semibold outline-none"
        defaultValue={searchParams.get("maxPrice") ?? ""}
        onChange={(event) => update("maxPrice", event.target.value)}
      >
        <option value="">Any price</option>
        <option value="100">Under Rs 100</option>
        <option value="250">Under Rs 250</option>
        <option value="500">Under Rs 500</option>
      </select>
      <label className="flex items-center justify-center gap-2 rounded-xl bg-market px-4 py-3 text-sm font-black">
        <input
          type="checkbox"
          defaultChecked={searchParams.get("stock") === "in"}
          onChange={(event) => update("stock", event.target.checked ? "in" : "")}
        />
        In stock
      </label>
    </div>
  );
}
