import { Fragment, createRef, useState, useEffect } from 'react';

import './opponents.css';

import { bind } from './bind.js';
import useSocket from '../../../assets/hooks/useSocket';

function Opponents(){
  let socket = useSocket();
  let [userData, setUserData] = useState({users: [], redraw: false});
  let [playerAlive, setPlayerAlive] = useState(true);
  let [resize, setResize] = useState(null);

  useEffect(() => {
    let [resize, cleanup] = bind(socket,createRef,setUserData);

    setResize(() => (resize)); //necessary otherwise it will assume function passed via reference is a function state update.

    return cleanup;
  }, [socket]);

  useEffect(() => {
    socket.playerAlive = ((params) => {
      new Promise(r => setTimeout(r, 1000)).then(() => {
        setPlayerAlive(params);
      });
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPlayerAlive, resize])

  useEffect(() => {
    if (typeof resize === 'function'){
      resize(true);
    }
  },[resize, playerAlive]);

  let users = userData.users;
  if (users.length > 12 && playerAlive){
      const left = users.slice(0,users.length / 2);
      const right = users.slice(users.length / 2);

      return (
          <Fragment>
              <div className = 'multiplayerWrapper' style = {{order:-1}}>
                  {left.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
              </div>
              <div className = 'multiplayerWrapper'>
                  {right.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
              </div>
          </Fragment>
      )
  }else{
      return (
          <div className = 'multiplayerWrapper'>
              {users.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
          </div>
      )
  }
}

export default Opponents;
