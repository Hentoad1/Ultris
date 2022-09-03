import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import './verifySession.css';

class VerifySession extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            redirect:null
        }

        this.sessionHandler = this.sessionHandler.bind(this);
    }

    sessionHandler(e){
        if (e.detail.guest){
            this.setState({redirect:<Navigate to = '/account'/>});
        }
    }
    
    componentDidMount(){
        window.addEventListener('updatedSession',this.sessionHandler)
    }

    componentWillUnmount(){
        window.removeEventListener('updatedSession',this.sessionHandler)
    }

    render() {
        if (this.state.redirect){
            return this.state.redirect;
        }
        return (
            <Outlet/>
        )
    }
}

export default VerifySession;