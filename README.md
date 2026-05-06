# Me-2-U - Real Time Chat Application

A full-stack real-time chat application built with the MERN stack.

## 🚀 Features

- 🔐 JWT Authentication
- ✅ Real Email Verification (Nodemailer + Gmail)
- 💬 Real-time messaging with Socket.io
- 👥 Group Chat
- 🔍 User Search
- 🚫 Block / Unblock Users
- 🗑️ Delete Chats
- 🖼️ Image Upload (Cloudinary)
- 📱 Responsive Design

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Chakra UI
- Axios
- Socket.io-client

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer
- Socket.io

## ⚙️ Setup Instructions

### 1. Clone the repo
\`\`\`bash
git clone https://github.com/yourusername/Me-2-U.git
cd Me-2-U
\`\`\`

### 2. Install backend dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Install frontend dependencies
\`\`\`bash
cd frontend
npm install
\`\`\`

### 4. Create `.env` file in root
\`\`\`env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
BASE_URL=http://localhost:5000
PORT=5000
\`\`\`

### 5. Run the app
\`\`\`bash
# Run backend
npm start

# Run frontend (new terminal)
cd frontend
npm start
\`\`\`
