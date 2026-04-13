const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./routes/auth')
const eventRoutes = require('./routes/events')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('EventHive backend is running')
})

app.use('/api', authRoutes)
app.use('/api', eventRoutes)

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})