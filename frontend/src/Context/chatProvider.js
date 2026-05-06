import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [SelectedChat, setSelectedChat] = useState();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [Chats, setChats] = useState([]);


  const [notifications, setNotifications] = useState([]);

  
  const [unreadCounts, setUnreadCounts] = useState({});

  const history = useHistory();

  
  const incrementUnread = (chatId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || 0) + 1,
    }));
  };


  const clearUnread = (chatId) => {
    setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }));
    
    setNotifications((prev) =>
      prev.filter((n) => n.Chat._id !== chatId)
    );
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");

    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);

      axios.get("http://localhost:5000/api/user/blockedUsers", {
        headers: { Authorization: `Bearer ${parsedUser.token}` },
      }).then(({ data }) => {
        setBlockedUsers(data.blockedUsers || []);
      }).catch(() => {});

    } else {
      history.push("/");
    }

    setLoading(false);
  }, [history]);

  return (
    <ChatContext.Provider value={{
      user, setUser,
      SelectedChat, setSelectedChat,
      Chats, setChats,
      blockedUsers, setBlockedUsers,
      notifications, setNotifications,       
      unreadCounts, setUnreadCounts,          
      incrementUnread,                        
      clearUnread,                            
    }}>
      {!loading && children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => useContext(ChatContext);
export default ChatProvider;