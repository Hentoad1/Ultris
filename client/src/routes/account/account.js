import React from 'react';

import {AnimatedInput} from '../../global/components/animatedInput.js';

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
            <div className = "page_content centered">
                <div className = 'account_inner'>
                    <h1>SETTINGS</h1>
                    <AnimatedInput placeholder = 'USERNAME'/>
                </div>
            </div>
        )
    }
}

export default Account;
