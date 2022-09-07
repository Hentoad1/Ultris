import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Globals from './routes/globals/global.js';
import PlayMenu from './routes/play/playMenu.js';
import {Wrapper as Game} from './routes/play/wrapper.js';
import Register from './routes/register/register.js';
import Login from './routes/login/login.js';
import Dashboard from './routes/dashboard/dashboard.js';
import Welcome from './routes/dashboard/welcome/welcome.js';
import Controls from './routes/dashboard/controls/controls.js';
import Handling from './routes/dashboard/handling/handling.js';
import VerifyAccount from './routes/dashboard/account/verifyAccount.js';
import AccountInfo from './routes/dashboard/account/accountInfo/accountInfo';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path='/' element = {<Globals />}>
            <Route index element = {<h1>default</h1>} />
            <Route path='register' element = {<Register />} />
            <Route path='login' element = {<Login />} />
            <Route path='dashboard' element = {<Dashboard />}>
              <Route index element = {<Welcome/>} />
              <Route path='controls' element = {<Controls />} />
              <Route path='handling' element = {<Handling />} />
              <Route path='account' element = {<VerifyAccount />} >
                <Route path='*' element = {<AccountInfo />} />
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