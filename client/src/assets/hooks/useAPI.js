import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import useAlerts from './useAlerts';

function useAPI(){
  let addAlert = useAlerts();
  let navigate = useNavigate();

  let APIcall = function(path, body, callback = function(){}){
    let options = (body) ? {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-type':'application/json'
      }
    } : {
      method: 'POST'
    }

    let processResponse = function(response){
      console.log('response',response);
      if (response.redirect){
        navigate(response.redirect);
        callback(null);
      }else{
        if (response.error){
          console.log('adding alerts');
          addAlert(response.error);
        }
        callback(response.result);
      } 
    };

    let handleError = function(error){
      addAlert('An error occured trying to communicate with the server.');
      callback(null);
    };

    fetch('http://localhost:9000' + path, options)
    .then(res => res.json())
    .then(processResponse)
    .catch(handleError);
  }

  return APIcall;
}

export default useAPI;