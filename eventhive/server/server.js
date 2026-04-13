import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

let events = [
  {
    id: 1,
    title: 'Tech Networking Night',
    date: '2026-04-20',
    location: 'Toronto, ON',
    category: 'Networking',
    description: 'Meet students and professionals in tech.'
  }
]


app.get('/api/events', (req, res) => {
  res.json(events)
})

app.post('/api/events', (req, res) => {
  const newEvent = { id: Date.now(), ...req.body }
  events.push(newEvent)
  res.status(201).json(newEvent)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === Number(req.params.id))

  if (!event) {
    return res.status(404).json({ message: 'Event not found' })
  }

  res.json(event)
})

app.put('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === Number(req.params.id))

  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' })
  }

  events[index] = {
    ...events[index],
    ...req.body
  }

  res.json(events[index])
})