const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// All order routes require authentication.
router.use(authMiddleware)

// Include order items and their associated product details.
const orderInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  },
}

// POST /api/orders
// Checkout: create an order, deduct stock, and clear the cart.
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId
    const { shippingAddress } = req.body

    if (
      typeof shippingAddress !== 'string' ||
      !shippingAddress.trim()
    ) {
      return res.status(400).json({
        message: 'Shipping address is required',
      })
    }

    const order = await prisma.$transaction(async (tx) => {
      // Retrieve the authenticated user's cart.
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!cart || cart.items.length === 0) {
        const error = new Error('CART_EMPTY')
        throw error
      }

      // Calculate the total using current database prices.
      const total = cart.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity
      }, 0)

      const totalAmount =
        Math.round((total + Number.EPSILON) * 100) / 100

      // Deduct inventory only when sufficient stock remains.
      // updateMany provides a conditional stock check.
      for (const item of cart.items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        if (stockUpdate.count !== 1) {
          const error = new Error('INSUFFICIENT_STOCK')
          throw error
        }
      }

      // Create the order and its historical order items.
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: shippingAddress.trim(),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: orderInclude,
      })

      // Clear the cart only after the order has been created.
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      })

      return newOrder
    })

    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    })
  } catch (error) {
    console.error('Checkout error:', error)

    if (error.message === 'CART_EMPTY') {
      return res.status(400).json({
        message: 'Cannot checkout with an empty cart',
      })
    }

    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({
        message: 'Insufficient stock for one or more products',
      })
    }

    return res.status(500).json({
      message: 'Failed to place order',
    })
  }
})

// GET /api/orders
// Retrieve the authenticated user's order history.
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId

    const orders = await prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json({
      count: orders.length,
      orders,
    })
  } catch (error) {
    console.error('Get orders error:', error)

    return res.status(500).json({
      message: 'Failed to retrieve orders',
    })
  }
})

// GET /api/orders/:id
// Retrieve one order belonging to the authenticated user.
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.userId
    const orderId = Number(req.params.id)

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: 'Order ID must be a positive integer',
      })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: orderInclude,
    })

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      })
    }

    return res.status(200).json(order)
  } catch (error) {
    console.error('Get order details error:', error)

    return res.status(500).json({
      message: 'Failed to retrieve order details',
    })
  }
})

module.exports = router