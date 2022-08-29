import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import useAPI from './useAPI';

function useSession(){
  const [session, setSession] = useState({username:'', guest:true});
  const location = useLocation();
  const QueryAPI = useAPI();

  useEffect(() => {
    QueryAPI('/account', null, function(result){
      if (result){
        setSession(result);
      }
    });
  }, [location])

  return session;
}

export default useSession;