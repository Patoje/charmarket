import { getProducts, getCategories } from "@/app/actions/products";
import { ProductClient } from "./ProductClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <ProductClient products={products} categories={categories} />
  );
}
