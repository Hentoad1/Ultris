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
import AccountInfo from './routes/dashboard/account/accountInfo/accountInfo.js';
import Relog from './routes/dashboard/account/relog/relog.js'
//play
import BrowseMenu from './routes/play/browse.js';
import PlayMenu from './routes/play/playMenu.js';
import Wrapper from './routes/play/gameWrapper';
import SocketWrapper from './routes/play/socketWrapper.js';
//404
import Send404 from './routes/404/404.js';
//verify
import { VerifySuccess, VerifyFailure } from './routes/verify/verify';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element = {<Globals />}>
            <Route index element = {<Navigate to = 'play'/>} />
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
              <Route path='account'>
                <Route index element = {<AccountInfo />} />
                <Route path='information' element = {<AccountInfo />} />
                <Route path='relog' element = {<Relog/>} />
              </Route>
            </Route>
            <Route path='play' element = {<SocketWrapper/>}>
              <Route index element = {<PlayMenu />} />
              <Route path='browse' element = {<BrowseMenu/>} />
              <Route path=':gameMode' element = {<Wrapper />} />
            </Route>
            <Route path = 'verify-success' element = {<VerifySuccess/>}/>
            <Route path = 'verify-failure' element = {<VerifyFailure/>}/>
            <Route path='*' element = {<Send404/>} />
          </Route>
        </Routes>
      </BrowserRouter>
  </React.Fragment>
);