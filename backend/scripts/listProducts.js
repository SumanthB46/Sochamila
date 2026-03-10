const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

async function main(){
  const prisma = new PrismaClient();
  try{
    const products = await prisma.product.findMany({ include: { images: true } });
    console.log(JSON.stringify(products, null, 2));
  }catch(e){
    console.error(e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
