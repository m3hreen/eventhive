# EventHive 🐝EventHive is a full-stack web application that allows users to discover, create, manage, and interact with events. The platform supports both attendees and organizers, providing features such as event browsing, RSVP management, guest analytics, interactive polls, attendee matchmaking, inbox messaging, and community suggestions.📹 Watch the [demo](https://youtube.com)---## 📦 Pre-requisitesMake sure the following are installed:- Node.js- npm- Internet connection for MongoDB AtlasInstall dependencies:```bashcd eventhivenpm installnpm install jquery vue-router d3cd backendnpm installcd ..npm install concurrently --save-dev

▶️ How to Run
From the project root folder, run:
npm run dev:all
Servers


Frontend: runs on Vite, usually at http://localhost:5173


Backend: runs on Express, usually at http://localhost:5001


⚠️ The backend must be running for:


login/signup


RSVP


polls


inbox/chat


matchmaking


reminders



🧠 Project Overview
EventHive creates a complete event experience for both attendees and organizers.
Users can:


browse events


RSVP


vote in polls


connect with other attendees


send messages


receive reminders


Organizers can:


create events


manage guests


send reminders


analyze RSVPs and poll results using D3 visualizations



🚀 Features
📅 Event Management


Create events with:


Title


Date


Location


Category


Description


Event image




Edit and delete events


View detailed event pages


Save events


🔍 Search and Filtering


Search events by title


Filter by:


Category


Date (year/month/day)


Location




✅ RSVP System


RSVP as:


Attending


Maybe


Declined




Organizer guest tracking


Recent RSVP activity display


🤝 Event Matchmaking


Connect with attendees with similar interests


Send connection requests


Accept or decline requests


Chat via inbox messaging system


📊 Guest Analytics (D3)


RSVP breakdown bar chart


Poll results pie chart


Built using D3.js (SVG-based visualizations)


Dynamic data updates


🗳️ Poll System


Organizers create polls


Attendees vote


Results stored in MongoDB


Visualized using D3 charts


💡 Suggestions System


Attendees submit event ideas


Community can view and like suggestions


Helps organizers understand demand


📥 Inbox System


Event reminders


Matchmaking requests


Chat messaging


Read/unread notifications


💾 Persistent Data
Stored in MongoDB:


Users


Events


RSVPs


Polls


Suggestions


Saved events


Matchmaking requests


Messages


Reminders



👥 User Roles
Everyone


Browse/search events


View event details


RSVP


Save events


Vote on polls


Connect with attendees


Use inbox


View suggestions


Attendees


Submit suggestions


Access MySuggestions page


View dashboard activity


Use matchmaking and messaging


Organizers


Create/edit/delete events


View MyEvents page


Create polls


Access guest lists


View analytics


Send reminders



🎨 UI and UX


Responsive design


Custom CSS styling


Dynamic DOM updates using Vue


Smooth animations


Clean dashboard layouts



🛠️ Tech Stack
Frontend


Vue 3


JavaScript


HTML / CSS


jQuery


D3.js


Backend


Node.js


Express.js


Database


MongoDB Atlas


Concepts Used


Fetch API (AJAX)


REST API design


Dynamic DOM rendering


Role-based routing


Data visualization (SVG via D3)



📁 Folder Structure
eventhive/│├── src/│   ├── pages/│   ├── components/│   ├── router/│   └── assets/│├── backend/│   ├── routes/│   ├── db/│   └── server files│└── package files

⚠️ Notes for Running


MongoDB Atlas must be connected correctly


Backend must be running for full functionality


If the app does not run locally, refer to the demo video



🎥 Demo Requirements
The demo video should show:


login/signup


event creation


RSVP


poll voting


suggestions


guest analytics (D3 charts)


matchmaking


inbox messaging


notifications



🔮 Future Improvements


Real-time messaging with Socket.io


Image uploads instead of URLs


Advanced notifications


Event recommendations


Calendar integration


Improved mobile UX



📸 Images
Add screenshots here if needed.

👨‍💻 Contributors


Malasa Khan


Mehreen Morshed


Muskan Morshed


Shimza Warraich


