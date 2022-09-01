import {Fragment} from 'react';
import {Outlet} from 'react-router-dom';

import {Alerts} from '../../assets/hooks/useAlerts.js';
import {Session} from '../../assets/hooks/useSession.js';
import Navbar from './navbar.js';

import './global.css';

function Globals(props){
  return (
    <Fragment>
      <Alerts>
        <Session>
          <Navbar/>
          <Outlet/>
        </Session>
      </Alerts>
    </Fragment>
  );
}

export default Globals;
