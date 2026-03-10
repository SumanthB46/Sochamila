import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log("[ROLE] User not authenticated");
      return res.status(401).json({ 
        success: false,
        statusCode: 401,
        message: "Unauthorized - User not found" 
      });
    }

    console.log("[ROLE] Checking access for user:", {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRoles: roles,
      hasAccess: roles.includes(req.user.role),
    });

    if (!roles.includes(req.user.role)) {
      console.log("[ROLE] Access denied - insufficient permissions");
      return res.status(403).json({ 
        success: false,
        statusCode: 403,
        message: `Access denied - requires one of: ${roles.join(", ")}. You have: ${req.user.role}` 
      });
    }

    console.log("[ROLE] Access granted for user:", req.user.id);
    next();
  };
};
