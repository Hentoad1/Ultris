import { useState, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router';
import CustomCheckbox from '../../../assets/components/customCheckbox';
import useAlerts from '../../../assets/hooks/useAlerts';
import './lobbymenu.css';

function LobbyMenu(){
  let location = useLocation();
  let socket = useOutletContext();
  let [display, setDisplay] = useState(true);
  let [players, setPlayers] = useState([JSON.parse(localStorage.getItem('session') ?? JSON.stringify({username:'GUEST'})).username]);
  let [lobbyInfo, setLobbyInfo] = useState({});
  let [countdown, setCountdown] = useState('');
  let alert = useAlerts();

  useEffect(() => {
    socket.setLobbyInfo = setLobbyInfo;

    const updateInfoFunction = function(info){
      console.log(info);
      setLobbyInfo(info);
    }

    const updateFunction = function(users){
      setPlayers(users);
    };

    const countdownFunction = function(secondsLeft){
      setCountdown(`Game Begins in ${secondsLeft} seconds.`);
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
    socket.on('end',endFunction);

    return function(){
      socket.off('update lobby info',updateInfoFunction);
      socket.off('update lobby players',updateFunction);
      socket.off('countdown',countdownFunction);
      socket.off('start',startFunction);
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
      setLobbyInfo(info);
    });

    if (event){
      event.target.value = '';
    }
  }

  function CopyToClipboard(text){
    navigator.clipboard.writeText(text);
    
    alert('Link Copied!');
  }

  let host = window.location.host;

  let content = null;
  if (display){
    if (lobbyInfo.admin){
      content = (
        <div className = 'lobbymenu'>
          <div className = 'settings'>
            <BasicInput placeholder = {lobbyInfo.name} onBlur = {e => UpdateLobbyInfo({name:e.target.value}, e)}/>
            <div className = 'linkShare' onClick = {() => CopyToClipboard(host + location.pathname)}>
              {host + location.pathname}
            </div>
            <div className = 'settingsRow'>
              <div title = 'Allow other players to join the lobby without the link.'>
                <span>Private Lobby</span>
                <CustomCheckbox defaultChecked = {lobbyInfo.private} onInput = {e => {console.log(e.target.checked); UpdateLobbyInfo({private:e.target.checked})}}/>
              </div>
              <div title = 'Limit the amount of players that can be in the match'>
                <span>Player Limit</span>
                <BasicInput placeholder = {lobbyInfo.maxPlayers} small = {true} centered = {true} onBlur = {e => UpdateLobbyInfo({maxPlayers:e.target.value}, e)}/>
              </div>
            </div>
            <button onClick = {() => socket.emit('start game')}>START</button>
          </div>
          <div className = 'countdown'>{countdown}</div>
          <ul className = 'userlist'>
            {players.map((username,i) => <li key = {i}>{username ?? 'GUEST'}</li>)}
          </ul>
        </div>
      );
    }else{
      content = (
        <div className = 'lobbymenu'>
          <div className = 'title'>{lobbyInfo.name}</div>
          <div className = 'countdown'>{countdown}</div>
          <ul className = 'userlist'>
            {players.map((username,i) => <li key = {i}>{username ?? 'GUEST'}</li>)}
          </ul>
        </div>
      );
    }
  }
  
  return content
}

function BasicInput(props){
  return (
    <div className = {'stylizedInput' + (props.small ? ' small' : '')}>
      <input type = 'text' placeholder = ' ' onBlur = {props.onBlur}/>
      <span className = 'placeholder'>{props.placeholder}</span>
    </div>
  )
}

export default LobbyMenu;
