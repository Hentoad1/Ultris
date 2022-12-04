import { Fragment, createRef, useContext, useState, useEffect } from 'react';

import './opponents.css';

import { bind } from './bind.js';
import { SocketContext } from '../wrapper';

function Opponents(){
  let socket = useContext(SocketContext);
  let [userData, setUserData] = useState([]);

  useEffect(() => {
    let cleanup = bind(socket,createRef,setUserData);

    return cleanup;
  }, [socket]);

  
  if (userData.length > 12){
      const left = userData.slice(0,userData.length / 2);
      const right = userData.slice(userData.length / 2);

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
              {userData.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
          </div>
      )
  }
}

export default Opponents;
