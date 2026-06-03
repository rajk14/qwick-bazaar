import Link from "next/link";
import type { CategorySeed } from "@/lib/catalog-data";

export default function CategoryGrid({ categories }: { categories: CategorySeed[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">Shop by category</h2>
          <p className="text-sm font-medium text-black/55">Fast grocery discovery for Indian households.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="pressable hover-lift min-h-36 rounded-2xl border border-black/[0.04] bg-[#f1f3ee] p-3 text-center shadow-sm"
          >
            <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-white">
              <img className="h-full w-full object-cover" src={category.imageUrl} alt={category.name} />
            </div>
            <span className="block text-xs font-black leading-4 text-ink">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
