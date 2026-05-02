import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import {Container , Box,Text, Tabs } from '@chakra-ui/react';
import Login from '../components/Authentication/Login';
import SignUp from '../components/Authentication/SignUp';

const Homepage = () => {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);
  return (
    <Container maxW='xl' centerContent>
      <Box 
        display="flex"
        textAlign='center'
        justifyContent='center'
        p= "3"
        bg='white'
        w='100%'
        m='40px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
       >
        <Text color='black' fontFamily='work sans' fontSize='2xl'>Me-2-U</Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px" color="black">
        <Tabs.Root variant="plain" colorPalette="green" defaultValue="login">
          <Tabs.List mb="1em" display="flex" width="100%">
            <Tabs.Trigger value="login" flex="1">Login</Tabs.Trigger>
            <Tabs.Trigger value="signup" flex="1">Sign Up</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="login">
             
             <Login/>
          </Tabs.Content>
          
          <Tabs.Content value="signup">
             
             <SignUp/>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  );
}

export default Homepage;
