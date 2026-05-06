import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, Button, Badge } from '@chakra-ui/react'; 
import axios from 'axios';
import { ChatState } from '../Context/chatProvider';
import { toaster } from './ui/toaster';
import { FiPlus } from "react-icons/fi";
import GroupChatModal from './miscellaneous/GroupChat';

const MyChats = () => {
  const {
    user, Chats, setChats, SelectedChat, setSelectedChat,
    blockedUsers, setBlockedUsers,
    unreadCounts, clearUnread, 
  } = ChatState();

  const [contextMenu, setContextMenu] = useState(null);
  const menuRef = useRef(null);

  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("http://localhost:5000/api/chat", config);
      const unique = data.filter(
        (chat, index, self) => index === self.findIndex((c) => c._id === chat._id)
      );
      setChats(unique);
    } catch (error) {
      toaster.create({ title: "Error fetching chats", type: "error", duration: 3000 });
    }
  };

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/user/blockedUsers", config);
        setBlockedUsers(data.blockedUsers || []);
      } catch (error) {
        console.error("Failed to fetch blocked users", error);
      }
    };
    fetchBlockedUsers();
  }, []);

  const handleRightClick = (e, chat) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, chat });
  };

  const handleDeleteChat = async (chat) => {
    setContextMenu(null);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/chat/${chat._id}`, config);
      setChats(Chats.filter((c) => c._id !== chat._id));
      if (SelectedChat?._id === chat._id) setSelectedChat(null);
      toaster.create({ title: "Chat deleted", type: "success", duration: 3000 });
    } catch (error) {
      toaster.create({ title: "Failed to delete chat", type: "error", duration: 3000 });
    }
  };

  const handleBlockUser = async (chat) => {
    setContextMenu(null);
    if (chat.isGroupChat) {
      toaster.create({ title: "Cannot block in group chats", type: "warning", duration: 3000 });
      return;
    }
    const otherUser = chat.users?.find((u) => u._id !== user._id);
    if (!otherUser) return;

    const isAlreadyBlocked = blockedUsers?.includes(otherUser._id);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (isAlreadyBlocked) {
        await axios.put("http://localhost:5000/api/user/unblock", { userToUnblockId: otherUser._id }, config);
        setBlockedUsers(blockedUsers.filter((id) => id !== otherUser._id));
        toaster.create({ title: `${otherUser.Name} unblocked!`, type: "success", duration: 3000 });
      } else {
        await axios.put("http://localhost:5000/api/user/block", { userToBlockId: otherUser._id }, config);
        setBlockedUsers([...blockedUsers, otherUser._id]);
        toaster.create({ title: `${otherUser.Name} blocked!`, type: "success", duration: 3000 });
      }
    } catch (error) {
      toaster.create({ title: "Action failed", type: "error", duration: 3000 });
    }
  };


  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    clearUnread(chat._id);
  };

  return (
    <Box
      display={{ base: SelectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      position="relative"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" w="100%" mb={3}>
        <Text fontSize="2xl" fontFamily="Work sans">My Chats</Text>
        <GroupChatModal>
          <Button fontSize="sm" variant="outline" colorScheme="teal" onClick={() => {}}>
            <FiPlus /> New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box w="100%" overflowY="auto">
        {(Array.isArray(Chats) ? Chats : []).map((chat) => {
          const otherUser = !chat.isGroupChat && chat.users?.find((u) => u._id !== user._id);

        
          const unreadCount = unreadCounts?.[chat._id] || 0;

          return (
            <Box
              key={chat._id}
              onClick={() => handleChatClick(chat)} 
              onContextMenu={(e) => handleRightClick(e, chat)}
              cursor="pointer"
              bg={SelectedChat?._id === chat._id ? "teal.400" : "#E8E8E8"}
              color={SelectedChat?._id === chat._id ? "white" : "black"}
              px={3} py={2}
              borderRadius="lg"
              mb={2}
              display="flex"
              justifyContent="space-between"  
              alignItems="center"
            >
            
              <Box flex={1} overflow="hidden">
                <Text fontWeight="bold" noOfLines={1}>
                  {chat.isGroupChat ? chat.chatName : otherUser?.Name}
                </Text>
                {chat.latestMessage?.content && (
                  <Text fontSize="sm" noOfLines={1} opacity={0.8}>
                    {chat.latestMessage.content.length > 30
                      ? chat.latestMessage.content.substring(0, 30) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>

          
              {unreadCount > 0 && (
                <Badge
                  ml={2}
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  fontSize="11px"
                  minW="22px"
                  h="22px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  flexShrink={0}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Box>
          );
        })}
      </Box>

      
      {contextMenu && (
        <Box
          ref={menuRef}
          position="fixed"
          top={contextMenu.y}
          left={contextMenu.x}
          bg="white"
          boxShadow="lg"
          borderRadius="md"
          zIndex={1000}
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
        >
          <Box
            px={4} py={2} cursor="pointer"
            _hover={{ bg: "red.50", color: "red.500" }}
            onClick={() => handleDeleteChat(contextMenu.chat)}
          >
            Delete Chat
          </Box>
          {!contextMenu.chat.isGroupChat && (
            <Box
              px={4} py={2} cursor="pointer"
              _hover={{ bg: "orange.50", color: "orange.500" }}
              onClick={() => handleBlockUser(contextMenu.chat)}
            >
              {blockedUsers?.includes(
                contextMenu.chat.users?.find((u) => u._id !== user._id)?._id
              ) ? "Unblock User" : "Block User"}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MyChats;