import prisma from "../../lib/prisma";

/* =========================================================
   TYPES
========================================================= */

export interface IGraphic {
  id: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   GET ALL GRAPHICS
========================================================= */

export const getAllGraphics = async (): Promise<IGraphic[]> => {
  try {
    return await prisma.graphic.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("[GraphicsService] getAllGraphics error:", error);
    throw new Error("Failed to fetch graphics");
  }
};

/* =========================================================
   GET GRAPHIC BY ID
========================================================= */

export const getGraphicById = async (
  id: string
): Promise<IGraphic | null> => {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid graphic ID");
  }

  try {
    return await prisma.graphic.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("[GraphicsService] getGraphicById error:", error);
    throw new Error("Failed to fetch graphic");
  }
};

/* =========================================================
   CREATE GRAPHICS (UPLOAD)
========================================================= */

export const createGraphics = async (
  files: Express.Multer.File[]
): Promise<IGraphic[]> => {
  // Validation
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error("No files provided");
  }

  if (files.length > 50) {
    throw new Error("Maximum 50 files allowed per upload");
  }

  // Validate each file
  for (const file of files) {
    if (!file.filename) {
      throw new Error("Invalid file: missing filename");
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.filename} exceeds 10MB limit`);
    }
  }

  try {
    // Use transaction for atomicity
    const graphics = await prisma.$transaction(
      files.map((file) =>
        prisma.graphic.create({
          data: {
            imageUrl: `/uploads/${file.filename}`,
          },
          select: {
            id: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      )
    );

    console.log(
      `[GraphicsService] Successfully created ${graphics.length} graphics`
    );
    return graphics;
  } catch (error) {
    console.error("[GraphicsService] createGraphics error:", error);
    throw new Error("Failed to upload graphics");
  }
};

/* =========================================================
   DELETE GRAPHIC
========================================================= */

export const deleteGraphic = async (id: string): Promise<IGraphic> => {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid graphic ID");
  }

  try {
    const graphic = await prisma.graphic.findUnique({
      where: { id },
    });

    if (!graphic) {
      throw new Error("Graphic not found");
    }

    const deleted = await prisma.graphic.delete({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`[GraphicsService] Deleted graphic: ${id}`);
    return deleted;
  } catch (error) {
    console.error("[GraphicsService] deleteGraphic error:", error);
    if (error instanceof Error && error.message === "Graphic not found") {
      throw error;
    }
    throw new Error("Failed to delete graphic");
  }
};

/* =========================================================
   DELETE MULTIPLE GRAPHICS
========================================================= */

export const deleteMultipleGraphics = async (
  ids: string[]
): Promise<{ deletedCount: number }> => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  if (ids.length > 100) {
    throw new Error("Maximum 100 items can be deleted at once");
  }

  if (!ids.every((id) => typeof id === "string" && id.length > 0)) {
    throw new Error("Invalid IDs provided");
  }

  try {
    const result = await prisma.graphic.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    console.log(`[GraphicsService] Deleted ${result.count} graphics`);
    return { deletedCount: result.count };
  } catch (error) {
    console.error("[GraphicsService] deleteMultipleGraphics error:", error);
    throw new Error("Failed to delete graphics");
  }
};
