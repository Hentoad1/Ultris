import { Fragment, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import CustomCheckbox from '../../../assets/components/customCheckbox';
import Scrollbar from '../../../assets/components/scrollbar';
import useSocket from '../../../assets/hooks/useSocket';
import useAlerts from '../../../assets/hooks/useAlerts';
import useSession from '../../../assets/hooks/useSession';
import styles from './lobbymenu.css';

function LobbyMenu(){
  let location = useLocation();
  let socket = useSocket();
  let [{username}] = useSession();
  let [display, setDisplay] = useState(true);
  let [[players, spectators], setPlayers] = useState([[username], []]);
  let [lobbyInfo, setLobbyInfo] = useState({});
  let [countdown, setCountdown] = useState('');
  let alert = useAlerts();

  useEffect(() => {
    socket.setLobbyInfo = setLobbyInfo;

    const updateInfoFunction = function(info){
      console.log(info);
      setLobbyInfo(info);
    }

    const updateFunction = function(players, spectators){
      setPlayers([players, spectators]);
    };

    const countdownFunction = function(secondsLeft){
      if (secondsLeft === ''){
        setCountdown(''); //case where countdown is canceled
      }else{
        setCountdown(`Game Begins in ${secondsLeft} seconds.`);
      }
    }

    const startFunction = () => {
      setCountdown('');
      setDisplay(false);
    }
    
    const endFunction = () => {
      //wait one second for the placing menu to appear
      new Promise(r => setTimeout(r, 1000)).then(() => {
        setDisplay(true);
      })
    }

    socket.on('update lobby info',updateInfoFunction);
    socket.on('update lobby players',updateFunction);
    socket.on('countdown',countdownFunction);
    socket.on('start',startFunction);
    socket.on('spectate', startFunction);
    socket.on('end',endFunction);

    return function(){
      socket.off('update lobby info',updateInfoFunction);
      socket.off('update lobby players',updateFunction);
      socket.off('countdown',countdownFunction);
      socket.off('start',startFunction);
      socket.off('spectate', startFunction);
      socket.off('end',endFunction);
    }
  }, [socket]);

  const UpdateLobbyInfo = (newValue, event) => {
    for (const property in newValue){
      let value = newValue[property];
      if (typeof value === 'string'){
        if (value.trim() === ''){
          delete newValue[property];
        }else{
          newValue[property] = value.trim();
        }
      }else{
        newValue[property] = value;
      }
    }
    
    let newLobbyInfo = Object.assign({}, lobbyInfo, newValue);

    socket.emit('update lobby', newLobbyInfo, info => {
      console.log(info);
      setLobbyInfo(info);
    });

    if (event){
      event.target.value = '';
    }
  }

  const updateSpectateStatus = () => {
    socket.emit('swap activity', info => {
      console.log(info);
      setLobbyInfo(info);
    });
  }

  function CopyToClipboard(text){
    navigator.clipboard.writeText(text);
    
    alert('Link Copied!');
  }

  let host = window.location.host;

  console.log(players, spectators);

  const staticContent = (
    <Fragment>
      <div className = {styles.countdown}>{countdown}</div>
      <div className = {styles.playerInfo}>
        <Scrollbar>
          <div className = {styles.userlistWrapper}>
            <ul className = {styles.userlist}>
              {players.map((username,i) => <li key = {i}>{username}</li>)}
              {spectators.map((username,i) => <li key = {players.length + i} className = {styles.spectator}>{username ?? 'GUEST'}</li>)}
            </ul>
          </div>
        </Scrollbar>
        <button className = {'n ' + styles.playerStatus} onClick = {updateSpectateStatus}>
          <span className = {styles.username}>
            {username}
          </span>
          <span className = {styles.status}>
            SET TO {lobbyInfo.spectating ? 'SPECTATE' : 'PLAY'} NEXT ROUND
          </span>
        </button>
      </div>
    </Fragment>
  );

  let content = null;
  if (display){
    if (lobbyInfo.admin){
      content = (
        <div className = {styles.lobbymenu}>
          <div className = {styles.settings}>
            <BasicInput placeholder = {lobbyInfo.name} onBlur = {e => UpdateLobbyInfo({name:e.target.value}, e)}/>
            <div className = {styles.linkShare} onClick = {() => CopyToClipboard(host + location.pathname)}>
              {host + location.pathname}
            </div>
            <div className = {styles.settingsRow}>
              <div title = 'Allow other players to join the lobby without the link.'>
                <span>Private Lobby</span>
                <CustomCheckbox defaultChecked = {lobbyInfo.private} onInput = {e => UpdateLobbyInfo({private:e.target.checked})}/>
              </div>
              <div title = 'Limit the amount of players that can be in the match'>
                <span>Player Limit</span>
                <BasicInput placeholder = {lobbyInfo.maxPlayers} small = {true} centered = {true} onBlur = {e => UpdateLobbyInfo({maxPlayers:e.target.value}, e)}/>
              </div>
            </div>
            <button onClick = {() => socket.emit('start game')}>START</button>
          </div>
          {staticContent}
        </div>
      );
    }else{
      content = (
        <div className = {styles.lobbymenu}>
          <div className = {styles.title}>{lobbyInfo.name}</div>
          {staticContent}
        </div>
      );
    }
  }
  
  return content
}

function BasicInput(props){
  return (
    <div className = {styles.stylizedInput + ' ' + (props.small ? styles.small : '')}>
      <input type = 'text' placeholder = ' ' onBlur = {props.onBlur}/>
      <span className = {styles.placeholder}>{props.placeholder}</span>
    </div>
  )
}

export default LobbyMenu;
