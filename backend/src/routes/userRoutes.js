const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    res.json(user)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to retrieve user',
    })
  }
})

module.exports = router