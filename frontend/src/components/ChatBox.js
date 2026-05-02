import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ChatState } from '../Context/chatProvider';
import SingleChat from './singleChat';

const ChatBox = () => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat />
    </Box>
  );
};

export default ChatBox;