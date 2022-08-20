import React from 'react';
import { Link , Navigate } from 'react-router-dom';

import Context from '../../global/context.js';

import {AnimatedInput,AnimatedPasswordInput} from '../../global/components/animatedInput.js';
import CustomCheckbox from '../../global/components/customCheckbox.js';
import {ReactComponent as Loading} from '../../assets/svgs/Loading.svg';

import '../../global/styles/menu.css';

class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading:false,
            stage:0,
            userData:{},
            redirect:null
        }

        this.setStage = this.setStage.bind(this);
        this.setLoading = this.setLoading.bind(this);
    }

    static contextType = Context;

    throwError(err){
        this.context.createNotification(err);
    }
    
    setLoading(loading){
        this.setState({loading});
    }

    setStage(newData,stage){
        let userData = this.state.userData;
        Object.assign(userData, newData);

        if (stage === 2){
            if (this.state.loading){
                return;
            }

            fetch('http://localhost:9000/account/register', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-type':'application/json'
                }
            })
            .then(res => res.json())
            .then(function(res){
                this.setLoading(false);
                if (res.reset){
                    this.setState({stage:0});
                }
                if (res.err){
                    this.throwError(res.err);
                }else{
                    this.context.refreshSession();
                    this.setState({redirect:'/play'});
                }
            }.bind(this))
            .catch(function(){
                this.setLoading(false);
                this.throwError('An unexpected error has occured. Please try again later.')
            }.bind(this))
        }else{
            this.setState({loading:false,stage,userData});
        }
        
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
        
        let stageContent = null;
        if (this.state.stage === 0){
            stageContent = <EmailSection setStage = {this.setStage} setLoading = {this.setLoading}/>
        }else if (this.state.stage === 0.5){
            stageContent = <SigninSection setStage = {this.setStage} setLoading = {this.setLoading}/>
        }else if (this.state.stage === 1){
            stageContent = <AccountSection setStage = {this.setStage} setLoading = {this.setLoading}/>
        }

        return (
            <div className = "page_content centered">
                <div className = "menu" style = {{'--menu-width':'15em'}}>
                    {stageContent}
                    {loadingContent}
                </div>
            </div>
        )
    }
}

class EmailSection extends React.Component {
    constructor(props){
        super(props);

        this.submit = this.submit.bind(this);
        this.keyHandler = this.keyHandler.bind(this);
    }

    static contextType = Context;

    throwError(err){
        this.context.createNotification(err);
    }

    keyHandler(e){
        if (e.key === 'Enter'){
            this.submit();
        }
    }

    submit(){
        let email = this.inputRef.current.value;

        fetch('http://localhost:9000/account/email', {
            method: 'POST',
            body: JSON.stringify({email}),
            headers: {
                'Content-type':'application/json'
            }
        })
        .then(res => res.json())
        .then(function(res){
            this.props.setLoading(false);
            if (res.err){
                if (res.err === 'Email taken.'){
                    this.props.setStage({},0.5);
                }else{
                    this.throwError(res.err);
                }
            }else{
                this.props.setStage({email:res.email},1);
            }
        }.bind(this))
        .catch(function(){
            this.props.setLoading(false);
            this.throwError('An unexpected error has occured. Please try again later.')
        }.bind(this))

        this.props.setLoading(true);
    }

    render() {
        return (
            <React.Fragment>
                <div className = 'header'>
                    <h1>Enter your Email Address.</h1>
                    <span>You will need to verify it later.</span>
                </div>
                <AnimatedInput onKeyUp = {this.keyHandler} onRef = {ref => {this.inputRef = ref; ref.current.focus()}} placeholder = 'EMAIL ADDRESS' background = '#0F0F0F11'/>
                <button onClick = {this.submit}>CONTINUE</button>
                <span>Already have an account? <Link to = '/login' className = 'link'>Sign in</Link></span>
            </React.Fragment>
        )
    }
}

class AccountSection extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            checked:false
        }

        this.submit = this.submit.bind(this);
        this.keyHandler = this.keyHandler.bind(this);
    }

    submit(){
        let username = this.usernameRef.current.value;
        let password = this.passwordRef.current.value;

        this.props.setLoading(true);
        this.props.setStage({username, password},2);
    }

    keyHandler(e){
        if (e.key === 'Enter' && this.state.checked){
            this.submit();
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className = 'header'>
                    <h1>Account Info</h1>
                    <span>Enter a Username and Password.</span>
                </div>
                <AnimatedInput onKeyUp = {this.keyHandler} onRef = {ref => {this.usernameRef = ref; ref.current.focus()}} placeholder = 'USERNAME' background = '#0F0F0F11'/>
                <AnimatedPasswordInput onKeyUp = {this.keyHandler} onRef = {ref => this.passwordRef = ref} placeholder = 'PASSWORD' background = '#0F0F0F11'/>
                <div className = 'row'>
                    <CustomCheckbox onInput = {function(e){this.setState({checked:e.target.checked})}.bind(this)} style = {{marginRight:'0.5em'}}/>
                    <span>I agree to the <Link to = '/privacy' className = 'link'>Privacy Policy</Link></span>
                </div>
                <button onClick = {this.submit} disabled = {!this.state.checked}>CONTINUE</button>
            </React.Fragment>
        )
    }
}

class SigninSection extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className = 'header'>
                    <h1>An account with this email already exists.</h1>
                    <span>Would you like to sign in instead?</span>
                </div>
                <Link to = '/login' style = {{width:'100%'}} tabIndex = '-1'><button>SIGN IN</button></Link>
                <button style = {{background:'white',color:'black'}} onClick = {() => this.props.setStage({},0)}>NO THANKS</button>
            </React.Fragment>
        )
    }
}

export default Register;