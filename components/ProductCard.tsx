"use client";

import { useRouter } from "next/navigation";
import type { ProductSeed } from "@/lib/catalog-data";

type CartItem = ProductSeed & { quantity: number };

const readCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem("qwick_cart") ?? "[]") as CartItem[];
  } catch {
    return [];
  }
};

const writeCart = (items: CartItem[]) => {
  localStorage.setItem("qwick_cart", JSON.stringify(items));
};

export default function ProductCard({ product }: { product: ProductSeed }) {
  const router = useRouter();
  const discount = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  const addToCart = () => {
    const isLoggedIn = localStorage.getItem("qwick_user") === "true";
    if (!isLoggedIn) {
      localStorage.setItem("qwick_pending_cart_item", JSON.stringify(product));
      router.push("/login?next=/cart");
      return;
    }

    const cart = readCart();
    const existing = cart.find((item) => item.slug === product.slug);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    writeCart(cart);
    router.push("/cart");
  };

  return (
    <article className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-market">
        <img className="h-full w-full object-cover" src={product.imageUrl} alt={product.name} />
        <span className="absolute left-2 top-2 rounded-full bg-leaf px-2 py-1 text-[10px] font-black text-white">
          {discount}% OFF
        </span>
      </div>
      <div className="min-h-24">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-black/40">{product.packSize}</p>
        <h3 className="line-clamp-2 text-sm font-black leading-5">{product.name}</h3>
        <p className="mt-1 text-xs font-medium text-black/45">{product.brandName}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black">Rs {product.sellingPrice}</p>
          <p className="text-xs font-bold text-black/35 line-through">Rs {product.mrp}</p>
        </div>
        <button
          onClick={addToCart}
          className="pressable rounded-xl border border-leaf bg-lime px-4 py-2 text-xs font-black text-leaf"
        >
          ADD
        </button>
      </div>
    </article>
  );
}
