import React from 'react';
import { Outlet } from "react-router-dom";

import GameBar from './gameBar/gameBar.js';

import './global.css';

function Globals(props) {
  return (
    <React.Fragment>
      <GameBar />
      <Outlet />
    </React.Fragment>
  );
}

export default Globals;
