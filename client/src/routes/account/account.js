import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import useSession, {useLogout} from '../../assets/hooks/useSession';

import './account.css';

function Account(){
  let [session] = useSession();
  let logout = useLogout();
  
  let accountHTML = session.guest ? null : 
  (
    <div className = {'section ' + (session.guest ? 'disabled' : '')}>
      <h1>Account Settings</h1>
      <NavLink to = '/account/secure/information' className = ''>Account Infomation</NavLink>
      <span onClick = {() => logout()}>Logout</span>
    </div>
  )

  return (
    <div className = "page_content account">
      <div className = 'account-navbar'>
        <div className = 'section'>
          <h1>Game Settings</h1>
          <NavLink to = '/account/controls'>Controls</NavLink>
          <NavLink to = '/account/handling'>Handling</NavLink>
          <NavLink to = '/account/skin'>Skin</NavLink>
        </div>
        {accountHTML}
      </div>
      <div className = 'account-content'>
        <Outlet />
      </div>
    </div>
  )
}

export default Account;
