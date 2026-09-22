const express = require('express')
const cors = require('cors')
require('dotenv').config()

const productRoutes = require('./routes/productRoutes')

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

app.use('/api/products', productRoutes)

app.listen(PORT, () => {
  console.log(`QA-Shop API running on http://localhost:${PORT}`)
})