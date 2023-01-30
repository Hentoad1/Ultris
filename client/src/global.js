import {Fragment} from 'react';
import {Outlet} from 'react-router-dom';

import {AlertWrapper} from './assets/hooks/useAlerts.js';
import {Session} from './assets/hooks/useSession.js';
import {SocketWrapper} from './assets/hooks/useSocket.js';
import Navbar from './assets/components/navbar.js';

import './assets/styles/global.css';

function Globals(props){
  return (
    <Fragment>
      <AlertWrapper>
        <Session>
          <SocketWrapper>
            <Navbar/>
            <Outlet/>
          </SocketWrapper>
        </Session>
      </AlertWrapper>
    </Fragment>
  );
}

export default Globals;
