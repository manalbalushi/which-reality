import fs from "node:fs";
import path from "node:path";
import { products as seedProducts } from "@/data/products";
import { categories as seedCategories } from "@/data/categories";
import { occasions as seedOccasions } from "@/data/occasions";
import { packagingTypes as seedPackaging } from "@/data/packaging";
import {
  Product,
  Category,
  Occasion,
  Packaging,
  Order,
  CorporateRequest,
} from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readFile<T>(name: string, fallback: T): T {
  ensureDir();
  const file = path.join(dataDir, name);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeFile<T>(name: string, data: T) {
  ensureDir();
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2));
}

export const store = {
  getProducts: (): Product[] => readFile("products.json", seedProducts),
  saveProducts: (data: Product[]) => writeFile("products.json", data),

  getCategories: (): Category[] => readFile("categories.json", seedCategories),
  saveCategories: (data: Category[]) => writeFile("categories.json", data),

  getOccasions: (): Occasion[] => readFile("occasions.json", seedOccasions),
  saveOccasions: (data: Occasion[]) => writeFile("occasions.json", data),

  getPackaging: (): Packaging[] => readFile("packaging.json", seedPackaging),
  savePackaging: (data: Packaging[]) => writeFile("packaging.json", data),

  getOrders: (): Order[] => readFile("orders.json", [] as Order[]),
  saveOrders: (data: Order[]) => writeFile("orders.json", data),

  getCorporateRequests: (): CorporateRequest[] =>
    readFile("corporate-requests.json", [] as CorporateRequest[]),
  saveCorporateRequests: (data: CorporateRequest[]) =>
    writeFile("corporate-requests.json", data),
};

export function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
