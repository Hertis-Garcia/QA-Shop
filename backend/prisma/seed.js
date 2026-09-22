require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')



const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log('Seeding database...')

  // Categories
  const laptops = await prisma.category.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: { name: 'Laptops' },
  })

  const peripherals = await prisma.category.upsert({
    where: { name: 'Peripherals' },
    update: {},
    create: { name: 'Peripherals' },
  })

  const monitors = await prisma.category.upsert({
    where: { name: 'Monitors' },
    update: {},
    create: { name: 'Monitors' },
  })

  const audio = await prisma.category.upsert({
    where: { name: 'Audio' },
    update: {},
    create: { name: 'Audio' },
  })

  const accessories = await prisma.category.upsert({
    where: { name: 'Accessories' },
    update: {},
    create: { name: 'Accessories' },
  })

  // Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Lenovo IdeaPad 5',
        description: '15-inch productivity laptop with AMD Ryzen processor.',
        price: 42999,
        stock: 15,
        imageUrl: null,
        categoryId: laptops.id,
      },
      {
        name: 'ASUS VivoBook 15',
        description: 'Compact laptop suitable for work and everyday computing.',
        price: 38999,
        stock: 10,
        imageUrl: null,
        categoryId: laptops.id,
      },
      {
        name: 'Logitech MX Master 3S',
        description: 'Wireless productivity mouse with precision tracking.',
        price: 4999,
        stock: 25,
        imageUrl: null,
        categoryId: peripherals.id,
      },
      {
        name: 'Keychron K2',
        description: 'Wireless mechanical keyboard with hot-swappable switches.',
        price: 4299,
        stock: 20,
        imageUrl: null,
        categoryId: peripherals.id,
      },
      {
        name: 'ASUS TUF Gaming Monitor',
        description: '27-inch gaming monitor with high refresh rate.',
        price: 15999,
        stock: 8,
        imageUrl: null,
        categoryId: monitors.id,
      },
      {
        name: 'HyperX Cloud III',
        description: 'Wired gaming headset with surround sound.',
        price: 5499,
        stock: 12,
        imageUrl: null,
        categoryId: audio.id,
      },
      {
        name: 'Anker USB-C Hub',
        description: 'Multi-port USB-C hub for laptops and tablets.',
        price: 2499,
        stock: 30,
        imageUrl: null,
        categoryId: accessories.id,
      },
      {
        name: 'Adjustable Laptop Stand',
        description: 'Aluminum laptop stand with adjustable viewing angles.',
        price: 1899,
        stock: 18,
        imageUrl: null,
        categoryId: accessories.id,
      },
    ],
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })