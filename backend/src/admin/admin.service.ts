import { prisma } from "../lib/prisma";

export async function getAdminStatsService() {
  const [products, vendors] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({
      where: { role: "VENDOR" },
    }),
  ]);

  // Orders not implemented yet → safe defaults
  const orders = 0;
  const revenue = 0;

  return {
    products,
    orders,
    vendors,
    revenue,
  };
}
