import React from 'react';
import { Outlet } from "react-router-dom";

import GameBar from './gameBar/gameBar.js';

import './global.css';

function Globals() {
  return (
    <React.Fragment>
      <GameBar />
      <Outlet />
    </React.Fragment>
  );
}

export default Globals;
