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

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id)

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: 'Invalid product ID',
      })
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: true,
      },
    })

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      })
    }

    res.json(product)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to retrieve product',
    })
  }
})

module.exports = router