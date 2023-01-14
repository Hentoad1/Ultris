import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Scrollbar from '../../assets/components/scrollbar';

import useSession, {useLogout} from '../../assets/hooks/useSession';

import './dashboard.css';

function Dashboard(){
  let [session] = useSession();
  let logout = useLogout();

  let dashboardHTML = null
  if (!session.guest){
    dashboardHTML = (
      <div className = 'section'>
        <h1>Account Settings</h1>
        <NavLink to = '/dashboard/account/information'>Account Infomation</NavLink>
        <span onClick = {() => logout()} className = 'nostyle'>Logout</span>
      </div>
    );
  }

  return (
    <div className = "page_content dashboard">
      <div className = 'dashboard-navbar'>
        <div className = 'section'>
          <h1>Game Settings</h1>
          <NavLink to = '/dashboard/settings'>Settings</NavLink>
        </div>
        {dashboardHTML}
      </div>
      <Scrollbar>
        <div className = 'dashboard-content'>
          <Outlet />
        </div>
      </Scrollbar>
    </div>
  )
}

export default Dashboard;
