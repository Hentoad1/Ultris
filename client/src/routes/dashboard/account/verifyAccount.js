import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import useAPI from '../../../assets/hooks/useAPI';

function VerifyAccount(){
  let QueryAPI = useAPI();
  let location = useLocation();

  useEffect(() => {
    QueryAPI('/account');
  }, [location, QueryAPI])

  return (
    <Outlet/>
  )
}

export default VerifyAccount;