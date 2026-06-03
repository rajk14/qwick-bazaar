"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-[calc(100vh-73px)] place-items-center px-4 py-10">Loading...</main>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem("qwick_user", "true");
    localStorage.setItem("qwick_user_phone", phone);

    const pending = localStorage.getItem("qwick_pending_cart_item");
    if (pending) {
      const product = JSON.parse(pending);
      const cart = JSON.parse(localStorage.getItem("qwick_cart") ?? "[]");
      const existing = cart.find((item: { slug: string }) => item.slug === product.slug);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("qwick_cart", JSON.stringify(cart));
      localStorage.removeItem("qwick_pending_cart_item");
    }

    router.push(searchParams.get("next") ?? "/cart");
  };

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-soft">
        <p className="text-sm font-black text-leaf">Login required</p>
        <h1 className="mt-2 text-3xl font-black">Continue to cart</h1>
        <p className="mt-2 text-sm font-medium text-black/55">
          Add your mobile number to continue. After login, your selected product opens in cart automatically.
        </p>
        <label className="mt-6 block text-sm font-black">Mobile number</label>
        <input
          required
          minLength={10}
          maxLength={10}
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
          className="mt-2 w-full rounded-2xl bg-market px-4 py-4 text-lg font-black outline-none ring-leaf/20 focus:ring-4"
          placeholder="9876543210"
        />
        <button className="pressable mt-5 w-full rounded-2xl bg-leaf px-5 py-4 font-black text-white">
          Login and open cart
        </button>
      </form>
    </main>
  );
}
