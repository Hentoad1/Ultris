import { useEffect, useContext, createContext } from 'react';
import { useNavigate } from 'react-router';
import { io } from 'socket.io-client';

import useAlerts from './useAlerts';

const socket = io('localhost:9000', {
  'reconnection': true,
  'reconnectionDelay': 500,
  'reconnectionAttempts': 3
});

const SocketContext = createContext();

function useSocket(){
  let socket = useContext(SocketContext);

  return socket;
}


function SocketWrapper(props){
  let alert = useAlerts();
  let navigate = useNavigate();

  useEffect(() => {
    let alertFunc = (error) => {
      console.log(error);
      if (error.data?.alert){
        alert(error.message, {type:'error'});
      }
    }

    let failFunc = () => {
      console.log('Connection to Socket.IO failed.');
    }

    let requestFunc = (res) => {
      if (res.redirect){
        navigate(res.redirect);
      }
      if (res.error){
        alert(res.error, {type:'error'});
      }
    }

    let notifyFunc = (message) => {
      if (message){
        alert(message);
      }
    }

    socket.on('connect_error', alertFunc);
    socket.on('request_error', requestFunc);
    socket.on('request_notify', notifyFunc);
    socket.on('connect_failed', failFunc);

    return () => {
      socket.off('connect_error', alertFunc);
      socket.off('request_error', requestFunc);
      socket.off('request_notify', notifyFunc);
      socket.off('connect_failed', failFunc);
    }
  })

  return (
    <SocketContext.Provider value = {socket}>
      {props.children}
    </SocketContext.Provider>
  )
}

export {SocketWrapper};

export default useSocket;