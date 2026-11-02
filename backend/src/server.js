const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')
const adminProductRoutes = require('./routes/adminProductRoutes')
const adminOrderRoutes = require('./routes/adminOrderRoutes')


const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.json({
    message: 'QA-Shop API is running',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'QA-Shop API',
  })
})

// API routes
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

//Admin routes
app.use('/api/products', adminProductRoutes)
app.use('/api/admin/orders', adminOrderRoutes)

app.listen(PORT, () => {
  console.log(`QA-Shop API running on http://localhost:${PORT}`)
})