import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, Input, Button, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import io from 'socket.io-client';
import { ChatState } from '../Context/chatProvider';
import GroupInfoModal from './miscellaneous/GroupInfo';

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const THEMES = [
  { name: "Default", bg: "#f5f4f0" },
  { name: "Ocean", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Midnight", bg: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)" },
  { name: "Peach", bg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { name: "Mint", bg: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" },
  { name: "Rose", bg: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)" },
];

const SingleChat = () => {
  const {
    user, SelectedChat, setChats, setSelectedChat, blockedUsers,
    notifications, setNotifications,
    incrementUnread, clearUnread,
  } = ChatState();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showThemes, setShowThemes] = useState(false);
  const [chatBg, setChatBg] = useState("#f5f4f0");

  const bottomRef = useRef(null);
  const otherUser = SelectedChat?.users?.find((u) => u._id !== user._id);
  const isBlocked = !SelectedChat?.isGroupChat && blockedUsers?.includes(otherUser?._id);

  useEffect(() => {
    if (SelectedChat?._id) {
      const saved = localStorage.getItem(`chatBg_${SelectedChat._id}`);
      if (saved) setChatBg(saved);
      else setChatBg("#f5f4f0");
    }
  }, [SelectedChat?._id]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = SelectedChat;
    if (SelectedChat?._id) {
      clearUnread(SelectedChat._id);
      fetchPinnedMessage(SelectedChat._id);
    }
  }, [SelectedChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.Chat._id) {
        if (!newMessageReceived.isBot) {
          incrementUnread(newMessageReceived.Chat._id);
          setNotifications((prev) => {
            const already = prev.find((n) => n.Chat._id === newMessageReceived.Chat._id);
            if (already) return prev;
            return [newMessageReceived, ...prev];
          });
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });

    socket.on("message edited", (updatedMsg) => {
      setMessages((prev) => prev.map((m) => m._id === updatedMsg._id ? updatedMsg : m));
    });

    socket.on("message deleted", (updatedMsg) => {
      setMessages((prev) => prev.map((m) => m._id === updatedMsg._id ? updatedMsg : m));
    });

    socket.on("message pinned", (msg) => setPinnedMessage(msg));

    socket.on("group updated", (updatedChat) => {
      setChats((prev) => prev.map((c) => c._id === updatedChat._id ? updatedChat : c));
      if (selectedChatCompare?._id === updatedChat._id) setSelectedChat(updatedChat);
    });

    socket.on("botTyping", ({ isTyping }) => setIsTyping(isTyping));

    return () => {
      socket.off("message received");
      socket.off("message edited");
      socket.off("message deleted");
      socket.off("message pinned");
      socket.off("group updated");
      socket.off("botTyping");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchMessages = async () => {
    if (!SelectedChat) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `http://localhost:5000/api/message/${SelectedChat._id}`, config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", SelectedChat._id);
    } catch {
      console.error("Failed to fetch messages");
      setLoading(false);
    }
  };

  const fetchPinnedMessage = async (chatId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `http://localhost:5000/api/message/pin/${chatId}`, config
      );
      setPinnedMessage(data);
    } catch {
      setPinnedMessage(null);
    }
  };

  const handleEdit = async (msgId, newContent) => {
    try {
      const config = {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/message/${msgId}/edit`,
        { content: newContent }, config
      );
      setMessages((prev) => prev.map((m) => m._id === data._id ? data : m));
      socket.emit("message edited", data);
      setEditingMsgId(null);
      setEditContent("");
    } catch {
      console.error("Edit failed");
    }
  };

  const handleDelete = async (msgId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.delete(
        `http://localhost:5000/api/message/${msgId}/delete`, config
      );
      setMessages((prev) => prev.map((m) => m._id === data._id ? data : m));
      socket.emit("message deleted", data);
    } catch {
      console.error("Delete failed");
    }
  };

  const handlePin = async (msg) => {
    try {
      const config = {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
      };
      await axios.post(
        `http://localhost:5000/api/message/pin`,
        { messageId: msg._id, chatId: SelectedChat._id }, config
      );
      setPinnedMessage(msg);
      socket.emit("message pinned", msg);
    } catch {
      console.error("Pin failed");
    }
  };

  const applyTheme = (bg) => {
    setChatBg(bg);
    localStorage.setItem(`chatBg_${SelectedChat._id}`, bg);
    setShowThemes(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => applyTheme(`url(${reader.result})`);
    reader.readAsDataURL(file);
  };

  const handleRightClick = (e, msg) => {
    e.preventDefault();
    if (msg.isDeleted) return;
    setContextMenu({ x: e.clientX, y: e.clientY, msg });
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (!newMessage.trim()) return;
      try {
        const config = {
          headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
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
    <Box display="flex" flexDir="column" w="100%" h="100%" position="relative">

  
      <Box
        display="flex" justifyContent="space-between" alignItems="center"
        pb={3} px={2} borderBottomWidth="1px" bg="white" zIndex={2}
      >
        <Text fontSize="2xl" fontFamily="Work sans" fontWeight="bold">
          {SelectedChat.isGroupChat ? SelectedChat.chatName : otherUser?.Name}
        </Text>
        <Box display="flex" gap={2} alignItems="center">
          <Button size="sm" variant="outline" onClick={() => setShowThemes((p) => !p)}>
            🎨 Theme
          </Button>
          {SelectedChat.isGroupChat && (
            <GroupInfoModal>
              <Button variant="outline" size="sm">Group Info</Button>
            </GroupInfoModal>
          )}
        </Box>
      </Box>

      {showThemes && (
        <Box
          position="absolute" top="60px" right="10px"
          bg="white" boxShadow="lg" borderRadius="xl"
          p={4} zIndex={100} w="280px"
          border="0.5px solid" borderColor="gray.200"
        >
          <Text fontWeight="bold" fontSize="sm" mb={3}>Choose background</Text>
          <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2} mb={3}>
            {THEMES.map((theme) => (
              <Box
                key={theme.name}
                w="50px" h="50px" borderRadius="md"
                background={theme.bg}
                cursor="pointer"
                border="2px solid"
                borderColor={chatBg === theme.bg ? "teal.400" : "gray.200"}
                onClick={() => applyTheme(theme.bg)}
                title={theme.name}
                backgroundSize="cover"
              />
            ))}
          </Box>
          <Text fontSize="xs" color="gray.500" mb={2}>Or upload from gallery:</Text>
          <Input type="file" accept="image/*" size="sm" onChange={handleImageUpload} p={1} />
          <Button size="xs" variant="ghost" mt={2} w="full" onClick={() => applyTheme("#f5f4f0")}>
            Reset to default
          </Button>
        </Box>
      )}

    
      {pinnedMessage && (
        <Box
          bg="yellow.50" px={4} py={2}
          borderBottomWidth="1px" borderColor="yellow.200"
          display="flex" alignItems="center" justifyContent="space-between"
        >
          <Box>
            <Text fontSize="10px" color="yellow.700" fontWeight="bold" mb={1}>📌 PINNED MESSAGE</Text>
            <Text fontSize="sm" color="gray.700" noOfLines={1}>{pinnedMessage.content}</Text>
          </Box>
          <Button size="xs" variant="ghost" color="gray.400" onClick={() => setPinnedMessage(null)}>✕</Button>
        </Box>
      )}


      <Box
        display="flex" flexDir="column"
        overflowY="auto" p={3} flex={1} gap={2}
        w="100%"                          
        background={chatBg}
        backgroundSize="cover"
        backgroundPosition="center"
      >
        {loading ? (
          <Text>Loading messages...</Text>
        ) : (
          messages.map((msg) => {

          
            const isMine = msg.sender._id?.toString() === user._id?.toString();

            return (
      
              <Box
                key={msg._id}
                w="100%"
                display="flex"
                justifyContent={
                  msg.isBot ? "flex-start"
                  : isMine ? "flex-end"     
                  : "flex-start"           
                }
                onContextMenu={(e) => handleRightClick(e, msg)}
              >
                {editingMsgId === msg._id ? (
            
                  <Box display="flex" gap={2} alignItems="center" maxW="75%">
                    <Input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      size="sm" autoFocus bg="white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdit(msg._id, editContent);
                        if (e.key === "Escape") { setEditingMsgId(null); setEditContent(""); }
                      }}
                    />
                    <Button size="sm" colorScheme="teal"
                      onClick={() => handleEdit(msg._id, editContent)}>Save</Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => { setEditingMsgId(null); setEditContent(""); }}>✕</Button>
                  </Box>
                ) : (
              
                  <Box
                    bg={
                      msg.isBot ? "purple.100"
                      : msg.isDeleted ? "gray.100"
                      : isMine ? "teal.400"
                      : "white"
                    }
                    color={
                      msg.isBot ? "purple.800"
                      : msg.isDeleted ? "gray.400"
                      : isMine ? "white"
                      : "black"
                    }
                    px={4} py={2}
                    borderRadius={
                      msg.isBot ? "4px 16px 16px 16px"
                      : isMine ? "16px 4px 16px 16px"  
                      : "4px 16px 16px 16px"
                    }
                    maxW="75%"
                    boxShadow="sm"
                    fontStyle={msg.isDeleted ? "italic" : "normal"}
                    borderWidth={msg.isBot ? "1px" : "0"}
                    borderColor="purple.200"
                  >
                
                    {(SelectedChat.isGroupChat && !isMine) || msg.isBot ? (
                      <Text
                        fontSize="xs" mb={1} fontWeight="bold"
                        color={msg.isBot ? "purple.500" : "teal.600"}
                      >
                        {msg.sender.name || msg.sender.Name}
                      </Text>
                    ) : null}

                    <Text>{msg.content}</Text>

            
                    {msg.isEdited && !msg.isDeleted && (
                      <Text
                        fontSize="10px" mt={1}
                        color={isMine ? "whiteAlpha.700" : "gray.400"}
                      >
                        (edited)
                      </Text>
                    )}
                  </Box>
                )}
              </Box>
            );
          })
        )}

      
        {isTyping && (
          <Box
            w="100%" display="flex" justifyContent="flex-start"
          >
            <Box
              bg="purple.100" color="purple.800"
              px={4} py={2} borderRadius="4px 16px 16px 16px"
              borderWidth="1px" borderColor="purple.200"
              display="flex" alignItems="center" gap={2}
            >
              <Spinner size="xs" color="purple.500" />
              <Text fontSize="sm">🤖 AI Assistant is thinking...</Text>
            </Box>
          </Box>
        )}

        <div ref={bottomRef} />
      </Box>

      
      {contextMenu && (
        <Box
          position="fixed"
          top={`${contextMenu.y}px`}
          left={`${contextMenu.x}px`}
          bg="white" boxShadow="lg"
          borderRadius="lg" zIndex={1000}
          overflow="hidden" minW="150px"
          border="0.5px solid" borderColor="gray.200"
        >
          {contextMenu.msg.sender._id?.toString() === user._id?.toString() &&
            !contextMenu.msg.isDeleted && (
            <>
              <Box
                px={4} py={2} cursor="pointer" fontSize="sm"
                _hover={{ bg: "gray.50" }}
                onClick={() => {
                  setEditingMsgId(contextMenu.msg._id);
                  setEditContent(contextMenu.msg.content);
                  setContextMenu(null);
                }}
              >Edit</Box>
              <Box
                px={4} py={2} cursor="pointer" fontSize="sm" color="red.500"
                _hover={{ bg: "red.50" }}
                onClick={() => { handleDelete(contextMenu.msg._id); setContextMenu(null); }}
              >Delete</Box>
            </>
          )}
          <Box
            px={4} py={2} cursor="pointer" fontSize="sm"
            _hover={{ bg: "gray.50" }}
            onClick={() => { handlePin(contextMenu.msg); setContextMenu(null); }}
          >Pin message</Box>
        </Box>
      )}

      
      {isBlocked ? (
        <Box
          display="flex" alignItems="center" justifyContent="center"
          p={4} borderTopWidth="1px" bg="red.50"
        >
          <Text color="red.500" fontWeight="bold">
            You have blocked this user. Unblock to send messages.
          </Text>
        </Box>
      ) : (
        <Box display="flex" flexDir="column" gap={1} p={3} borderTopWidth="1px" bg="white">
          <Text fontSize="xs" color="gray.400">
            💡 Tip: Type <b>@ai</b> to ask the AI · Right-click any message to edit, delete or pin
          </Text>
          <Box display="flex" gap={2}>
            <Input
              placeholder="Type a message... or @ai ask me anything!"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={sendMessage}
            />
            <Button colorScheme="teal" onClick={sendMessage}>Send</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;