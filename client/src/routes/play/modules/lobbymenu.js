import { Fragment, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import CustomCheckbox from '../../../assets/components/customCheckbox';
import Scrollbar from '../../../assets/components/scrollbar';
import useSocket, { useConnected } from '../../../assets/hooks/useSocket';
import useAlerts from '../../../assets/hooks/useAlerts';
import useSession from '../../../assets/hooks/useSession';
import {ReactComponent as Crown} from '../../../assets/svgs/Crown.svg';

import styles from './lobbymenu.css';

function LobbyMenu(){
  let location = useLocation();
  let socket = useSocket();
  let connected = useConnected();
  let navigate = useNavigate();
  let [{username}] = useSession();
  let [display, setDisplay] = useState(true);
  let [[players, spectators], setPlayers] = useState([[{username}], []]);
  let [lobbyInfo, setLobbyInfo] = useState({});
  let [countdown, setCountdown] = useState('');
  let alert = useAlerts();

  useEffect(() => {
    console.log(connected);
    if (!connected){
      navigate('/play');
      alert('Unable to connect to the server.')
    }
  }, [connected, navigate, alert])

  useEffect(() => {
    socket.setLobbyInfo = setLobbyInfo;

    const updateInfoFunction = function(info){
      console.log('info', info);
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

  useEffect(() => {
    const kickFunction = () => {
      navigate('/play');
      alert('You were kicked from the room.');
    }

    socket.on('kicked',kickFunction);

    return () => {
      socket.off('kicked',kickFunction);
    }
  }, [socket, alert, navigate]);

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

  function removePlayer(pid){
    socket.emit('remove player', pid);
  }

  let host = window.location.host;

  console.log(players, spectators)

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
          <div className = {styles.countdown}>{countdown}</div>
          <div className = {styles.playerInfo}>
            <Scrollbar>
              <div className = {styles.userlistWrapper} key = {1}>
                <ul className = {styles.userlist}>
                  {players.map((data,i) => {
                    if (data.owner){
                      return (<li key = {i}>{data.username}<Crown/></li>);
                    }else{
                      return (<li key = {i} onClick = {() => removePlayer(data.pid)} className = {styles.hoverable}>{data.username}</li>);
                    }
                  })}
                  {spectators.map((data,i) => <li key = {players.length + i} className = {styles.spectator + styles.hoverable} onClick = {() => removePlayer(data.pid)}>{data.username ?? 'GUEST'}</li>)}
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
        </div>
      );
    }else{
      content = (
        <div className = {styles.lobbymenu}>
          <div className = {styles.title}>{lobbyInfo.name}</div>
          <div className = {styles.countdown}>{countdown}</div>
          <div className = {styles.playerInfo}>
            <Scrollbar>
              <div className = {styles.userlistWrapper} key = {1}>
                <ul className = {styles.userlist}>
                  {players.map((data,i) => {
                    if (data.owner){
                      return (<li key = {i}>{data.username} [owner]</li>);
                    }else{
                      return (<li key = {i}>{data.username}</li>);
                    }
                  })}
                  {spectators.map((data,i) => <li key = {players.length + i} className = {styles.spectator} onClick = {() => removePlayer(data.pid)}>{data.username ?? 'GUEST'}</li>)}
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
        </div>
      );
    }
  }
  
  return content;
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
