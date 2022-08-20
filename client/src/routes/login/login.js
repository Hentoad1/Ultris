import React from 'react';
import { Link , Navigate } from 'react-router-dom';

import Context from '../../global/context.js';

import {AnimatedInput,AnimatedPasswordInput} from '../../global/components/animatedInput.js';
import {ReactComponent as Loading} from '../../assets/svgs/Loading.svg';

class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading:false
        }

        this.keyHandler = this.keyHandler.bind(this);
        this.throwError = this.throwError.bind(this);
        this.submit = this.submit.bind(this);
    }

    static contextType = Context;

    keyHandler(e){
        if (e.keyCode === 'enter'){
            this.submit();
        }
    }


    throwError(err){
        this.context.createNotification(err);
    }

    submit(){
        let loginInfo = {
            email: this.emailRef.current.value,
            password: this.passwordRef.current.value
        }

        fetch('http://localhost:9000/account/login', {
                method: 'POST',
                body: JSON.stringify(loginInfo),
                headers: {
                    'Content-type':'application/json'
                }
            })
            .then(res => res.json())
            .then(function(res){
                this.setState({loading:false});
                if (res.err){
                    this.throwError(res.err);
                }else{
                    this.context.refreshSession();
                    this.setState({redirect:'/play'});
                }
            }.bind(this))
            .catch(function(){
                this.setState({loading:false});
                this.throwError('An unexpected error has occured. Please try again later.')
            }.bind(this))
        
            
        this.setState({loading:true});
    }

    render() {
        if (this.state.redirect){
            return <Navigate to={this.state.redirect}/>
        }

        let loadingContent = this.state.loading ? 
        <div className = 'loading'>
            <Loading/>
        </div>
        : null;

        return (
            <div className = "page_content centered">
                <div className = "menu">
                    <div className = 'header'>
                        <h1>Account Info</h1>
                        <span>Enter your Email and Password.</span>
                    </div>
                    <AnimatedInput onKeyUp = {this.keyHandler} onRef = {ref => {this.emailRef = ref; ref.current.focus()}} placeholder = 'EMAIL' background = '#0F0F0F11'/>
                    <AnimatedPasswordInput onKeyUp = {this.keyHandler} onRef = {ref => this.passwordRef = ref} placeholder = 'PASSWORD' background = '#0F0F0F11'/>
                    <button onClick = {this.submit}>CONTINUE</button>
                    <span>Don't have an account? <Link to = '/register' className = 'link'>Sign Up</Link></span>
                    {loadingContent}
                </div>
            </div>
        )
    }
}

export default Login;