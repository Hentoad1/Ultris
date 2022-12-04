import { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../wrapper';
import './lobbymenu.css';

function LobbyMenu(){
  let socket = useContext(SocketContext);
  let [display, setDisplay] = useState(true);
  let [players, setPlayers] = useState([]);
  let [lobbyInfo, setLobbyInfo] = useState({});
  let [countdown, setCountdown] = useState('');

  useEffect(() => {
    socket.setLobbyInfo = setLobbyInfo;

    const updateFunction = function(users){
      setPlayers(users);
    };

    const countdownFunction = function(secondsLeft){
      setCountdown(`Game Begins in ${secondsLeft} seconds.`);
    }

    const startFunction = function(){
      setCountdown('');
      setDisplay(false);
    }

    socket.on('update lobby',updateFunction);
    socket.on('countdown',countdownFunction);
    socket.on('start',startFunction);

    return function(){
      socket.off('update lobby',updateFunction);
      socket.off('countdown',countdownFunction);
      socket.off('start',startFunction);
    }
  }, [socket]);

  let content = null;
  if (display || true){
    content = (
      <div className = 'lobbymenu'>
        <h1 className = 'title'>{lobbyInfo.name}</h1>
        <h1 className = 'countdown'>{countdown}</h1>
        <ul className = 'userlist'>
          {players.map((username,i) => <li key = {i}>{username}</li>)}
        </ul>
      </div>
    );
  }
  
  return content
}
  
export default LobbyMenu;
