import { useState, useEffect, useContext, createContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SessionContext = createContext();

const Provider = (props) => {
  const [session, setSession] = useState(JSON.parse(localStorage.getItem('session') ?? JSON.stringify({username:'', guest:true})));
  const location = useLocation();

  useEffect(() => {
    QueryAPI('/user', function(result){
      if (result){
        setSession(result);
        localStorage.setItem('session', JSON.stringify(result));
      }
    });
  }, [location])

  return (
    <SessionContext.Provider value = {[session, setSession]}>
      {props.children}
    </SessionContext.Provider>
  );
}

function useSession(){
  const [session, setSession] = useContext(SessionContext);

  let refresh = function(callback){
    QueryAPI('/user', function(result){
      if (result){
        setSession(result);
      }
      if (callback){
        callback();
      }
    });
  }

  return [session, refresh];
}

function useLogout(){
  const [, setSession] = useContext(SessionContext);
  let navigate = useNavigate();


  let logout = function(callback){
    QueryAPI('/user/logout', function(result){
      if (result){
        setSession(result);
      }
      navigate('/play');
      if (callback){
        callback();
      }
    });
  }

  return logout;
}

let QueryAPI = function(path, callback){
  let handleError = function(error){
    callback(null);
  };

  fetch(window.location.protocol + '//' + window.location.host + path, {method: 'POST'})
  .then(res => res.json())
  .then(callback)
  .catch(handleError);
}


export {Provider as Session, useLogout}

export default useSession;