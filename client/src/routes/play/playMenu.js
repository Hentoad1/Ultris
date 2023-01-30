import { Link, useNavigate  } from 'react-router-dom';
import useAlerts from '../../assets/hooks/useAlerts';
import useSocket from '../../assets/hooks/useSocket';

import styles from './playMenu.css';

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
    <div className = {'p ' + styles.playMenu}>
      <div className = {styles.gameModes}>
        
        <div className = {styles.header}>
          SINGLEPLAYER
        </div>

        <Link to = "sprint" className = {styles.gameSection}>
          <div className = {styles.title}>Sprint</div>
          <div className = {styles.description}>A test against your skills in speed. Clear 40 lines as fast as you can.</div>
        </Link>

        <Link to = "blitz" className = {styles.gameSection}>
          <div className = {styles.title}>Blitz</div>
          <div className = {styles.description}>A race against the clock. Score as many points as possible in 2 minutes.</div>
        </Link>

        <Link to = "endless" className = {styles.gameSection}>
          <div className = {styles.title}>Endless</div>
          <div className = {styles.description}>A test of survival. Survive as long as you can, but watch out for the increasing speeds.</div>
        </Link>

        <div className = {styles.header}>
          MULTIPLAYER
        </div>

        <button onClick = {quickplay} className = {'n ' + styles.gameSection}>
          <div className = {styles.title}>Quickplay</div>
          <div className = {styles.description}>Join the public Quickplay lobby.</div>
        </button>

        <button onClick = {browseRooms} className = {'n ' + styles.gameSection}>
          <div className = {styles.title}>Browse Rooms</div>
          <div className = {styles.description}>Browse the list of availble public rooms.</div>
        </button>

        <button onClick = {createRoom} className = {'n ' + styles.gameSection}>
          <div className = {styles.title}>Create Room</div>
          <div className = {styles.description}>Create a room to play online matches.</div>
        </button>
      </div>
    </div>
  )
}

export default PlayMenu;
