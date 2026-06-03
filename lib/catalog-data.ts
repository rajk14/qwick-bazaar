export type CategorySeed = {
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  subcategories: string[];
};

export type BrandSeed = {
  name: string;
  logoUrl: string;
};

export type ProductSeed = {
  categorySlug: string;
  subCategorySlug: string;
  brandName: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  mrp: number;
  sellingPrice: number;
  unit: string;
  packSize: string;
  barcode: string;
  sku: string;
  tags: string[];
  isVeg: boolean;
  isActive: boolean;
  popularity: number;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const img = (query: string) =>
  `https://images.unsplash.com/800x600/?${encodeURIComponent(query)},grocery,product`;

export const categories: CategorySeed[] = [
  ["Paan Corner", ["Paan Essentials", "Mouth Fresheners", "Digestives"]],
  ["Dairy, Bread & Eggs", ["Milk", "Bread", "Eggs", "Paneer", "Butter", "Cheese", "Curd"]],
  ["Fruits & Vegetables", ["Fresh Fruits", "Fresh Vegetables", "Leafy Vegetables", "Exotic Fruits"]],
  ["Cold Drinks & Juices", ["Soft Drinks", "Juices", "Energy Drinks", "Water"]],
  ["Snacks & Munchies", ["Chips", "Namkeen", "Biscuits", "Popcorn", "Nachos"]],
  ["Breakfast & Instant Food", ["Corn Flakes", "Oats", "Noodles", "Pasta", "Poha"]],
  ["Sweet Tooth", ["Chocolate", "Ice Cream", "Sweets", "Cakes", "Candies"]],
  ["Bakery & Biscuits", ["Cookies", "Rusk", "Cakes", "Buns"]],
  ["Tea, Coffee & Milk Drinks", ["Tea", "Coffee", "Milk Drinks"]],
  ["Atta, Rice & Dal", ["Atta", "Rice", "Dal", "Sugar", "Salt"]],
  ["Masala, Oil & More", ["Spices", "Cooking Oil", "Ghee", "Pickles"]],
  ["Sauces & Spreads", ["Ketchup", "Mayonnaise", "Jams", "Spreads"]],
  ["Chicken, Meat & Fish", ["Chicken", "Fish", "Mutton", "Cold Cuts"]],
  ["Organic & Healthy Living", ["Organic Staples", "Healthy Snacks", "Seeds", "Millets"]],
  ["Baby Care", ["Diapers", "Baby Food", "Baby Wipes"]],
  ["Pharma & Wellness", ["OTC Medicine", "First Aid", "Health Drinks"]],
  ["Cleaning Essentials", ["Detergent", "Dishwash", "Floor Cleaner", "Toilet Cleaner"]],
  ["Home & Office", ["Stationery", "Kitchen Tools", "Storage", "Pooja Needs"]],
  ["Personal Care", ["Shampoo", "Soap", "Face Wash", "Toothpaste"]],
  ["Pet Care", ["Dog Food", "Cat Food", "Pet Treats"]]
].map(([name, subcategories], index) => ({
  name: name as string,
  slug: slugify(name as string),
  imageUrl: img(name as string),
  sortOrder: index + 1,
  isActive: true,
  subcategories: subcategories as string[]
}));

export const brands: BrandSeed[] = [
  "Amul",
  "Britannia",
  "Mother Dairy",
  "Tata Sampann",
  "Aashirvaad",
  "Fortune",
  "Haldiram's",
  "Lay's",
  "Coca-Cola",
  "Real",
  "Maggi",
  "Kellogg's",
  "Dabur",
  "Himalaya",
  "Surf Excel",
  "Harpic",
  "Pedigree",
  "Whiskas",
  "Fresh Farm",
  "Qwick Select"
].map((name) => ({ name, logoUrl: img(`${name} logo`) }));

const productNames: Record<string, string[]> = {
  milk: ["Toned Milk", "Full Cream Milk", "Cow Milk", "Double Toned Milk"],
  bread: ["White Bread", "Brown Bread", "Multigrain Bread", "Sandwich Bread"],
  eggs: ["Farm Eggs", "Protein Eggs", "Brown Eggs", "Country Eggs"],
  "fresh-fruits": ["Banana", "Apple", "Orange", "Pomegranate"],
  "fresh-vegetables": ["Tomato", "Potato", "Onion", "Carrot"],
  "soft-drinks": ["Cola Bottle", "Lemon Soda", "Orange Soda", "Club Soda"],
  juices: ["Mango Juice", "Mixed Fruit Juice", "Apple Juice", "Guava Juice"],
  chips: ["Classic Salted Chips", "Masala Chips", "Cream Onion Chips", "Peri Peri Chips"],
  namkeen: ["Aloo Bhujia", "Moong Dal", "Khatta Meetha", "Masala Peanuts"],
  chocolate: ["Milk Chocolate", "Dark Chocolate", "Choco Bar", "Wafer Chocolate"],
  atta: ["Whole Wheat Atta", "Multigrain Atta", "Chakki Atta", "Sharbati Atta"],
  rice: ["Basmati Rice", "Sona Masoori Rice", "Brown Rice", "Mini Mogra Rice"],
  dal: ["Toor Dal", "Moong Dal", "Masoor Dal", "Chana Dal"],
  spices: ["Turmeric Powder", "Red Chilli Powder", "Coriander Powder", "Garam Masala"],
  "cooking-oil": ["Sunflower Oil", "Mustard Oil", "Groundnut Oil", "Rice Bran Oil"],
  diapers: ["Baby Diapers Small", "Baby Diapers Medium", "Baby Diapers Large", "Baby Pants"],
  shampoo: ["Anti Hairfall Shampoo", "Daily Care Shampoo", "Dandruff Shampoo", "Herbal Shampoo"],
  toothpaste: ["Fresh Gel Toothpaste", "Complete Care Toothpaste", "Salt Toothpaste", "Kids Toothpaste"],
  "dog-food": ["Chicken Dog Food", "Puppy Food", "Adult Dog Food", "Dog Biscuits"],
  "cat-food": ["Tuna Cat Food", "Chicken Cat Food", "Kitten Food", "Cat Crunchies"]
};

const fallbackProducts = ["Classic Pack", "Family Pack", "Value Pack", "Premium Pack"];
const packSizes = ["100 g", "200 g", "250 g", "500 g", "1 kg", "1 L", "2 pcs", "6 pcs"];

export const products: ProductSeed[] = categories.flatMap((category, categoryIndex) =>
  category.subcategories.flatMap((subcategory, subIndex) => {
    const subSlug = slugify(subcategory);
    const names = productNames[subSlug] ?? fallbackProducts.map((name) => `${subcategory} ${name}`);
    return names.map((name, productIndex) => {
      const index = categoryIndex * 100 + subIndex * 10 + productIndex + 1;
      const mrp = 45 + ((index * 17) % 450);
      const discount = 5 + ((index * 7) % 28);
      const sellingPrice = Math.max(10, Math.round(mrp - (mrp * discount) / 100));
      const brand = brands[index % brands.length].name;
      const productName = `${brand} ${name}`;
      return {
        categorySlug: category.slug,
        subCategorySlug: subSlug,
        brandName: brand,
        name: productName,
        slug: slugify(`${productName}-${category.slug}-${subSlug}`),
        description: `${productName} for fast daily grocery delivery.`,
        imageUrl: img(productName),
        mrp,
        sellingPrice,
        unit: subcategory.includes("Milk") || subcategory.includes("Juice") ? "litre" : "pack",
        packSize: packSizes[index % packSizes.length],
        barcode: `890${String(index).padStart(10, "0")}`,
        sku: `QB-${String(index).padStart(6, "0")}`,
        tags: [category.slug, subSlug, brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")],
        isVeg: !["chicken-meat-and-fish", "eggs"].includes(category.slug) && subSlug !== "eggs",
        isActive: true,
        popularity: 1000 - index
      };
    });
  })
);

export const stores = [
  {
    name: "Qwick Bazaar Bhagalpur Central",
    city: "Bhagalpur",
    area: "Khalifabagh",
    pincode: "812001",
    latitude: 25.2425,
    longitude: 86.9842
  },
  {
    name: "Qwick Bazaar Tilkamanjhi",
    city: "Bhagalpur",
    area: "Tilkamanjhi",
    pincode: "812001",
    latitude: 25.251,
    longitude: 87.007
  }
];
