import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import useSession, {useLogout} from '../../assets/hooks/useSession';

import './dashboard.css';

function Dashboard(){
  let [session] = useSession();
  let logout = useLogout();
  
  let dashboardHTML = session.guest ? null : 
  (
    <div className = 'section'>
      <h1>Account Settings</h1>
      <NavLink to = '/dashboard/account/information' className = ''>Account Infomation</NavLink>
      <span onClick = {() => logout()}>Logout</span>
    </div>
  )

  return (
    <div className = "page_content dashboard">
      <div className = 'dashboard-navbar'>
        <div className = 'section'>
          <h1>Game Settings</h1>
          <NavLink to = '/dashboard/controls'>Controls</NavLink>
          <NavLink to = '/dashboard/handling'>Handling</NavLink>
          <NavLink to = '/dashboard/skin'>Skin</NavLink>
        </div>
        {dashboardHTML}
      </div>
      <div className = 'dashboard-content'>
        <Outlet />
      </div>
    </div>
  )
}

export default Dashboard;
