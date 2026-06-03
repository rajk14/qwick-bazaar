"use client";

import { FormEvent, useMemo, useState } from "react";
import { categories, products } from "@/lib/catalog-data";

type Tab = "categories" | "subcategories" | "products" | "stock" | "bulk";

export default function AdminCatalogPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [message, setMessage] = useState("");
  const [csv, setCsv] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    categorySlug: categories[0].slug,
    subCategorySlug: categories[0].subcategories[0].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    brandName: "Qwick Select",
    mrp: "99",
    sellingPrice: "89",
    imageUrl: ""
  });

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === productForm.categorySlug) ?? categories[0],
    [productForm.categorySlug]
  );

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("Saving product...");
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productForm,
        description: `${productForm.name} listed from admin catalog.`,
        unit: "pack",
        packSize: "1 pack",
        tags: [productForm.categorySlug, productForm.subCategorySlug],
        isVeg: true,
        isActive: true
      })
    });
    setMessage(response.ok ? "Product saved." : "Product save failed. Check database setup.");
  };

  const submitCsv = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("Uploading CSV...");
    const response = await fetch("/api/admin/bulk-upload", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csv
    });
    setMessage(response.ok ? "CSV processed." : "CSV upload failed. Check database setup.");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black text-leaf">Admin</p>
          <h1 className="text-4xl font-black">Catalog management</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-black/55">
            Manage categories, subcategories, products, bulk uploads, prices, images, stock, and active status.
          </p>
        </div>
        {message && <span className="rounded-full bg-lime px-4 py-2 text-sm font-black text-leaf">{message}</span>}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["products", "categories", "subcategories", "stock", "bulk"] as Tab[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`pressable rounded-full px-4 py-2 text-sm font-black ${
              tab === item ? "bg-ink text-white" : "bg-white text-black/60"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <form onSubmit={submitProduct} className="h-fit rounded-[28px] bg-white p-5 shadow-soft">
            <h2 className="mb-4 text-xl font-black">Add product</h2>
            <div className="space-y-3">
              <input
                className="w-full rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
                placeholder="Product name"
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                required
              />
              <select
                className="w-full rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
                value={productForm.categorySlug}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    categorySlug: event.target.value,
                    subCategorySlug:
                      categories.find((category) => category.slug === event.target.value)?.subcategories[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") ??
                      ""
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
                value={productForm.subCategorySlug}
                onChange={(event) => setProductForm({ ...productForm, subCategorySlug: event.target.value })}
              >
                {activeCategory.subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
                    {subcategory}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
                placeholder="Brand"
                value={productForm.brandName}
                onChange={(event) => setProductForm({ ...productForm, brandName: event.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
                  placeholder="MRP"
                  value={productForm.mrp}
                  onChange={(event) => setProductForm({ ...productForm, mrp: event.target.value })}
                />
                <input
                  className="rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
                  placeholder="Selling price"
                  value={productForm.sellingPrice}
                  onChange={(event) => setProductForm({ ...productForm, sellingPrice: event.target.value })}
                />
              </div>
              <input
                className="w-full rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
                placeholder="Cloudinary/S3 image URL"
                value={productForm.imageUrl}
                onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
              />
              <button className="pressable w-full rounded-2xl bg-leaf px-5 py-4 font-black text-white">
                Save product
              </button>
            </div>
          </form>
          <CatalogTable />
        </section>
      )}

      {tab === "categories" && <EntityPanel title="Categories" endpoint="/api/categories" fields={["name", "slug", "imageUrl", "sortOrder", "isActive"]} />}
      {tab === "subcategories" && <EntityPanel title="Subcategories" endpoint="/api/subcategories" fields={["categoryId", "name", "slug", "imageUrl", "sortOrder"]} />}
      {tab === "stock" && <EntityPanel title="Stock management" endpoint="/api/inventory" fields={["productId", "storeId", "stock", "lowStockThreshold"]} />}
      {tab === "bulk" && (
        <form onSubmit={submitCsv} className="rounded-[28px] bg-white p-5 shadow-soft">
          <h2 className="text-xl font-black">Bulk upload CSV</h2>
          <p className="mt-2 text-sm font-medium text-black/55">
            Columns: name,categorySlug,subCategorySlug,brandName,mrp,sellingPrice,imageUrl,packSize,unit
          </p>
          <textarea
            className="mt-4 min-h-72 w-full rounded-2xl bg-market p-4 font-mono text-sm outline-none"
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            placeholder="name,categorySlug,subCategorySlug,brandName,mrp,sellingPrice,imageUrl,packSize,unit"
          />
          <button className="pressable mt-4 rounded-2xl bg-leaf px-5 py-3 font-black text-white">Upload CSV</button>
        </form>
      )}
    </main>
  );
}

function EntityPanel({ title, endpoint, fields }: { title: string; endpoint: string; fields: string[] }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setMessage(response.ok ? "Saved." : "Save failed. Check database setup.");
  };

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-soft">
      <h2 className="text-xl font-black">{title}</h2>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <input
            key={field}
            className="rounded-2xl bg-market px-4 py-3 font-semibold outline-none"
            placeholder={field}
            value={form[field] ?? ""}
            onChange={(event) => setForm({ ...form, [field]: event.target.value })}
          />
        ))}
        <button className="pressable rounded-2xl bg-leaf px-5 py-3 font-black text-white md:col-span-2">Save</button>
      </form>
      {message && <p className="mt-3 text-sm font-black text-leaf">{message}</p>}
      <p className="mt-4 text-sm font-medium text-black/50">
        Edit/delete/toggle operations are available through the matching API endpoints with PUT, DELETE, and PATCH.
      </p>
    </section>
  );
}

function CatalogTable() {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-xl font-black">Sample catalog</h2>
      <div className="overflow-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase text-black/40">
            <tr>
              <th className="py-3">Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>MRP</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 18).map((product) => (
              <tr key={product.slug} className="border-t border-black/[0.06]">
                <td className="py-3 font-black">{product.name}</td>
                <td className="font-semibold text-black/55">{product.categorySlug}</td>
                <td className="font-semibold text-black/55">{product.brandName}</td>
                <td className="font-semibold text-black/55">Rs {product.mrp}</td>
                <td className="font-black">Rs {product.sellingPrice}</td>
                <td>
                  <span className="rounded-full bg-lime px-3 py-1 text-xs font-black text-leaf">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
