import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router";

import Globals from './routes/globals/global.js';
import Register from './routes/register/register.js';
import Login from './routes/login/login.js';
import Leaderboard from './routes/leaderboard/leaderboard.js';
//dashboard
import Dashboard from './routes/dashboard/dashboard.js';
import Settings from './routes/dashboard/settings/settings.js';
import Controls from './routes/dashboard/controls/controls.js';
import Handling from './routes/dashboard/handling/handling.js';
import AccountInfo from './routes/dashboard/account/accountInfo/accountInfo.js';
import Relog from './routes/dashboard/account/relog/relog.js'
//play
import PlayMenu from './routes/play/playMenu.js';
import {Wrapper as Game} from './routes/play/wrapper.js';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element = {<Globals />}>
            <Route index element = {<h1>default</h1>} />
            <Route path='register' element = {<Register />} />
            <Route path='login' element = {<Login />} />
            <Route path = 'leaderboard'>
              <Route index element = {<Navigate to = 'sprint'/>}/>
              <Route path = 'sprint' element = {<Leaderboard type = 'sprint'/>} />
              <Route path = 'blitz' element = {<Leaderboard type = 'blitz'/>} />
            </Route>
            <Route path='dashboard' element = {<Dashboard />}>
              <Route index element = {<Navigate to = 'settings'/>} />
              <Route path='settings' element = {<Settings />} />
              <Route path='controls' element = {<Controls />} />
              <Route path='handling' element = {<Handling />} />
              <Route path='account'>
                <Route index element = {<AccountInfo />} />
                <Route path='information' element = {<AccountInfo />} />
                <Route path='relog' element = {<Relog/>} />
              </Route>
            </Route>
            <Route path='play'>
              <Route index element = {<PlayMenu />} />
              <Route path='*' element = {<Game />} />
            </Route>
            <Route path='*' element = {<h1>404 Error</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
  </React.Fragment>
);