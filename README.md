# <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Honeybee.png" alt="Honeybee" width="35" height="35" /> EventHive

> A full-stack event management platform where attendees discover, connect, and engage — while organizers track, analyze, and grow their events.

[![Demo](https://img.shields.io/badge/Watch-Demo-red?style=for-the-badge&logo=youtube)](https://youtube.com)

[![Made with Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#️tech-stack)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [User Roles](#user-roles)
- [Database Schema](#️database-schema)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)
- [Contributors](#contributors)

---

## Features

| Category | Features |
|----------|----------|
|**Events** | Create, edit, delete, save, and browse events with images, dates, locations & categories |
|**Search** | Filter by title, category, date range, or location |
|**RSVP** | Attending / Maybe / Declined with organizer tracking |
|**Matchmaking** | Connect with like-minded attendees, send/accept requests, chat |
|**Analytics** | D3.js bar charts & pie charts for RSVPs and poll results |
|**Polls** | Organizers create polls; attendees vote; results visualized live |
|**Suggestions** | Community-driven event ideas with upvotes |
|**Inbox** | Event reminders, matchmaking requests, chat messages, read/unread status |

---

## Tech Stack

<div align="center">

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Vue 3 • JavaScript • HTML5 • CSS3 • jQuery • D3.js |
| **Backend** | Node.js • Express.js • REST API |
| **Database** | MongoDB Atlas |
| **Tooling** | Vite • Concurrently • Fetch API |

</div>

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/)
- MongoDB Atlas account (or local MongoDB)

### Steps

# 1. Clone the repository
```
git clone https://github.com/m3hreen/webdev-final.git
```

# 2. Install frontend dependencies
```
cd eventhive
npm install
npm install jquery vue-router d3
npm install d3
```

# 3. Install backend dependencies
```
cd backend
npm install
```

# 4. Install concurrently (to run both servers at once)
```
cd ../..
npm install concurrently --save-dev
```

> **Note:** Create a `.env` file in the `backend/` folder with your MongoDB Atlas connection string.

---

## Running the App

```bash
npm run dev:all
```

| Server | URL |
|--------|-----|
|Frontend (Vite) | `http://localhost:5173` |
|Backend (Express) | `http://localhost:5001` |

> **The backend MUST be running** for: login/signup, RSVP, polls, inbox/chat, matchmaking, and reminders.

---

## User Roles

<table>
<tr>
<th>Everyone</th>
<th>Attendees</th>
<th>Organizers</th>
</tr>
<tr>
<td>

- Browse/search events
- View event details
- RSVP
- Save events
- Vote on polls
- Connect with attendees
- Use inbox
- View suggestions

</td>
<td>

- Submit event suggestions
- Access MySuggestions page
- View dashboard activity
- Use matchmaking & messaging
- Like suggestion posts

</td>
<td>

- Create/edit/delete events
- View MyEvents page
- Create polls
- Access guest lists
- View analytics (D3 charts)
- Send reminders
- Like suggestion posts

</td>
</tr>
</table>

---

## Database Schema

**MongoDB Collections:**

```
Users
Events
RSVPs
Polls
Suggestions
SavedEvents
MatchmakingRequests
Messages
Reminders
```

---

## Project Structure

```
eventhive/
│
├── src/                    # Frontend (Vue 3)
│   ├── pages/                 # Page components
│   ├── components/            # Reusable Vue components
│   ├── router/                # Vue Router config
│   └── assets/                # CSS, images, etc.
│
├── backend/                # Backend (Node.js + Express)
│   ├── routes/                # API endpoints
│   ├── db/                    # MongoDB connection
│   └── server.js              # Entry point
│
└── package.json            # Root package file
```

---

## Future Roadmap

- Real-time messaging with **Socket.io**
- Image uploads (instead of URLs) via Cloudinary
- Push & email notifications\
- AI-powered event recommendations
- Google Calendar / iCal integration
- Mobile-responsive PWA

---

## Screenshots



---

## Contributors

- Malasa Khan
- Mehreen Morshed
- Muskan Morshed
- Shimza Warraich

---

<div align="center">
  <sub>Built by Team EventHive 🐝 </sub>
</div>
