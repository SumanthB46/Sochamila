import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding dummy data...");

  // Hash passwords
  const vendorHashedPassword = await hashPassword("vendor-pass");
  const customerHashedPassword = await hashPassword("customer-pass");

  console.log("Vendor hashed password:", vendorHashedPassword);
  console.log("Customer hashed password:", customerHashedPassword);

  // Create or upsert a vendor
  const vendor = await prisma.user.upsert({
    where: { email: "vendor@example.com" },
    update: { 
      name: "Sample Vendor", 
      isActive: true,
      password: vendorHashedPassword 
    },
    create: {
      name: "Sample Vendor",
      email: "vendor@example.com",
      password: vendorHashedPassword,
      role: "VENDOR",
      isActive: true,
    },
  });

  // Create or upsert a customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { 
      name: "Sample Customer", 
      isActive: true,
      password: customerHashedPassword 
    },
    create: {
      name: "Sample Customer",
      email: "customer@example.com",
      password: customerHashedPassword,
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Create or reuse a simple product with a color and a size
  let product: any = null;
  let size: any = null;

  const existingSize = await prisma.productSize.findUnique({
    where: { sku: "DEMO-TSHIRT-RED-M" },
    include: { color: { include: { product: true, sizes: true } } },
  });

  if (existingSize) {
    size = existingSize;
    product = existingSize.color.product;
  } else {
    product = await prisma.product.create({
      data: {
        name: "Demo T-Shirt",
        description: "A demo product created by seed script",
        department: "CLOTHING",
        productType: "TSHIRT",
        minPrice: 299,
        images: {
          create: [{ imageUrl: "https://placehold.co/400x400?text=product", isPrimary: true }],
        },
        colors: {
          create: [
            {
              name: "Red",
              hexCode: "#ff0000",
              images: { create: [{ imageUrl: "https://placehold.co/400x400?text=color" }] },
              sizes: {
                create: [
                  {
                    size: "M",
                    sku: "DEMO-TSHIRT-RED-M",
                    mrp: 499,
                    price: 399,
                    costPrice: 250,
                    stock: 50,
                  },
                ],
              },
            },
          ],
        },
      },
      include: { colors: { include: { sizes: true } } },
    });

    size = product.colors[0].sizes[0];
  }

  // Create two orders for the customer
  const order1 = await prisma.order.create({
    data: {
      userId: customer.id,
      totalAmount: size.price,
      paymentStatus: "PAID",
      items: {
        create: [
          ({
            sizeId: size.id,
            quantity: 1,
            price: size.price,
            imageUrl: "https://placehold.co/300x300?text=design-1",
            mockupUrl: "https://placehold.co/300x300?text=mockup-1",
            // vendor not assigned yet
          } as any),
        ],
      },
    },
    include: { items: true },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: customer.id,
      totalAmount: size.price * 2,
      paymentStatus: "PAID",
      items: {
        create: [
          ({
            sizeId: size.id,
            quantity: 2,
            price: size.price,
            imageUrl: "https://placehold.co/300x300?text=design-2",
            mockupUrl: "https://placehold.co/300x300?text=mockup-2",
          } as any),
        ],
      },
    },
    include: { items: true },
  });

  console.log("Seed complete:");
  console.log("Vendor:", vendor.email, vendor.id);
  console.log("Customer:", customer.email, customer.id);
  console.log("Product:", product.name, product.id);
  console.log("Orders:", order1.id, order2.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
