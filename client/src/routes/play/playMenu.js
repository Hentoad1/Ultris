import { Link, useNavigate  } from 'react-router-dom';
import useAlerts from '../../assets/hooks/useAlerts';
import useSocket from '../../assets/hooks/useSocket';

import './playMenu.css';

function PlayMenu(){
  let Navigate = useNavigate();
  let socket = useSocket();
  let Alert = useAlerts();

  
  let quickplay = () => {
    if (socket.connected){
      Navigate('/play/quickplay');
    }else{
      Alert('Unable to connect the server. Try refreshing the page.');
    }
  }

  let browseRooms = () => {
    if (socket.connected){
      Navigate('/play/browse');
    }else{
      Alert('Unable to connect the server. Try refreshing the page.');
    }
  }

  let createRoom = () => {
    if (socket.connected){
      socket.emit('create room',roomcode => {
        Navigate('/play/' + roomcode);
      });
    }else{
      Alert('Unable to connect the server. Try refreshing the page.');
    }
  }

  
  
  

  return (
    <div className = 'page_content playMenu'>
      <div className = 'gameModes'>
        
        <div className = 'header'>
          SINGLEPLAYER
        </div>

        <Link to = "sprint" className = 'gameSection'>
          <div className = 'title'>Sprint</div>
          <div className = 'description'>A test against your skills in speed. Clear 40 lines as fast as you can.</div>
        </Link>

        <Link to = "blitz" className = 'gameSection'>
          <div className = 'title'>Blitz</div>
          <div className = 'description'>A race against the clock. Score as many points as possible in 2 minutes.</div>
        </Link>

        <Link to = "endless" className = 'gameSection'>
          <div className = 'title'>Endless</div>
          <div className = 'description'>A test of survival. Survive as long as you can, but watch out for the increasing speeds.</div>
        </Link>

        <div className = 'header'>
          MULTIPLAYER
        </div>

        <button onClick = {quickplay} className = 'gameSection nostyle'>
          <div className = 'title'>Quickplay</div>
          <div className = 'description'>Join the public Quickplay lobby.</div>
        </button>

        <button onClick = {browseRooms} className = 'gameSection nostyle'>
          <div className = 'title'>Browse Rooms</div>
          <div className = 'description'>Browse the list of availble public rooms.</div>
        </button>

        <button onClick = {createRoom} className = 'gameSection nostyle'>
          <div className = 'title'>Create Room</div>
          <div className = 'description'>Create a room to play online matches.</div>
        </button>
      </div>
    </div>
  )
}

export default PlayMenu;
