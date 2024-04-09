import HomePage from "./pages/Homepage";
import Chatpage from "./pages/ChatPage";
import { Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="App">
  <Route path="/" component={HomePage} exact/>
  <Route path="/chats" component={Chatpage}/>
    </div>
  );
}

export default App;
