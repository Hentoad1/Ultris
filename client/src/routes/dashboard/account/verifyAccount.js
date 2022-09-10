import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

function VerifyAccount(){
  let location = useLocation();
  let navigate = useNavigate();

  useEffect(() => {
    QueryAPI('/account', function(response){
      if (response && response.redirect && location.pathname !== response.redirect.path){
        navigate(response.redirect.path, {replace: true});
      }
    });
  }, [location, navigate])

  return (
    <Outlet/>
  )
}

function QueryAPI(path, callback){
  let handleError = function(error){
    callback(null);
  };

  fetch('http://localhost:9000' + path, {method: 'POST'})
  .then(res => res.json())
  .then(callback)
  .catch(handleError);
}

export default VerifyAccount;