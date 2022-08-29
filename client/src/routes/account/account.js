import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

//import Context from '../../global/context.js';

import './account.css';

class Account extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            guest:true
        }

        this.sessionHandler = this.sessionHandler.bind(this);
    }

    //static contextType = Context;

    sessionHandler(e){
        this.setState({guest:e.detail.guest});
    }

    componentDidMount(){
        this.context.refreshSession();
        window.addEventListener('updatedSession',this.sessionHandler)
    }

    componentWillUnmount(){
        window.removeEventListener('updatedSession',this.sessionHandler)
    }
    
    render() {
        let accountHTML = this.state.guest ? null : 
        <div className = {'section ' + (this.state.guest ? 'disabled' : '')}>
            <h1>Account Settings</h1>
            <NavLink to = '/account/secure/information'>Account Infomation</NavLink>
            <NavLink to = '/account/logout'>Logout</NavLink>
        </div>

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
}

export default Account;
