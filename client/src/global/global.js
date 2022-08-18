import React from 'react';
import { Outlet } from 'react-router';

import {ContextWrapper} from './context.js';

import GameBar from './gameBar/gameBar.js';
import {Notifcations} from './notifications.js';

import './global.css';

class Globals extends React.Component{
  render(){
    return (
      <ContextWrapper>
        <GameBar/>
        <Notifcations/>
        <Outlet/>
      </ContextWrapper>
    );
  }
}

export default Globals;
