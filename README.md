# EventHive :honeybee:
EventHive is a full-stack web application that allows users to discover, create, manage, and interact with events. The platform supports both attendees and organizers, providing features such as event browsing, RSVP management, guest analytics, and interactive polls.

:video_camera: Watch the [demo](https://youtube.com)

## Pre-requisites
```bash
cd eventhive
npm install
npm install jquery vue-router
npm install d3
cd backend
npm install
cd ../..
npm install concurrently --save-dev
```
## How to run
Navigate to the project root folder:

`
npm run dev:all
`
## Features

### Event Management
- Create events with: Title, date, location, category, description, Event image
- Edit and delete events
- View detailed event pages

### Search & Filtering
- Search events by title
- Filter by:Category, Date (year/month/day), and Location

### Event Matchmaking
- Connect with other event attendees with similar interests
- Messaging feature

### User roles:
- Everyone:
    - Browse/filter search for events
    - View event details
    - RSVP to events (Attending/Maybe/Decline)
    - Save events
    - Submit poll responses
    - Connect with event attendees
    - Manage inbox reminders and messages
    - View and like community suggestions

- Attendies
    - Submit event suggestions
    - MySuggestions page
    - View upcoming events and recent activity on dashboard

- Organizers
    - Create/Edit events
    - MyEvents page
    - Create polls
    - Access event guestlist
    - View event analytics
    - View top event requests on dashboard

### Guest Analytics (D3)
- RSVP breakdown and poll results visualization
- Data-driven UI using D3.js

### Poll System
- Organizers can include polls when creating events

### Persistent Data
- Events, users, RSVPs, and poll responses are stored in MongoDB

### UI & UX
- Responsive design
- Custom styling with CSS
- Dynamic DOM updates using Vue
- Smooth animations and transitions

## Tech Stack
### Frontend
- Vue 3
- JavaScript
- HTML / CSS
- jQuery
- D3.js
### Backend
- Node.js
- Express.js
### Database
- MongoDB Atlas (cloud database)

## Future improvements
- 
- 
- 

## Images

## Contributors
- Malasa Khan
- Mehreen Morshed
- Muskan Morshed
- Shimza Warraich
