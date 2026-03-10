import prisma from "../../lib/prisma";

/* ===============================
   GET ALL STICKERS
================================ */
export const getAll = () => {
  return prisma.sticker.findMany({
    include: {
      category: {
        include: {
          _count: {
            select: { stickers: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/* ===============================
   UPLOAD STICKERS
================================ */
export const upload = async (
  files: Express.Multer.File[],
  categoryId: string
) => {
  return prisma.$transaction(
    files.map((file) =>
      prisma.sticker.create({
        data: {
          name: file.originalname,
          imageUrl: `/uploads/${file.filename}`,
          isActive: true,
          usageCount: 0,
          category: {
            connect: { id: categoryId }, // ✅ CORRECT PRISMA RELATION
          },
        },
        include: {
          category: {
            include: {
              _count: {
                select: { stickers: true },
              },
            },
          },
        },
      })
    )
  );
};

/* ===============================
   TOGGLE ENABLE / DISABLE
================================ */
export const toggle = async (id: string) => {
  const sticker = await prisma.sticker.findUnique({
    where: { id },
  });

  if (!sticker) {
    throw new Error("Sticker not found");
  }

  return prisma.sticker.update({
    where: { id },
    data: {
      isActive: !sticker.isActive,
    },
    include: {
      category: {
        include: {
          _count: {
            select: { stickers: true },
          },
        },
      },
    },
  });
};

/* ===============================
   MOVE TO CATEGORY
================================ */
export const moveToCategory = async (
  id: string,
  categoryId: string
) => {
  return prisma.sticker.update({
    where: { id },
    data: {
      category: {
        connect: { id: categoryId },
      },
    },
    include: {
      category: {
        include: {
          _count: {
            select: { stickers: true },
          },
        },
      },
    },
  });
};

/* ===============================
   DELETE STICKER
================================ */
export const remove = (id: string) => {
  return prisma.sticker.delete({
    where: { id },
  });
};
