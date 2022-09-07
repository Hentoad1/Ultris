import { useNavigate, useLocation } from 'react-router';

import useAlerts from './useAlerts';
import useSession from './useSession';

function useAPI(){
  let addAlert = useAlerts();
  let navigate = useNavigate();
  let location = useLocation();
  let [, refresh] = useSession();

  console.log(location);

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

    let processResponse = async function(response){
      if (response.redirect && location.pathname !== response.redirect.path){
        if (response.redirect.refresh){
          await new Promise(r => refresh(r));
        }
        navigate(response.redirect.path,{replace: true});
        callback(null);
      }else{
        if (response.error){
          addAlert(response.error);
        }
        callback(response.result);
      } 
    };

    let handleError = function(error){
      console.log('fetcherror', error)
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