import prisma from "../../lib/prisma";

export const getAll = () =>
  prisma.stickerCategory.findMany({
    include: {
      _count: {
        select: { stickers: true },
      },
    },
  });

export const create = (name: string) =>
  prisma.stickerCategory.create({
    data: { name },
    include: {
      _count: {
        select: { stickers: true },
      },
    },
  });

export const update = (id: string, name: string) =>
  prisma.stickerCategory.update({
    where: { id },
    data: { name },
    include: {
      _count: {
        select: { stickers: true },
      },
    },
  });

export const remove = (id: string) =>
  prisma.stickerCategory.delete({
    where: { id },
  });
