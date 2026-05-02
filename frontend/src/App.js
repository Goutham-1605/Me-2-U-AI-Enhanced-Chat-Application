import './App.css';
import { Route, Switch } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import ChatPage from './Pages/ChatPage';
import backgroundImage from './images/ChatUI.jpeg';

function App() {
  return (
    <div className="App" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: '100vh',
      display: "flex"
    }}>
      <Switch>
        <Route exact path='/' component={Homepage}/>
        <Route path='/chats' component={ChatPage}/>
      </Switch>
    </div>
  );
}

export default App;