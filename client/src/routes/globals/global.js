import {Fragment} from 'react';
import {Outlet} from 'react-router-dom';

import {AlertWrapper} from '../../assets/hooks/useAlerts.js';
import {Session} from '../../assets/hooks/useSession.js';
import Navbar from './navbar.js';

import './global.css';

function Globals(props){
  return (
    <Fragment>
      <AlertWrapper>
        <Session>
          <Navbar/>
          <Outlet/>
        </Session>
      </AlertWrapper>
    </Fragment>
  );
}

export default Globals;
