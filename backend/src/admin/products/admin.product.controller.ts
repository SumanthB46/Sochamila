import { Request, Response } from "express";
import * as productService from "./admin.product.service";
import { Gender, ProductDepartment, ProductType } from "@prisma/client";

/* ======================================================
   CREATE PRODUCT
====================================================== */

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      gender,
      department,
      productType,
      isActive,
      colors,
      productImageCount,
      imagePositions,
      shippingPolicy,
      returnPolicy,
    } = req.body;

    /* ---------- VALIDATION ---------- */

    if (!name || !gender || !department || !productType || !colors) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!Object.values(Gender).includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
    }

    if (!Object.values(ProductType).includes(productType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product type",
      });
    }

    /* ---------- PARSE COLORS ---------- */

    let parsedColors: any[] = [];

    try {
      parsedColors =
        typeof colors === "string" ? JSON.parse(colors) : colors;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid colors format",
      });
    }

    /* ---------- FILE HANDLING ---------- */

    const files = req.files as {
      productImages?: Express.Multer.File[];
      colorImages?: Express.Multer.File[];
    };

    const productFiles = files?.productImages ?? [];
    const colorFiles = files?.colorImages ?? [];

    const totalProductImages = Number(productImageCount) || 0;

    /* ---------- PARSE IMAGE POSITIONS ---------- */
    let parsedPositions: string[] = [];
    try {
      parsedPositions = typeof imagePositions === "string" 
        ? JSON.parse(imagePositions) 
        : (imagePositions || []);
    } catch {
      parsedPositions = [];
    }

    /* ---------- PRODUCT-LEVEL IMAGES ---------- */

    const productImages =
      totalProductImages > 0
        ? productFiles.slice(0, totalProductImages).map((file, index) => ({
            imageUrl: `/uploads/${file.filename}`,
            sortOrder: index,
            isPrimary: index === 0,
            position: parsedPositions[index] || "other",
          }))
        : [];

    /* ---------- COLOR-LEVEL IMAGES ---------- */

    let colorFileCursor = 0;

    const colorsWithImages = parsedColors.map((color) => {
      const imageCount = Number(color.imageCount) || 0;

      const images =
        imageCount > 0
          ? colorFiles
              .slice(colorFileCursor, colorFileCursor + imageCount)
              .map((file, index) => ({
                imageUrl: `/uploads/${file.filename}`,
                sortOrder: index,
              }))
          : [];

      colorFileCursor += imageCount;

      return {
        name: color.name,
        hexCode: color.hexCode ?? null,
        images,
        sizes: color.sizes ?? [],
      };
    });

    /* ---------- CREATE PRODUCT ---------- */

    const product = await productService.createProduct({
      name: name.trim(),
      description: description?.trim() || null,
      gender,
      department,
      productType,
      isActive: isActive !== "false",
      shippingPolicy: shippingPolicy?.trim() || undefined,
      returnPolicy: returnPolicy?.trim() || undefined,
      images: productImages,
      colors: colorsWithImages,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ======================================================
   GET ALL PRODUCTS (ADMIN)
====================================================== */

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/* ======================================================
   GET PRODUCT BY ID
====================================================== */

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(req.params.id as string);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

/* ======================================================
   UPDATE PRODUCT
====================================================== */

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProduct(
      req.params.id as string,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

/* ======================================================
   UPDATE ACTIVE STATUS
====================================================== */

export const updateProductStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { isActive } = req.body;

    const product = await productService.updateProductStatus(
      req.params.id as string,
      Boolean(isActive)
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

/* ======================================================
   DELETE PRODUCT
====================================================== */

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    const msg = (error as any)?.message || "Failed to delete product";
    if (msg.includes("associated orders")) {
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};
