import io from 'socket.io-client';
import React, { useState } from 'react';

import {
  Dialog, Button, Box, Text, Avatar, Input,
} from '@chakra-ui/react';
import axios from 'axios';
import { ChatState } from '../../Context/chatProvider';
import { toaster } from '../ui/toaster';

const GroupInfoModal = ({ children }) => {
  const socket = io("http://localhost:5000");
  const [open, setOpen] = useState(false);
  const [renameVal, setRenameVal] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { user, SelectedChat, setSelectedChat, Chats, setChats } = ChatState();

  const isAdmin = SelectedChat?.groupAdmin?._id === user._id;


  const handleRename = async () => {
  if (!renameVal.trim()) return;
  try {
    setRenameLoading(true);
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const { data } = await axios.put("http://localhost:5000/api/chat/rename", {
      chatId: SelectedChat._id,
      chatName: renameVal,
    }, config);

    setSelectedChat(data);
    setChats(Chats.map((c) => (c._id === data._id ? data : c)));
    setRenameVal("");
    socket.emit("group updated", data);
    toaster.create({ title: "Group renamed!", type: "success", duration: 3000 });
  } catch (error) {
    toaster.create({ title: "Failed to rename group", type: "error", duration: 3000 });
  } finally {
    setRenameLoading(false);
  }
};

  
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    try {
      setSearchLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/user?search=${query}`, config);
      setSearchResult(data);
    } catch (error) {
      toaster.create({ title: "Failed to search users", type: "error", duration: 3000 });
    } finally {
      setSearchLoading(false);
    }
  };

  
  const handleAddUser = async (userToAdd) => {
  if (SelectedChat.users.find((u) => u._id === userToAdd._id)) {
    toaster.create({ title: "User already in group", type: "warning", duration: 3000 });
    return;
  }
  try {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const { data } = await axios.put("http://localhost:5000/api/chat/groupAdd", {
      chatId: SelectedChat._id,
      userId: userToAdd._id,
    }, config);

    setSelectedChat(data);
    setChats(Chats.map((c) => (c._id === data._id ? data : c)));
    setSearch("");
    setSearchResult([]);
    
    socket.emit("user added to group", { updatedChat: data, addedUserId: userToAdd._id });
    toaster.create({ title: `${userToAdd.Name} added!`, type: "success", duration: 3000 });
  } catch (error) {
    toaster.create({ title: "Failed to add user", type: "error", duration: 3000 });
  }
};

  
  const handleRemoveUser = async (userToRemove) => {
  try {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const { data } = await axios.put("http://localhost:5000/api/chat/groupRemove", {
      chatId: SelectedChat._id,
      userId: userToRemove._id,
    }, config);

    setSelectedChat(data);
    setChats(Chats.map((c) => (c._id === data._id ? data : c)));
    socket.emit("group updated", data); 
    toaster.create({ title: `${userToRemove.Name} removed!`, type: "success", duration: 3000 });
  } catch (error) {
    toaster.create({ title: "Failed to remove user", type: "error", duration: 3000 });
  }
};

  
  const leaveGroup = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put("http://localhost:5000/api/chat/groupRemove", {
        chatId: SelectedChat._id,
        userId: user._id,
      }, config);

      setSelectedChat(null);
      setChats(Chats.filter((c) => c._id !== SelectedChat._id));
      setOpen(false);
      toaster.create({ title: "Left the group", type: "success", duration: 3000 });
    } catch (error) {
      toaster.create({ title: "Failed to leave group", type: "error", duration: 3000 });
    }
  };

  
  const deleteGroup = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/chat/group/${SelectedChat._id}`, config);

      setSelectedChat(null);
      setChats(Chats.filter((c) => c._id !== SelectedChat._id));
      setOpen(false);
      toaster.create({ title: "Group deleted", type: "success", duration: 3000 });
    } catch (error) {
      toaster.create({ title: "Failed to delete group", type: "error", duration: 3000 });
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>

      <Dialog.Root open={open} onOpenChange={(e) => {
        setOpen(e.open);
        if (!e.open) { setSearch(""); setSearchResult([]); setRenameVal(""); }
      }}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{SelectedChat?.chatName}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>

              
              {isAdmin && (
                <Box display="flex" gap={2} mb={4}>
                  <Input
                    placeholder="New group name"
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                  />
                  <Button bg={'blue.500'}
                    colorScheme="teal"
                    onClick={handleRename}
                    loading={renameLoading}
                  >
                    Rename
                  </Button>
                </Box>
              )}

              
              {isAdmin && (
                <Box mb={4}>
                  <Input
                    placeholder="Search users to add"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    mb={2}
                  />
                  {searchLoading ? (
                    <Text>Searching...</Text>
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
                        <Text fontWeight="bold">{u.Name}</Text>
                      </Box>
                    ))
                  )}
                </Box>
              )}

              
              <Text fontWeight="bold" mb={2}>Members:</Text>
              {SelectedChat?.users?.map((u) => (
                <Box
                  key={u._id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={3}
                  p={2}
                  borderRadius="md"
                  mb={1}
                  bg="gray.50"
                >
                  <Box display="flex" alignItems="center" gap={3}>
                    <Avatar.Root size="sm">
                      <Avatar.Image src={u.Pic} />
                      <Avatar.Fallback name={u.Name} />
                    </Avatar.Root>
                    <Box>
                      <Text fontWeight="bold">{u.Name}</Text>
                      {SelectedChat?.groupAdmin?._id === u._id && (
                        <Text fontSize="xs" color="teal.500">Admin</Text>
                      )}
                    </Box>
                  </Box>

                  
                  {isAdmin && u._id !== user._id && (
                    <Button bg={'red.500'}
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleRemoveUser(u)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
            </Dialog.Body>

            <Dialog.Footer display="flex" justifyContent="space-between">
              <Button colorScheme="orange" onClick={leaveGroup}>
                Leave Group
              </Button>
              {isAdmin && (
                <Button colorScheme="red" onClick={deleteGroup}>
                  Delete Group
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export default GroupInfoModal;