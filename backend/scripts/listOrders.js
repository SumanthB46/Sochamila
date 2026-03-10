const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
async function main(){
  const prisma = new PrismaClient();
  try{
    const orders = await prisma.order.findMany({ include: { items: true } });
    console.log(JSON.stringify(orders, null, 2));
  }catch(e){
    console.error(e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
