import React from 'react';

import { NavLink, Outlet } from 'react-router-dom';

import './account.css';

class Account extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            
        }      
    }

    componentDidMount(){
        
    }
    
    render() {
        return (
            <div className = "page_content account">
                <div className = 'account-navbar'>
                    <div className = 'section'>
                        <h1>Game Settings</h1>
                        <NavLink to = '/account/controls'>Controls</NavLink>
                        <NavLink to = '/account/handling'>Handling</NavLink>
                        <NavLink to = '/account/skin'>Skin</NavLink>
                    </div>
                    <div className = 'section'>
                        <h1>Account Settings</h1>
                        <NavLink to = '/account/a'>Personal Infomation</NavLink>
                        <NavLink to = '/account/b'>Privacy</NavLink>
                        <NavLink to = '/account/c'>Security</NavLink>
                        <NavLink to = '/account/d'>Security</NavLink>
                    </div>
                </div>
                <div className = 'account-content'>
                    <Outlet />
                </div>
            </div>
        )
    }
}

export default Account;
