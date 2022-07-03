import { Outlet } from "react-router-dom";
import './App.css';
import GameBar from './gameBar/gameBar.js';

function App() {
  return (
    <div className="App">
      <GameBar />
      <Outlet />
    </div>
  );
}

export default App;
