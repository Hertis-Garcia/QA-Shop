const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()

// All product management routes require administrator access.
router.use(authMiddleware, adminMiddleware)

const isPositiveInteger = (value) =>
  Number.isInteger(value) && value > 0

// POST /api/products
// Create a new product.
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      imageUrl,
      categoryId,
    } = req.body

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof description !== 'string' || !description.trim()
    ) {
      return res.status(400).json({
        message: 'Product name and description are required',
      })
    }

    if (
      typeof price !== 'number' ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: 'Price must be a valid non-negative number',
      })
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: 'Stock must be a non-negative integer',
      })
    }

    if (!isPositiveInteger(categoryId)) {
      return res.status(400).json({
        message: 'Category ID must be a positive integer',
      })
    }

    if (
      imageUrl !== undefined &&
      imageUrl !== null &&
      typeof imageUrl !== 'string'
    ) {
      return res.status(400).json({
        message: 'Image URL must be a string or null',
      })
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
      })
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        stock,
        imageUrl: imageUrl?.trim() || null,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    })
  } catch (error) {
    console.error('Create product error:', error)

    return res.status(500).json({
      message: 'Failed to create product',
    })
  }
})

// PUT /api/products/:id
// Update an existing product.
router.put('/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id)

    if (!isPositiveInteger(productId)) {
      return res.status(400).json({
        message: 'Product ID must be a positive integer',
      })
    }

    const allowedFields = [
      'name',
      'description',
      'price',
      'stock',
      'imageUrl',
      'categoryId',
    ]

    const suppliedFields = Object.keys(req.body)
    const invalidFields = suppliedFields.filter(
      (field) => !allowedFields.includes(field)
    )

    if (invalidFields.length > 0 || suppliedFields.length === 0) {
      return res.status(400).json({
        message: 'Provide valid product fields to update',
      })
    }

    const data = {}

    if ('name' in req.body) {
      if (
        typeof req.body.name !== 'string' ||
        !req.body.name.trim()
      ) {
        return res.status(400).json({
          message: 'Product name must be a non-empty string',
        })
      }

      data.name = req.body.name.trim()
    }

    if ('description' in req.body) {
      if (
        typeof req.body.description !== 'string' ||
        !req.body.description.trim()
      ) {
        return res.status(400).json({
          message: 'Description must be a non-empty string',
        })
      }

      data.description = req.body.description.trim()
    }

    if ('price' in req.body) {
      if (
        typeof req.body.price !== 'number' ||
        !Number.isFinite(req.body.price) ||
        req.body.price < 0
      ) {
        return res.status(400).json({
          message: 'Price must be a valid non-negative number',
        })
      }

      data.price = req.body.price
    }

    if ('stock' in req.body) {
      if (
        !Number.isInteger(req.body.stock) ||
        req.body.stock < 0
      ) {
        return res.status(400).json({
          message: 'Stock must be a non-negative integer',
        })
      }

      data.stock = req.body.stock
    }

    if ('imageUrl' in req.body) {
      if (
        req.body.imageUrl !== null &&
        typeof req.body.imageUrl !== 'string'
      ) {
        return res.status(400).json({
          message: 'Image URL must be a string or null',
        })
      }

      data.imageUrl =
        typeof req.body.imageUrl === 'string'
          ? req.body.imageUrl.trim() || null
          : null
    }

    if ('categoryId' in req.body) {
      if (!isPositiveInteger(req.body.categoryId)) {
        return res.status(400).json({
          message: 'Category ID must be a positive integer',
        })
      }

      const category = await prisma.category.findUnique({
        where: { id: req.body.categoryId },
      })

      if (!category) {
        return res.status(404).json({
          message: 'Category not found',
        })
      }

      data.categoryId = req.body.categoryId
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found',
      })
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: true,
      },
    })

    return res.status(200).json({
      message: 'Product updated successfully',
      product,
    })
  } catch (error) {
    console.error('Update product error:', error)

    return res.status(500).json({
      message: 'Failed to update product',
    })
  }
})

// DELETE /api/products/:id
// Delete a product if it has no cart or order references.
router.delete('/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id)

    if (!isPositiveInteger(productId)) {
      return res.status(400).json({
        message: 'Product ID must be a positive integer',
      })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true,
          },
        },
      },
    })

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      })
    }

    if (
      product._count.cartItems > 0 ||
      product._count.orderItems > 0
    ) {
      return res.status(409).json({
        message: 'Cannot delete a product referenced by carts or orders',
      })
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    return res.status(200).json({
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Delete product error:', error)

    if (error.code === 'P2003') {
      return res.status(409).json({
        message: 'Cannot delete a product that is referenced by other records',
      })
    }

    return res.status(500).json({
      message: 'Failed to delete product',
    })
  }
})

module.exports = router