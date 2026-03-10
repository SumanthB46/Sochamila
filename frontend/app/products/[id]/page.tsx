import ProductClient from "@/components/products/ProductClient";
import { Product } from "@/types/product";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: Props) {
  // ✅ REQUIRED IN NEXT 14
  const { id } = await params;

  const res = await fetch(
    `http://localhost:5000/api/products/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <div className="p-10 text-center text-red-600">
        Product Not Found
      </div>
    );
  }

  const json = await res.json();

  //  extract actual product
  const product: Product = json.data;

  return <ProductClient product={product} />;
}
