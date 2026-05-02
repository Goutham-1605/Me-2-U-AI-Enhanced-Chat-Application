import React, { useState } from 'react';
import { Box, Button, Menu, Text,Avatar, VStack, Input } from '@chakra-ui/react';
import { Drawer } from "@chakra-ui/react"
import { FiBell, FiChevronDown, FiX } from "react-icons/fi";
import ProfileeModal from './ProfileeModal';
import { TooltipContent, TooltipRoot, TooltipTrigger,IconButton, TooltipPositioner } from '@chakra-ui/react'; 
import { ChatState } from '../../Context/chatProvider';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { toaster } from '../ui/toaster';



const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [LoadingChat, setLoadingChat] = useState();
  const {user, setUser, setSelectedChat, Chats,setChats} = ChatState()
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory()
  
  
  const accessChat = async (userId) => {
  try {
    setLoadingChat(true);

    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post("http://localhost:5000/api/chat", { userId }, config);

    const chatList = Array.isArray(Chats) ? Chats : [];  
    if (!chatList.find((c) => c._id === data._id)) {
      setChats([data, ...chatList]);  
    }

    setSelectedChat(data);
    setLoadingChat(false);
    setIsOpen(false);
  } catch (error) {
    console.log(error.message);
    toaster.create({
      title: "Error fetching chat",
      type: "error",
      duration: 3000,
    });
    setLoadingChat(false);
  }
};
  const logoutHandler=()=>{
    localStorage.removeItem("userInfo");
    setUser(null);
    history.push("/");
  }
  const handleSearch = async () => {
    
  if (!search) {
    toaster.create({
      title: "Please enter a name to search",
      type: "warning",
      duration: 3000,
    });
    return;
  }

  try {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
    setSearchResult(data);
    setLoading(false);
  } catch (error) {
    toaster.create({
      title: "Fail to search users",
      type: "error",
      duration: 3000,
    });
    setLoading(false);
  }
};
  return (
    <Box display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px">
      
      <TooltipRoot positioning={{ placement: "bottom" }}>
        <TooltipTrigger asChild>
          <Button variant="ghost" onClick={() => setIsOpen(true)}>
            <i className="fa-brands fa-sistrix"></i>
            <Text d={{base:'none',md:'flex'}} px='-4'>Search user</Text>
          </Button>
        </TooltipTrigger>
        <TooltipPositioner>
        <TooltipContent>
          search user to chat

        </TooltipContent>
        </TooltipPositioner>
      </TooltipRoot>
      <Text fontSize="2xl" fontFamily="Work sans">
          Me-2-U
        </Text>
        <div>
            <Box display="flex" alignItems="center" gap={2}>

  
  <Menu.Root positioning={{ placement: "bottom" }}>
  <Menu.Trigger asChild>
    <IconButton aria-label="Notifications" variant="ghost">
      <FiBell size={22} />
    </IconButton>
  </Menu.Trigger>

  <Menu.Positioner>
    <Menu.Content>
      <Menu.Item value="1">No New Messages</Menu.Item>
    </Menu.Content>
  </Menu.Positioner>
</Menu.Root>

  
  <Menu.Root positioning={{ placement: "bottom-end" }} closeOnSelect={false}>
  <Menu.Trigger asChild>
    <Button aria-label="Profile Menu" variant="ghost">
      <Avatar.Root size="sm">
        <Avatar.Image src={user?.Pic} />
        <Avatar.Fallback name={user?.Name || "User"} />
      </Avatar.Root>
      <FiChevronDown size={22} />
    </Button>
  </Menu.Trigger>

  <Menu.Positioner>
    <Menu.Content>

      <ProfileeModal user={user}>
        <Menu.Item value="profile">My Profile</Menu.Item>
      </ProfileeModal>

      <Menu.Item value="logout" onClick={logoutHandler}>Logout</Menu.Item>

    </Menu.Content>
  </Menu.Positioner>
</Menu.Root>

</Box>

        </div>
        <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="start">
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header borderBottomWidth="1px">
              <Drawer.Title>Search Users</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <IconButton variant="ghost" size="sm" aria-label="Close">
                  <FiX />
                </IconButton>
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body>
              <VStack gap={3} mt={2}>
                <Input
                  placeholder="Search by name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button w="100%" colorScheme="teal" onClick={handleSearch}>
                  Go
                </Button>
                {loading ? (
      <Text>Loading...</Text>
    ) : (
      searchResult.map((u) => (
        <Box
          key={u._id}
          display="flex"
          alignItems="center"
          gap={3}
          w="100%"
          p={3}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: "teal.100" }}
          onClick={() => accessChat(u._id)}  
        >
          <Avatar.Root size="sm">
            <Avatar.Image src={u.Pic} />
            <Avatar.Fallback name={u.Name} />
          </Avatar.Root>
          <Box>
            <Text fontWeight="bold">{u.Name}</Text>
            <Text fontSize="sm" color="gray.500">{u.Email}</Text>
          </Box>
        </Box>
      ))
    )}

              </VStack>

            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>  
    </Box>
  );
};

export default SideDrawer;