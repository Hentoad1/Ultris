import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Globals from './global/global.js';
import {Notifcations} from './global/notifications.js';
import PlayMenu from './routes/play/playMenu.js';
import {Wrapper as Game} from './routes/play/wrapper.js';
import Register from './routes/register/register.js';
import Account from './routes/account/account.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.Fragment>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossOrigin="anonymous"
      />
    <Notifcations>
      <BrowserRouter>
        <Routes>
          <Route path='/' element = {<Globals />}>
            <Route index element = {<h1>default</h1>} />
            <Route path='register' element = {<Register />} />
            <Route path='account' element = {<Account />} />
            <Route path='play'>
              <Route index element = {<PlayMenu />} />
              <Route path='*' element = {<Game />} />
            </Route>
            <Route path='*' element = {<h1>404 Error</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Notifcations>
  </React.Fragment>
);