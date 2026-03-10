"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import EditorLayout from "@/components/editor/EditorLayout";

export default function EditorPage() {
  const params = useSearchParams();

  const productId = params.get("product");
  const variantId = params.get("variant");

  const [product, setProduct] = useState<any>(null);
  const [variant, setVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId || !variantId) return;

    async function load() {
      try {
        const res = await api.get(
          `/products/${productId}`
        );

        // ✅ SUPPORT ALL API RESPONSE TYPES
        const productData =
          res.data?.data ||
          res.data?.product ||
          res.data;

        if (!productData?.variants) {
          console.error(
            "Variants not found in API response",
            productData
          );
          setLoading(false);
          return;
        }

        setProduct(productData);

        const selectedVariant =
          productData.variants.find(
            (v: any) => v.id === variantId
          );

        console.log("[EditorPage] Variant loaded:", {
          variantId,
          selectedVariant,
          hasImages: !!selectedVariant?.images,
          imageCount: selectedVariant?.images?.length,
        });

        setVariant(selectedVariant);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    load();
  }, [productId, variantId]);

  if (loading)
    return (
      <p className="py-20 text-center">
        Loading editor…
      </p>
    );

  // Allow editor to work without product (AI-only mode)
  const defaultProduct = {
    id: "ai-design",
    type: "tshirt",
    productType: "TSHIRT",
  };

  const defaultVariant = {
    id: "default",
    color: "white",
    images: [],
  };

  return (
    <EditorLayout
      product={product || defaultProduct}
      variant={variant || defaultVariant}
    />
  );
}
