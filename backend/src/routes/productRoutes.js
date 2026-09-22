const express = require('express')
const prisma = require('../lib/prisma')

const router = express.Router()

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    res.json(products)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to retrieve products',
    })
  }
})

module.exports = router