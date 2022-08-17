import React from 'react';
import { Link } from 'react-router-dom';

import {AnimatedInput,AnimatedPasswordInput} from '../../global/components/animatedInput.js';
import CustomCheckbox from '../../global/components/customCheckbox.js';
import {ReactComponent as Loading} from '../../assets/svgs/Loading.svg';
import {NotificationContext} from '../../global/notifications.js';

import './register.css';

class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading:false,
            stage:0,
            userData:{}
        }

        this.nextStage = this.nextStage.bind(this);
        this.setLoading = this.setLoading.bind(this);
    }

    static contextType = NotificationContext;

    throwError(err){
        this.setLoading(false);
        this.context(err);
    }

    componentDidMount(){
        
    }
    
    setLoading(loading){
        this.setState({loading});
    }

    nextStage(newData){
        let stage = this.state.stage + 1;

        let userData = this.state.userData;
        Object.assign(userData, newData);

        if (stage === 2){
            fetch('http://localhost:9000/account/register', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-type':'application/json'
                }
            })
            .then(res => res.json())
            .then(function(res){
                if (res.err){
                    this.throwError(res.err);
                }else{
                }
            }.bind(this))
            .catch(err => this.throwError('An unexpected error has occured. Please try again later.'))
        }else{
            this.setState({loading:false,stage,userData});
        }
        
    }

    render() {
        let loadingContent = this.state.loading ? 
        <div className = 'loading'>
            <Loading/>
        </div>
        : null;
        
        let stageContent = null;
        if (this.state.stage === 0){
            stageContent = <EmailSection nextStage = {this.nextStage} setLoading = {this.setLoading}/>
        }else if (this.state.stage === 1){
            stageContent = <AccountSection nextStage = {this.nextStage} setLoading = {this.setLoading}/>
        }

        return (
            <div className = "page_content centered">
                <div className = "asd">
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
    }

    static contextType = NotificationContext;

    throwError(err){
        this.props.setLoading(false);
        this.context(err);
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
            if (res.err){
                this.throwError(res.err);
            }else{
                this.props.nextStage({email:res.email});
            }
        }.bind(this))
        .catch(err => this.throwError('An unexpected error has occured. Please try again later.'))

        this.props.setLoading(true);
    }

    render() {
        return (
            <React.Fragment>
                <header>
                    <h1>Enter your Email Address.</h1>
                    <span>You will need to verify it later.</span>
                </header>
                <AnimatedInput onRef = {ref => this.inputRef = ref} placeholder = 'EMAIL ADDRESS' background = '#0F0F0F11'/>
                <button onClick = {this.submit}>CONTINUE</button>
                <span>Already Have an account? <Link to = '/login'>Sign in</Link></span>
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
    }

    submit(){
        let username = this.usernameRef.current.value;
        let password = this.passwordRef.current.value;

        this.props.setLoading(true);
        this.props.nextStage({username, password});
    }

    render() {
        return (
            <React.Fragment>
                <header>
                    <h1>Account Info</h1>
                </header>
                <AnimatedInput onRef = {ref => this.usernameRef = ref} placeholder = 'USERNAME' background = '#0F0F0F11'/>
                <AnimatedPasswordInput onRef = {ref => this.passwordRef = ref} placeholder = 'PASSWORD' background = '#0F0F0F11'/>
                <div className = 'checkboxRow'>
                    <CustomCheckbox className = 'checkboxStyles' onInput = {function(e){this.setState({checked:e.target.checked})}.bind(this)}/>
                    <span>I agree to the <Link to = '/privacy'>Privacy Policy</Link></span>
                </div>
                <button onClick = {this.submit} disabled = {!this.state.checked}>CONTINUE</button>
            </React.Fragment>
        )
    }
}

export default Register;