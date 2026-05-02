import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Input,
  Box,
  Text,
  Avatar,
} from '@chakra-ui/react';
import axios from 'axios';
import { ChatState } from '../../Context/chatProvider';
import { toaster } from '../ui/toaster';

const GroupChatModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, Chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`http://localhost:5000/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error fetching users",
        type: "error",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  const handleAddUser = (userToAdd) => { 
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toaster.create({
        title: "User already added",
        type: "warning",
        duration: 3000,
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToRemove._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toaster.create({
        title: "Please fill all fields and add at least one user",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (selectedUsers.length < 2) {
      toaster.create({
        title: "At least 2 users are required for a group chat",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.post("http://localhost:5000/api/chat/group", {
        Name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      }, config);

      const chatList = Array.isArray(Chats) ? Chats : [];
if (!chatList.find((c) => c._id === data._id)) {
  setChats([data, ...chatList]);
}
      setOpen(false);
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);

      toaster.create({
        title: `${groupChatName} group created!`,
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.log(error.response?.data);  
  console.log(error.response?.status);
      toaster.create({
        title: "Failed to create group chat",
        type: "error",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>

      <Dialog.Root open={open}
  onOpenChange={(e) => {
    setOpen(e.open);
    if (!e.open) {
      
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);
    }
  }}
        
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize="2xl" fontFamily="Work sans">
                Create Group Chat
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              
              <Input
                placeholder="Group chat name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />

              
              <Input
                placeholder="Search users to add"
                mb={3}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />

              
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                {selectedUsers.map((u) => (
                  <Box
                    key={u._id}
                    display="flex"
                    alignItems="center"
                    bg="teal.100"
                    px={2}
                    py={1}
                    borderRadius="full"
                    gap={1}
                  >
                    <Text fontSize="sm">{u.Name}</Text>
                    <Text
                      fontSize="xs"
                      cursor="pointer"
                      color="teal.700"
                      fontWeight="bold"
                      onClick={() => handleRemoveUser(u)}
                    >
                      ✕
                    </Text>
                  </Box>
                ))}
              </Box>

              
              {loading ? (
                <Text>Loading...</Text>
              ) : (
                searchResult.slice(0, 4).map((u) => (
                  <Box
                    key={u._id}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    p={2}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "teal.100" }}
                    onClick={() => handleAddUser(u)}
                  >
                    <Avatar.Root size="sm">
                      <Avatar.Image src={u.Pic} />
                      <Avatar.Fallback name={u.Name} />
                    </Avatar.Root>
                    <Box>
                      <Text fontWeight="bold">{u.Name}</Text>
                    </Box>
                  </Box>
                ))
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="outline"
  onClick={() => {
    setOpen(false);
    setGroupChatName("");
    setSelectedUsers([]);
    setSearch("");
    setSearchResult([]);
  }}>
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={handleSubmit}>
                Create Group
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export default GroupChatModal;