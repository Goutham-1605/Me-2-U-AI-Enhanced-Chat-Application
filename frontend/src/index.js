import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import ChatProvider from './Context/chatProvider';
import { Toaster } from '././components/ui/toaster';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider value={defaultSystem}>
    <BrowserRouter>
      <ChatProvider>
        <App />
        <Toaster/>
      </ChatProvider>
    </BrowserRouter>
  </ChakraProvider>
);