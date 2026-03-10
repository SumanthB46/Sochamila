import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const items = await prisma.orderItem.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        select: { id: true, orderId: true, pdfUrl: true, imageUrl: true }
    });
    console.log(JSON.stringify(items, null, 2));
}
main().finally(() => prisma.$disconnect());