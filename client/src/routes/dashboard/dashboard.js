import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Scrollbar from '../../assets/components/scrollbar';

import useSession, {useLogout} from '../../assets/hooks/useSession';

import styles from './dashboard.css';

function Dashboard(){
  let [session] = useSession();
  let logout = useLogout();

  let dashboardHTML = null
  if (!session.guest){
    dashboardHTML = (
      <div className = {styles.section}>
        <h1>Account Settings</h1>
        <NavLink to = '/dashboard/account/information'>Account Infomation</NavLink>
        <span onClick = {() => logout()} className = 'n'>Logout</span>
      </div>
    );
  }

  return (
    <div className = {"p " + styles.dashboard}>
      <div className = {styles.dashboard_navbar}>
        <div className = {styles.section}>
          <h1>Game Settings</h1>
          <NavLink to = '/dashboard/settings'>Settings</NavLink>
        </div>
        {dashboardHTML}
      </div>
      <Scrollbar>
        <div className = {styles.dashboard_content}>
          <Outlet />
        </div>
      </Scrollbar>
    </div>
  )
}

export default Dashboard;
