import React from 'react';
import { Outlet } from "react-router-dom";

import GameBar from './gameBar/gameBar.js';
import Notifcations from './notifications.js';

import './global.css';

function Globals(props) {
  console.log(props);
  return (
    <React.Fragment>
      <GameBar />
      <Outlet/>
    </React.Fragment>
  );
}

export default Globals;
