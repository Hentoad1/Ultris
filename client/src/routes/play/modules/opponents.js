import { Fragment, createRef, useContext, useState, useEffect } from 'react';

import './opponents.css';

import { bind } from './bind.js';
import { SocketContext } from '../wrapper';

function Opponents(){
  let socket = useContext(SocketContext);
  let [userData, setUserData] = useState({users: [], redraw: false});
  let [resize, setResize] = useState(null);

  useEffect(() => {
    let [resize, cleanup] = bind(socket,createRef,setUserData);

    setResize(() => (resize)); //necessary otherwise it will assume function passed via reference is a function state update.

    return cleanup;
  }, [socket]);
  
  useEffect(() => {
    if (resize !== null){
      resize();
    }
  }, [resize]);

  let users = userData.users;
  if (users.length > 12){
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
