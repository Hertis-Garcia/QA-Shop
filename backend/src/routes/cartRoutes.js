const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Retrieve the authenticated user's cart, creating one if necessary.
const getOrCreateCart = async (userId) => {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })
}

// Retrieve cart details and calculate subtotals and total.
const getCartDetails = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })

  if (!cart) return null

  const items = cart.items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.product.price,
  }))

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)

  return {
    ...cart,
    items,
    total,
  }
}

// Validate positive integer values.
const isPositiveInteger = (value) =>
  Number.isInteger(value) && value > 0

// All cart routes require authentication.
router.use(authMiddleware)

// GET /api/cart
// Retrieve the user's cart.
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId

    await getOrCreateCart(userId)

    const cart = await getCartDetails(userId)

    return res.status(200).json(cart)
  } catch (error) {
    console.error('Get cart error:', error)

    return res.status(500).json({
      message: 'Failed to retrieve cart',
    })
  }
})

// POST /api/cart
// Add a product to the user's cart.
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId
    const { productId, quantity } = req.body

    if (!isPositiveInteger(productId)) {
      return res.status(400).json({
        message: 'Product ID must be a positive integer',
      })
    }

    if (!isPositiveInteger(quantity)) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        return {
          error: 'Product not found',
          status: 404,
        }
      }

      const cart = await tx.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      })

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      })

      const newQuantity = (existingItem?.quantity || 0) + quantity

      if (newQuantity > product.stock) {
        return {
          error: `Only ${product.stock} units are available`,
          status: 400,
        }
      }

      const cartItem = await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        update: {
          quantity: newQuantity,
        },
        create: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })

      return {
        cartItem,
        created: !existingItem,
      }
    })

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      })
    }

    const cart = await getCartDetails(userId)

    return res.status(result.created ? 201 : 200).json({
      message: result.created
        ? 'Product added to cart successfully'
        : 'Cart item quantity updated successfully',
      cart,
    })
  } catch (error) {
    console.error('Add to cart error:', error)

    return res.status(500).json({
      message: 'Failed to add product to cart',
    })
  }
})

// PUT /api/cart/:itemId
// Update the quantity of a cart item.
router.put('/:itemId', async (req, res) => {
  try {
    const userId = req.user.userId
    const itemId = Number(req.params.itemId)
    const { quantity } = req.body

    if (!isPositiveInteger(itemId)) {
      return res.status(400).json({
        message: 'Cart item ID must be a positive integer',
      })
    }

    if (!isPositiveInteger(quantity)) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: itemId },
        include: {
          cart: true,
          product: true,
        },
      })

      if (!cartItem || cartItem.cart.userId !== userId) {
        return {
          error: 'Cart item not found',
          status: 404,
        }
      }

      if (quantity > cartItem.product.stock) {
        return {
          error: `Only ${cartItem.product.stock} units are available`,
          status: 400,
        }
      }

      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      })

      return { success: true }
    })

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      })
    }

    const cart = await getCartDetails(userId)

    return res.status(200).json({
      message: 'Cart item updated successfully',
      cart,
    })
  } catch (error) {
    console.error('Update cart error:', error)

    return res.status(500).json({
      message: 'Failed to update cart item',
    })
  }
})

// DELETE /api/cart/:itemId
// Remove an item from the user's cart.
router.delete('/:itemId', async (req, res) => {
  try {
    const userId = req.user.userId
    const itemId = Number(req.params.itemId)

    if (!isPositiveInteger(itemId)) {
      return res.status(400).json({
        message: 'Cart item ID must be a positive integer',
      })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    })

    if (!cartItem || cartItem.cart.userId !== userId) {
      return res.status(404).json({
        message: 'Cart item not found',
      })
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    const cart = await getCartDetails(userId)

    return res.status(200).json({
      message: 'Cart item removed successfully',
      cart,
    })
  } catch (error) {
    console.error('Remove cart item error:', error)

    return res.status(500).json({
      message: 'Failed to remove cart item',
    })
  }
})

module.exports = router