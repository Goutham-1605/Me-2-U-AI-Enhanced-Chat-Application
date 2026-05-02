import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, Input, Button } from '@chakra-ui/react';
import axios from 'axios';
import io from 'socket.io-client';
import { ChatState } from '../Context/chatProvider';
import GroupInfoModal from './miscellaneous/GroupInfo';

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = () => {
  const { user, SelectedChat, setChats, setSelectedChat, blockedUsers } = ChatState(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const bottomRef = useRef(null);

  const otherUser = SelectedChat?.users?.find((u) => u._id !== user._id);

  
  const isBlocked = !SelectedChat?.isGroupChat && 
    blockedUsers?.includes(otherUser?._id);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = SelectedChat;
  }, [SelectedChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.Chat._id) return;
      setMessages((prev) => [...prev, newMessageReceived]);
    });

    socket.on("group updated", (updatedChat) => {
      setChats((prev) => prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)));
      if (selectedChatCompare?._id === updatedChat._id) {
        setSelectedChat(updatedChat);
      }
    });

    return () => {
      socket.off("message received");
      socket.off("group updated");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!SelectedChat) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/message/${SelectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", SelectedChat._id);
    } catch (error) {
      console.error("Failed to fetch messages");
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (!newMessage.trim()) return;
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post("http://localhost:5000/api/message", {
          content: newMessage,
          chatId: SelectedChat._id,
        }, config);

        setMessages((prev) => [...prev, data]);
        setNewMessage("");
        socket.emit("new message", data);
      } catch (error) {
    
        const errMsg = error.response?.data?.message;
        if (errMsg?.includes("blocked")) {
          console.error(errMsg);
        } else {
          console.error("Failed to send message");
        }
      }
    }
  };

  if (!SelectedChat) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <Text fontSize="2xl" color="gray.400" fontFamily="Work sans">
          Click on a user to start chatting
        </Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDir="column" w="100%" h="100%">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pb={3} px={2}
        borderBottomWidth="1px"
      >
        <Text fontSize="2xl" fontFamily="Work sans" fontWeight="bold">
          {SelectedChat.isGroupChat ? SelectedChat.chatName : otherUser?.Name}
        </Text>
        {SelectedChat.isGroupChat && (
          <GroupInfoModal>
            <Button variant="outline" size="sm">Group Info</Button>
          </GroupInfoModal>
        )}
      </Box>

      <Box display="flex" flexDir="column" overflowY="auto" p={3} flex={1} gap={2}>
        {loading ? (
          <Text>Loading messages...</Text>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg._id}
              alignSelf={msg.sender._id === user._id ? "flex-end" : "flex-start"}
              bg={msg.sender._id === user._id ? "teal.400" : "gray.200"}
              color={msg.sender._id === user._id ? "white" : "black"}
              px={4} py={2}
              borderRadius="lg"
              maxW="75%"
            >
              {SelectedChat.isGroupChat && msg.sender._id !== user._id && (
                <Text fontSize="xs" color="gray.500" mb={1}>{msg.sender.Name}</Text>
              )}
              <Text>{msg.content}</Text>
            </Box>
          ))
        )}
        <div ref={bottomRef} />
      </Box>

  
      {isBlocked ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
          borderTopWidth="1px"
          bg="red.50"
        >
          <Text color="red.500" fontWeight="bold">
            🚫 You have blocked this user. Unblock to send messages.
          </Text>
        </Box>
      ) : (
        <Box display="flex" gap={2} p={3} borderTopWidth="1px">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={sendMessage}
          />
          <Button colorScheme="teal" onClick={sendMessage}>Send</Button>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;