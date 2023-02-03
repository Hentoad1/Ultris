import { useEffect, useContext, useState, createContext } from 'react';
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

function useConnected(){
  let socket = useContext(SocketContext);
  let [connected, setConnected] = useState(true);

  useEffect(() => {
    let connect = () => setConnected(true);
    let disconnect = () => setConnected(false);
    let error = () => setConnected(socket.connected);

    socket.on('connect', connect);
    socket.on('disconnect', disconnect);
    socket.on('connect_error', error);

    return () => {
      socket.off('connect', connect);
      socket.off('disconnect', disconnect);
      socket.off('connect_error', error);
    }
  }, [socket, setConnected]);
  
  return connected;
}

function SocketWrapper(props){
  let alert = useAlerts();
  let navigate = useNavigate();

  useEffect(() => {
    let errorFunc = (error) => {
      if (error.message === 'Unauthorized'){
        setTimeout(() => socket.connect(), 1000); //reconnect after a second.
      }
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

    socket.on('connect_error', errorFunc);
    socket.on('request_error', requestFunc);
    socket.on('request_notify', notifyFunc);
    socket.on('connect_failed', failFunc);

    return () => {
      socket.off('connect_error', errorFunc);
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

export {SocketWrapper, useConnected};

export default useSocket;