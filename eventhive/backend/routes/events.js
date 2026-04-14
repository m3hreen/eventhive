const express = require('express')
const { ObjectId } = require('mongodb')
const connectDB = require('../db/mongodb')

const router = express.Router()

function normalizeEmail(email = '') {
  return email.trim().toLowerCase()
}

function normalizeMatchmaking(matchmaking = {}) {
  const interests = Array.isArray(matchmaking.interests)
    ? matchmaking.interests.map(item => String(item).trim()).filter(Boolean)
    : []

  return {
    enabled: Boolean(matchmaking.enabled),
    interests,
    location: matchmaking.location ? String(matchmaking.location).trim() : '',
    attendingType: matchmaking.attendingType ? String(matchmaking.attendingType).trim() : '',
    bio: matchmaking.bio ? String(matchmaking.bio).trim() : ''
  }
}

function buildMatchScore(currentProfile, otherProfile) {
  let score = 0

  const currentInterests = currentProfile?.interests || []
  const otherInterests = otherProfile?.interests || []

  const sharedInterests = currentInterests.filter(interest =>
    otherInterests.includes(interest)
  )

  score += sharedInterests.length * 3

  if (
    currentProfile?.location &&
    otherProfile?.location &&
    currentProfile.location.toLowerCase() === otherProfile.location.toLowerCase()
  ) {
    score += 2
  }

  if (
    currentProfile?.attendingType &&
    otherProfile?.attendingType &&
    currentProfile.attendingType.toLowerCase() === otherProfile.attendingType.toLowerCase()
  ) {
    score += 1
  }

  return {
    score,
    sharedInterests
  }
}

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

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const suggestionsCollection = db.collection('suggestions')

    const suggestion = await suggestionsCollection.findOne({ _id: new ObjectId(id) })

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found.' })
    }

    const likedBy = suggestion.likedBy || []
    const alreadyLiked = likedBy.includes(normalizedEmail)

    if (alreadyLiked) {
      await suggestionsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: { likes: -1 },
          $pull: { likedBy: normalizedEmail }
        }
      )

      const updatedSuggestion = await suggestionsCollection.findOne({ _id: new ObjectId(id) })

      return res.status(200).json({
        message: 'Suggestion unliked successfully.',
        liked: false,
        likes: updatedSuggestion.likes || 0
      })
    }

    await suggestionsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { likes: 1 },
        $push: { likedBy: normalizedEmail }
      }
    )

    const updatedSuggestion = await suggestionsCollection.findOne({ _id: new ObjectId(id) })

    res.status(200).json({
      message: 'Suggestion liked successfully.',
      liked: true,
      likes: updatedSuggestion.likes || 0
    })
  } catch (error) {
    console.error('Toggle suggestion like error:', error)
    res.status(500).json({ message: 'Server error while updating suggestion like.' })
  }
})

router.post('/events', async (req, res) => {
  try {
    const {
      title,
      date,
      location,
      category,
      description,
      image,
      createdBy
    } = req.body

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
      createdBy: createdBy ? normalizeEmail(createdBy) : '',
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

    const filter = createdBy ? { createdBy: normalizeEmail(createdBy) } : {}
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
    const { name, email, status, matchmaking } = req.body

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

    const normalizedEmail = normalizeEmail(email)
    const normalizedMatchmaking = normalizeMatchmaking(matchmaking)

    if (status === 'Declined') {
      normalizedMatchmaking.enabled = false
    }

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
            matchmaking: normalizedMatchmaking,
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
      matchmaking: normalizedMatchmaking,
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

router.get('/events/:id/matchmaking', async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.query

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const rsvpsCollection = db.collection('rsvps')
    const requestsCollection = db.collection('matchmaking_requests')

    const currentUserRsvp = await rsvpsCollection.findOne({
      eventId: id,
      email: normalizedEmail
    })

    if (!currentUserRsvp) {
      return res.status(404).json({ message: 'Please RSVP first before using matchmaking.' })
    }

    if (!['Attending', 'Maybe'].includes(currentUserRsvp.status)) {
      return res.status(400).json({ message: 'Only Attending or Maybe guests can use matchmaking.' })
    }

    const currentProfile = currentUserRsvp.matchmaking || {}
    if (!currentProfile.enabled) {
      return res.status(200).json([])
    }

    const potentialMatches = await rsvpsCollection
      .find({
        eventId: id,
        email: { $ne: normalizedEmail },
        status: { $in: ['Attending', 'Maybe'] },
        'matchmaking.enabled': true
      })
      .toArray()

    const existingRequests = await requestsCollection.find({
      eventId: id,
      $or: [
        { fromEmail: normalizedEmail },
        { toEmail: normalizedEmail }
      ]
    }).toArray()

    const requestMap = new Map()
    existingRequests.forEach(request => {
      const otherEmail =
        request.fromEmail === normalizedEmail ? request.toEmail : request.fromEmail
      requestMap.set(otherEmail, request.status || 'pending')
    })

    const matches = potentialMatches
      .map(match => {
        const scoreData = buildMatchScore(currentProfile, match.matchmaking || {})
        return {
          _id: match._id,
          name: match.name,
          email: match.email,
          status: match.status,
          matchmaking: match.matchmaking || {},
          sharedInterests: scoreData.sharedInterests,
          matchScore: scoreData.score,
          connectionStatus: requestMap.get(match.email) || 'none'
        }
      })
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name))

    res.status(200).json(matches)
  } catch (error) {
    console.error('Get matchmaking matches error:', error)
    res.status(500).json({ message: 'Server error while fetching matches.' })
  }
})

router.post('/events/:id/matchmaking/connect', async (req, res) => {
  try {
    const { id } = req.params
    const { fromEmail, toEmail, message } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    if (!fromEmail || !toEmail) {
      return res.status(400).json({ message: 'Both users are required.' })
    }

    const senderEmail = normalizeEmail(fromEmail)
    const receiverEmail = normalizeEmail(toEmail)

    if (senderEmail === receiverEmail) {
      return res.status(400).json({ message: 'You cannot connect with yourself.' })
    }

    const db = await connectDB()
    const rsvpsCollection = db.collection('rsvps')
    const requestsCollection = db.collection('matchmaking_requests')

    const senderRsvp = await rsvpsCollection.findOne({ eventId: id, email: senderEmail })
    const receiverRsvp = await rsvpsCollection.findOne({ eventId: id, email: receiverEmail })

    if (!senderRsvp || !receiverRsvp) {
      return res.status(404).json({ message: 'Both attendees must RSVP first.' })
    }

    if (!senderRsvp.matchmaking?.enabled || !receiverRsvp.matchmaking?.enabled) {
      return res.status(400).json({ message: 'Both attendees must enable matchmaking.' })
    }

    const existingRequest = await requestsCollection.findOne({
      eventId: id,
      $or: [
        { fromEmail: senderEmail, toEmail: receiverEmail },
        { fromEmail: receiverEmail, toEmail: senderEmail }
      ]
    })

    if (existingRequest) {
      return res.status(400).json({ message: 'A connection request already exists for these users.' })
    }

    await requestsCollection.insertOne({
      eventId: id,
      eventTitle: senderRsvp.eventTitle,
      fromEmail: senderEmail,
      fromName: senderRsvp.name,
      toEmail: receiverEmail,
      toName: receiverRsvp.name,
      introMessage: message ? String(message).trim() : '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      read: false
    })

    res.status(201).json({ message: 'Connection request sent successfully.' })
  } catch (error) {
    console.error('Create matchmaking request error:', error)
    res.status(500).json({ message: 'Server error while sending connection request.' })
  }
})

router.get('/matchmaking-requests', async (req, res) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const requestsCollection = db.collection('matchmaking_requests')

    const requests = await requestsCollection
      .find({
        $or: [
          { fromEmail: normalizedEmail },
          { toEmail: normalizedEmail }
        ]
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray()

    res.status(200).json(requests)
  } catch (error) {
    console.error('Get matchmaking requests error:', error)
    res.status(500).json({ message: 'Server error while fetching connection requests.' })
  }
})

router.patch('/matchmaking-requests/:id/respond', async (req, res) => {
  try {
    const { id } = req.params
    const { email, action } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' })
    }

    if (!email || !action) {
      return res.status(400).json({ message: 'Email and action are required.' })
    }

    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const requestsCollection = db.collection('matchmaking_requests')

    const requestDoc = await requestsCollection.findOne({ _id: new ObjectId(id) })

    if (!requestDoc) {
      return res.status(404).json({ message: 'Connection request not found.' })
    }

    if (requestDoc.toEmail !== normalizedEmail) {
      return res.status(403).json({ message: 'Only the recipient can respond to this request.' })
    }

    await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: action,
          read: true,
          updatedAt: new Date()
        }
      }
    )

    res.status(200).json({ message: `Connection request ${action}.` })
  } catch (error) {
    console.error('Respond matchmaking request error:', error)
    res.status(500).json({ message: 'Server error while responding to connection request.' })
  }
})

router.patch('/matchmaking-requests/:id/read', async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' })
    }

    const db = await connectDB()
    const requestsCollection = db.collection('matchmaking_requests')

    const result = await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          read: true,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Connection request not found.' })
    }

    res.status(200).json({ message: 'Connection request marked as read.' })
  } catch (error) {
    console.error('Mark matchmaking request read error:', error)
    res.status(500).json({ message: 'Server error while marking request as read.' })
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
      .find({ attendeeEmail: normalizeEmail(email) })
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

router.get('/suggestions/stats', async (req, res) => {
  try {
    const db = await connectDB()
    const suggestionsCollection = db.collection('suggestions')

    const suggestions = await suggestionsCollection.find({}).toArray()

    const totalSuggestions = suggestions.length
    const totalLikes = suggestions.reduce((sum, s) => sum + (s.likes || 0), 0)

    const sortedByLikes = [...suggestions].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    const mostLiked = sortedByLikes[0] || null

    const categoryCounts = {}
    const locationCounts = {}

    suggestions.forEach(s => {
      if (s.category) {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1
      }

      if (s.location) {
        locationCounts[s.location] = (locationCounts[s.location] || 0) + 1
      }
    })

    const topCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    const topLocation =
      Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    res.status(200).json({
      totalSuggestions,
      totalLikes,
      mostLiked,
      topCategory,
      topLocation
    })
  } catch (error) {
    console.error('Suggestions stats error:', error)
    res.status(500).json({ message: 'Server error fetching suggestion stats.' })
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

router.post('/events/:id/save', async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const savedCollection = db.collection('saved_events')
    const eventsCollection = db.collection('events')

    const event = await eventsCollection.findOne({ _id: new ObjectId(id) })
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    const existing = await savedCollection.findOne({
      eventId: id,
      email: normalizedEmail
    })

    if (existing) {
      return res.status(400).json({ message: 'Event already saved.' })
    }

    await savedCollection.insertOne({
      eventId: id,
      email: normalizedEmail,
      createdAt: new Date()
    })

    res.status(201).json({ message: 'Event saved successfully.' })
  } catch (error) {
    console.error('Save event error:', error)
    res.status(500).json({ message: 'Server error while saving event.' })
  }
})

router.delete('/events/:id/save', async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const savedCollection = db.collection('saved_events')

    const result = await savedCollection.deleteOne({
      eventId: id,
      email: normalizedEmail
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Saved event not found.' })
    }

    res.status(200).json({ message: 'Event removed from saved events.' })
  } catch (error) {
    console.error('Unsave event error:', error)
    res.status(500).json({ message: 'Server error while removing saved event.' })
  }
})

router.get('/saved-events', async (req, res) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const savedCollection = db.collection('saved_events')
    const eventsCollection = db.collection('events')

    const savedDocs = await savedCollection
      .find({ email: normalizedEmail })
      .sort({ createdAt: -1 })
      .toArray()

    if (!savedDocs.length) {
      return res.status(200).json([])
    }

    const validIds = savedDocs
      .map(doc => doc.eventId)
      .filter(savedId => ObjectId.isValid(savedId))
      .map(savedId => new ObjectId(savedId))

    if (!validIds.length) {
      return res.status(200).json([])
    }

    const events = await eventsCollection
      .find({ _id: { $in: validIds } })
      .toArray()

    const eventMap = new Map(events.map(savedEvent => [String(savedEvent._id), savedEvent]))

    const orderedEvents = savedDocs
      .map(doc => eventMap.get(doc.eventId))
      .filter(Boolean)

    res.status(200).json(orderedEvents)
  } catch (error) {
    console.error('Get saved events error:', error)
    res.status(500).json({ message: 'Server error while fetching saved events.' })
  }
})

router.post('/events/:id/polls', async (req, res) => {
  try {
    const { id } = req.params
    const { question, options, createdBy } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' })
    }

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ message: 'Poll question and options required.' })
    }

    const db = await connectDB()
    const pollsCollection = db.collection('polls')

    const poll = {
      eventId: id,
      question: question.trim(),
      options: options.map(option => ({
        text: option.trim(),
        votes: 0
      })),
      votedBy: [],
      createdBy,
      createdAt: new Date()
    }

    await pollsCollection.insertOne(poll)

    res.status(201).json({ message: 'Poll created successfully.' })
  } catch (error) {
    console.error('Create poll error:', error)
    res.status(500).json({ message: 'Server error creating poll.' })
  }
})

router.get('/events/:id/polls', async (req, res) => {
  try {
    const { id } = req.params

    const db = await connectDB()
    const pollsCollection = db.collection('polls')

    const polls = await pollsCollection
      .find({ eventId: id })
      .sort({ createdAt: -1 })
      .toArray()

    res.status(200).json(polls)
  } catch (error) {
    console.error('Get polls error:', error)
    res.status(500).json({ message: 'Server error fetching polls.' })
  }
})

router.post('/polls/:pollId/vote', async (req, res) => {
  try {
    const { pollId } = req.params
    const { optionIndex, email } = req.body

    if (!ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: 'Invalid poll ID.' })
    }

    if (optionIndex === undefined || !email) {
      return res.status(400).json({ message: 'Option index and email are required.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const pollsCollection = db.collection('polls')

    const poll = await pollsCollection.findOne({
      _id: new ObjectId(pollId)
    })

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' })
    }

    if (poll.votedBy?.includes(normalizedEmail)) {
      return res.status(400).json({ message: 'You have already voted on this poll.' })
    }

    if (
      typeof optionIndex !== 'number' ||
      optionIndex < 0 ||
      optionIndex >= (poll.options || []).length
    ) {
      return res.status(400).json({ message: 'Invalid poll option.' })
    }

    await pollsCollection.updateOne(
      { _id: new ObjectId(pollId) },
      {
        $inc: {
          [`options.${optionIndex}.votes`]: 1
        },
        $push: {
          votedBy: normalizedEmail
        }
      }
    )

    res.status(200).json({ message: 'Vote recorded successfully.' })
  } catch (error) {
    console.error('Vote poll error:', error)
    res.status(500).json({ message: 'Server error while recording vote.' })
  }
})
router.get('/matchmaking-requests/:id/messages', async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.query

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' })
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const normalizedEmail = normalizeEmail(email)

    const db = await connectDB()
    const requestsCollection = db.collection('matchmaking_requests')
    const messagesCollection = db.collection('matchmaking_messages')

    const requestDoc = await requestsCollection.findOne({ _id: new ObjectId(id) })

    if (!requestDoc) {
      return res.status(404).json({ message: 'Connection request not found.' })
    }

    if (requestDoc.status !== 'accepted') {
      return res.status(400).json({ message: 'Chat is only available for accepted connections.' })
    }

    const allowedUsers = [requestDoc.fromEmail, requestDoc.toEmail]
    if (!allowedUsers.includes(normalizedEmail)) {
      return res.status(403).json({ message: 'You are not allowed to view this chat.' })
    }

    const messages = await messagesCollection
      .find({ requestId: id })
      .sort({ createdAt: 1 })
      .toArray()

    res.status(200).json(messages)
  } catch (error) {
    console.error('Get matchmaking messages error:', error)
    res.status(500).json({ message: 'Server error while fetching messages.' })
  }
})

router.post('/matchmaking-requests/:id/messages', async (req, res) => {
  try {
    const { id } = req.params
    const { email, name, message } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' })
    }

    if (!email || !message) {
      return res.status(400).json({ message: 'Email and message are required.' })
    }

    const normalizedEmail = normalizeEmail(email)
    const trimmedMessage = String(message).trim()

    if (!trimmedMessage) {
      return res.status(400).json({ message: 'Message cannot be empty.' })
    }

    const db = await connectDB()
    const requestsCollection = db.collection('matchmaking_requests')
    const messagesCollection = db.collection('matchmaking_messages')

    const requestDoc = await requestsCollection.findOne({ _id: new ObjectId(id) })

    if (!requestDoc) {
      return res.status(404).json({ message: 'Connection request not found.' })
    }

    if (requestDoc.status !== 'accepted') {
      return res.status(400).json({ message: 'Chat is only available for accepted connections.' })
    }

    const allowedUsers = [requestDoc.fromEmail, requestDoc.toEmail]
    if (!allowedUsers.includes(normalizedEmail)) {
      return res.status(403).json({ message: 'You are not allowed to send messages in this chat.' })
    }

    const newMessage = {
      requestId: id,
      eventId: requestDoc.eventId,
      senderEmail: normalizedEmail,
      senderName: name ? String(name).trim() : 'User',
      message: trimmedMessage,
      createdAt: new Date()
    }

    await messagesCollection.insertOne(newMessage)

    await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          updatedAt: new Date(),
          read: false
        }
      }
    )

    res.status(201).json({ message: 'Message sent successfully.' })
  } catch (error) {
    console.error('Send matchmaking message error:', error)
    res.status(500).json({ message: 'Server error while sending message.' })
  }
})

module.exports = router