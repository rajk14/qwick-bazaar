"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProductSeed } from "@/lib/catalog-data";

type CartItem = ProductSeed & { quantity: number };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (localStorage.getItem("qwick_user") !== "true") {
      window.location.href = "/login?next=/cart";
      return;
    }
    setItems(JSON.parse(localStorage.getItem("qwick_cart") ?? "[]"));
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0),
    [items]
  );

  const updateQuantity = (slug: string, quantity: number) => {
    const next = items
      .map((item) => (item.slug === slug ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    setItems(next);
    localStorage.setItem("qwick_cart", JSON.stringify(next));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-black">Your cart</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-[28px] bg-white p-8 text-center shadow-soft">
          <p className="font-bold text-black/55">Your cart is empty.</p>
          <Link className="mt-4 inline-block rounded-2xl bg-leaf px-5 py-3 font-black text-white" href="/">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.slug} className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm">
                <img className="h-24 w-24 rounded-xl object-cover" src={item.imageUrl} alt={item.name} />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h2 className="font-black">{item.name}</h2>
                    <p className="text-sm font-bold text-black/45">{item.packSize}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-black">Rs {item.sellingPrice}</p>
                    <div className="flex items-center rounded-xl bg-market p-1">
                      <button className="px-3 py-1 font-black" onClick={() => updateQuantity(item.slug, item.quantity - 1)}>
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-black">{item.quantity}</span>
                      <button className="px-3 py-1 font-black" onClick={() => updateQuantity(item.slug, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-[28px] bg-ink p-5 text-white shadow-soft">
            <h2 className="text-xl font-black">Bill details</h2>
            <div className="mt-4 flex justify-between text-sm font-bold text-white/70">
              <span>Items</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="mt-3 flex justify-between text-lg font-black">
              <span>Total</span>
              <span>Rs {total}</span>
            </div>
            <button className="pressable mt-5 w-full rounded-2xl bg-lime px-5 py-4 font-black text-ink">
              Proceed to checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
