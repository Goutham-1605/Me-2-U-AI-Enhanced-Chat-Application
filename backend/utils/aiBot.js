const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const roomSessions = {};

async function getAIResponse(roomId, userMessage, username) {
  
  if (!roomSessions[roomId]) {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      systemInstruction: `You are a helpful AI assistant inside a group chat room.
      Keep responses concise and conversational (2-4 sentences max).
      Be friendly, helpful, and to the point.`,
    });

    roomSessions[roomId] = model.startChat({
      history: [], 
    });
  }

  const chat = roomSessions[roomId];

  const result = await chat.sendMessage(`${username} asks: ${userMessage}`);
  const response = await result.response;
  return response.text();
}

module.exports = { getAIResponse };