import { Request, Response } from "express";
import {
  getAllGraphics,
  getGraphicById,
  createGraphics,
  deleteGraphic,
  deleteMultipleGraphics,
  IGraphic,
} from "./graphics.service";

/* =========================================================
   STANDARD RESPONSE INTERFACE
========================================================= */

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/* =========================================================
   GET ALL GRAPHICS (PUBLIC)
========================================================= */

export const getGraphics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("[GraphicsController] GET /graphics");

    const graphics = await getAllGraphics();

    const response: ApiResponse<IGraphic[]> = {
      success: true,
      message: "Graphics fetched successfully",
      data: graphics,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("[GraphicsController] getGraphics error:", error);

    const response: ApiResponse<null> = {
      success: false,
      message: "Failed to fetch graphics",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(500).json(response);
  }
};

/* =========================================================
   GET GRAPHIC BY ID (PUBLIC)
========================================================= */

export const getGraphicById_controller = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (!id) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Graphic ID is required",
      };
      res.status(400).json(response);
      return;
    }

    console.log(`[GraphicsController] GET /graphics/${id}`);

    const graphic = await getGraphicById(id);

    if (!graphic) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Graphic not found",
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<IGraphic> = {
      success: true,
      message: "Graphic fetched successfully",
      data: graphic,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("[GraphicsController] getGraphicById error:", error);

    const response: ApiResponse<null> = {
      success: false,
      message: "Failed to fetch graphic",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(500).json(response);
  }
};

/* =========================================================
   UPLOAD GRAPHICS (ADMIN)
========================================================= */

export const uploadGraphics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        message: "No files provided",
      };
      res.status(400).json(response);
      return;
    }

    console.log(
      `[GraphicsController] POST /graphics/upload - ${files.length} files`
    );

    const graphics = await createGraphics(files);

    const response: ApiResponse<IGraphic[]> = {
      success: true,
      message: `Successfully uploaded ${graphics.length} graphics`,
      data: graphics,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("[GraphicsController] uploadGraphics error:", error);

    const statusCode =
      error instanceof Error && error.message.includes("No files")
        ? 400
        : error instanceof Error && error.message.includes("exceeds")
        ? 413
        : 500;

    const response: ApiResponse<null> = {
      success: false,
      message: "Failed to upload graphics",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(statusCode).json(response);
  }
};

/* =========================================================
   DELETE GRAPHIC (ADMIN)
========================================================= */

export const deleteGraphic_controller = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (!id) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Graphic ID is required",
      };
      res.status(400).json(response);
      return;
    }

    console.log(`[GraphicsController] DELETE /graphics/${id}`);

    const deleted = await deleteGraphic(id);

    const response: ApiResponse<IGraphic> = {
      success: true,
      message: "Graphic deleted successfully",
      data: deleted,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("[GraphicsController] deleteGraphic error:", error);

    const statusCode =
      error instanceof Error && error.message === "Graphic not found"
        ? 404
        : 500;

    const response: ApiResponse<null> = {
      success: false,
      message: "Failed to delete graphic",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(statusCode).json(response);
  }
};

/* =========================================================
   DELETE MULTIPLE GRAPHICS (ADMIN)
========================================================= */

export const deleteMultipleGraphics_controller = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Graphic IDs array is required",
      };
      res.status(400).json(response);
      return;
    }

    console.log(
      `[GraphicsController] DELETE /graphics/batch - ${ids.length} items`
    );

    const result = await deleteMultipleGraphics(ids);

    const response: ApiResponse<{ deletedCount: number }> = {
      success: true,
      message: `Successfully deleted ${result.deletedCount} graphics`,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(
      "[GraphicsController] deleteMultipleGraphics error:",
      error
    );

    const response: ApiResponse<null> = {
      success: false,
      message: "Failed to delete graphics",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    res.status(500).json(response);
  }
};
