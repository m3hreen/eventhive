const express = require('express')
const { ObjectId } = require('mongodb')
const connectDB = require('../db/mongodb')

const router = express.Router()

router.post('/events', async (req, res) => {
  try {
    const { title, date, location, category, description, image, createdBy } = req.body

    if (!title || !date || !location || !category || !description) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    const db = await connectDB()
    const eventsCollection = db.collection('events')

    const newEvent = {
      title: title.trim(),
      date,
      location: location.trim(),
      category: category.trim(),
      description: description.trim(),
      image: image ? image.trim() : '',
      createdBy: createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await eventsCollection.insertOne(newEvent)

    res.status(201).json({
      message: 'Event created successfully.',
      eventId: result.insertedId
    })
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ message: 'Server error while creating event.' })
  }
})

router.get('/events', async (req, res) => {
  try {
    const { createdBy } = req.query

    const db = await connectDB()
    const eventsCollection = db.collection('events')

    const filter = createdBy ? { createdBy } : {}
    const events = await eventsCollection.find(filter).sort({ createdAt: -1 }).toArray()

    res.status(200).json(events)
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ message: 'Server error while fetching events.' })
  }
})

router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    const db = await connectDB()
    const eventsCollection = db.collection('events')
    const event = await eventsCollection.findOne({ _id: new ObjectId(id) })

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    res.status(200).json(event)
  } catch (error) {
    console.error('Get single event error:', error)
    res.status(500).json({ message: 'Server error while fetching event.' })
  }
})

router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, date, location, category, description, image } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    if (!title || !date || !location || !category || !description) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    const db = await connectDB()
    const eventsCollection = db.collection('events')

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: title.trim(),
          date,
          location: location.trim(),
          category: category.trim(),
          description: description.trim(),
          image: image ? image.trim() : '',
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    res.status(200).json({ message: 'Event updated successfully.' })
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ message: 'Server error while updating event.' })
  }
})

router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    const db = await connectDB()
    const eventsCollection = db.collection('events')

    const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    res.status(200).json({ message: 'Event deleted successfully.' })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ message: 'Server error while deleting event.' })
  }
})

router.post('/events/:id/rsvp', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, status } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    if (!name || !email || !status) {
      return res.status(400).json({ message: 'Name, email, and RSVP status are required.' })
    }

    const allowedStatuses = ['Attending', 'Maybe', 'Declined']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid RSVP status.' })
    }

    const db = await connectDB()
    const eventsCollection = db.collection('events')
    const rsvpsCollection = db.collection('rsvps')

    const event = await eventsCollection.findOne({ _id: new ObjectId(id) })
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingRsvp = await rsvpsCollection.findOne({
      eventId: id,
      email: normalizedEmail
    })

    if (existingRsvp) {
      await rsvpsCollection.updateOne(
        { _id: existingRsvp._id },
        {
          $set: {
            name: name.trim(),
            status,
            updatedAt: new Date()
          }
        }
      )

      return res.status(200).json({ message: 'RSVP updated successfully.' })
    }

    await rsvpsCollection.insertOne({
      eventId: id,
      eventTitle: event.title,
      name: name.trim(),
      email: normalizedEmail,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    res.status(201).json({ message: 'RSVP submitted successfully.' })
  } catch (error) {
    console.error('RSVP error:', error)
    res.status(500).json({ message: 'Server error while submitting RSVP.' })
  }
})

router.get('/events/:id/rsvps', async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    const db = await connectDB()
    const rsvpsCollection = db.collection('rsvps')

    const rsvps = await rsvpsCollection
      .find({ eventId: id })
      .sort({ createdAt: -1 })
      .toArray()

    res.status(200).json(rsvps)
  } catch (error) {
    console.error('Get RSVPs error:', error)
    res.status(500).json({ message: 'Server error while fetching RSVPs.' })
  }
})

router.post('/events/:id/send-reminder', async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    const db = await connectDB()
    const eventsCollection = db.collection('events')
    const rsvpsCollection = db.collection('rsvps')
    const remindersCollection = db.collection('reminders')

    const event = await eventsCollection.findOne({ _id: new ObjectId(id) })
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    const recipients = await rsvpsCollection.find({
      eventId: id,
      status: { $in: ['Attending', 'Maybe'] }
    }).toArray()

    if (!recipients.length) {
      return res.status(400).json({ message: 'No eligible RSVP guests to remind.' })
    }

    const reminderDocs = recipients.map(guest => ({
      eventId: id,
      eventTitle: event.title,
      attendeeName: guest.name,
      attendeeEmail: guest.email,
      attendeeStatus: guest.status,
      message: `Reminder: ${event.title} is coming up on ${event.date} at ${event.location}.`,
      sentAt: new Date(),
      read: false
    }))

    await remindersCollection.insertMany(reminderDocs)

    res.status(200).json({
      message: `Reminder sent to ${recipients.length} guest(s).`
    })
  } catch (error) {
    console.error('Send reminder error:', error)
    res.status(500).json({ message: 'Server error while sending reminders.' })
  }
})

router.get('/reminders', async (req, res) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const db = await connectDB()
    const remindersCollection = db.collection('reminders')

    const reminders = await remindersCollection
      .find({ attendeeEmail: email.trim().toLowerCase() })
      .sort({ sentAt: -1 })
      .toArray()

    res.status(200).json(reminders)
  } catch (error) {
    console.error('Get reminders error:', error)
    res.status(500).json({ message: 'Server error while fetching reminders.' })
  }
})

router.patch('/reminders/:id/read', async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid reminder ID.' })
    }

    const db = await connectDB()
    const remindersCollection = db.collection('reminders')

    const result = await remindersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          read: true
        }
      }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Reminder not found.' })
    }

    res.status(200).json({ message: 'Reminder marked as read.' })
  } catch (error) {
    console.error('Mark reminder read error:', error)
    res.status(500).json({ message: 'Server error while updating reminder.' })
  }
})

router.post('/suggestions', async (req, res) => {
  try {
    const { title, category, location, preferredDate, details, submittedBy, submittedByName } = req.body

    if (!title || !category || !details) {
      return res.status(400).json({ message: 'Title, category, and details are required.' })
    }

    const db = await connectDB()
    const suggestionsCollection = db.collection('suggestions')

    const newSuggestion = {
      title: title.trim(),
      category: category.trim(),
      location: location ? location.trim() : '',
      preferredDate: preferredDate || '',
      details: details.trim(),
      submittedBy: submittedBy || null,
      submittedByName: submittedByName || 'Anonymous',
      likes: 0,
      likedBy: [],
      createdAt: new Date()
    }

    await suggestionsCollection.insertOne(newSuggestion)

    res.status(201).json({ message: 'Suggestion submitted successfully.' })
  } catch (error) {
    console.error('Create suggestion error:', error)
    res.status(500).json({ message: 'Server error while creating suggestion.' })
  }
})

router.get('/suggestions', async (req, res) => {
  try {
    const { submittedBy, featured } = req.query

    const db = await connectDB()
    const suggestionsCollection = db.collection('suggestions')

    const filter = submittedBy ? { submittedBy } : {}
    let query = suggestionsCollection.find(filter)

    if (featured === 'true') {
      query = query.sort({ likes: -1, createdAt: -1 }).limit(6)
    } else {
      query = query.sort({ createdAt: -1 })
    }

    const suggestions = await query.toArray()

    res.status(200).json(suggestions)
  } catch (error) {
    console.error('Get suggestions error:', error)
    res.status(500).json({ message: 'Server error while fetching suggestions.' })
  }
})

router.post('/suggestions/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid suggestion ID.' })
    }

    if (!email) {
      return res.status(400).json({ message: 'User email is required.' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const db = await connectDB()
    const suggestionsCollection = db.collection('suggestions')

    const suggestion = await suggestionsCollection.findOne({ _id: new ObjectId(id) })

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found.' })
    }

    if ((suggestion.likedBy || []).includes(normalizedEmail)) {
      return res.status(400).json({ message: 'You already liked this suggestion.' })
    }

    await suggestionsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { likes: 1 },
        $push: { likedBy: normalizedEmail }
      }
    )

    res.status(200).json({ message: 'Suggestion liked successfully.' })
  } catch (error) {
    console.error('Like suggestion error:', error)
    res.status(500).json({ message: 'Server error while liking suggestion.' })
  }
})

module.exports = router