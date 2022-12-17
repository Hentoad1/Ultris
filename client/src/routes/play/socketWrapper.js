import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { io } from 'socket.io-client';

import useAlerts from '../../assets/hooks/useAlerts';

const socket = io('localhost:9000', {
  'reconnection': true,
  'reconnectionDelay': 500,
  'reconnectionAttempts': 3
});



function SocketWrapper(){
  let alert = useAlerts();

  useEffect(() => {
    let alertFunc = (errorMessage) => {
      alert(errorMessage.message, {type:'error'});
    }

    let requestFunc = (errorMessage) => {
      alert(errorMessage, {type:'error'});
    }

    socket.on('connect_error', alertFunc);
    socket.on('request_error', requestFunc);

    return () => {
      socket.off('connect_error', alertFunc);
      socket.off('request_error', requestFunc);
    }
  })

  return (
    <Outlet context = {socket}/>
  )
}

export default SocketWrapper;