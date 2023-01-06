import { useEffect } from 'react';
import { Navigate } from 'react-router';
import useAlerts from '../../assets/hooks/useAlerts';

function VerifySuccess(){
  let addAlert = useAlerts();
  
  useEffect(() => {
    addAlert('Verification Successful');
  },[addAlert]);

  return (
    <Navigate to = '/play'/>
  )
}

export default VerifySuccess;