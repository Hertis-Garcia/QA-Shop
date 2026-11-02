const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()

// All administrative order routes require administrator access.
router.use(authMiddleware, adminMiddleware)

const orderInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  items: {
    include: {
      product: true,
    },
  },
}

// GET /api/admin/orders
// Retrieve all customer orders.
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
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
    console.error('Get all orders error:', error)

    return res.status(500).json({
      message: 'Failed to retrieve orders',
    })
  }
})

// PUT /api/admin/orders/:id
// Update an order's status.
router.put('/:id', async (req, res) => {
  try {
    const orderId = Number(req.params.id)
    const { status } = req.body

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: 'Order ID must be a positive integer',
      })
    }

    const validStatuses = [
      'PENDING',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status',
        validStatuses,
      })
    }

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      })

      if (!existingOrder) {
        const error = new Error('ORDER_NOT_FOUND')
        throw error
      }

      // Define permitted status transitions.
      const allowedTransitions = {
        PENDING: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
      }

      if (!allowedTransitions[existingOrder.status].includes(status)) {
        const error = new Error('INVALID_STATUS_TRANSITION')
        throw error
      }

      // Restore stock when an eligible order is cancelled.
      if (status === 'CANCELLED') {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          })
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status },
        include: orderInclude,
      })
    })

    return res.status(200).json({
      message: 'Order status updated successfully',
      order,
    })
  } catch (error) {
    console.error('Update order status error:', error)

    if (error.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        message: 'Order not found',
      })
    }

    if (error.message === 'INVALID_STATUS_TRANSITION') {
      return res.status(400).json({
        message: 'This order status transition is not allowed',
      })
    }

    return res.status(500).json({
      message: 'Failed to update order status',
    })
  }
})

module.exports = router