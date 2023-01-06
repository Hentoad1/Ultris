import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';

import {AnimatedInput,AnimatedPasswordInput} from '../../assets/components/animatedInput.js';
import CustomCheckbox from '../../assets/components/customCheckbox.js';
import useAPI from '../../assets/hooks/useAPI.js';
import LoadingOverlay from '../../assets/components/loadingOverlay.js';

import '../../assets/styles/menu.css';

function PasswordReset(){
  let [stage, setStage] = useState({state:0,response:null});
  let QueryAPI = useAPI();

  let nextStage = (email) => {
    QueryAPI('/user/forgot-password', {email}, (result) => {
      console.log(result);
      setStage({state:1,response:'example'});
    });
  }

  let stageContent = null;
  if (stage.state === 0){
    stageContent = <InitalSection setStage = {nextStage}/>
  }else{
    stageContent = <SecondarySection response = {stage.response}/>
  }

  return (
    <div className = "page_content centered">
      <div className = "menu" /*style = {{'--menu-width':'15em'}}*/>
        {stageContent}
      </div>
    </div>
  )
}

function InitalSection(props){
  let [email, setEmail] = useState({current:{}});
  let [password, setPassword] = useState({current:{}});
  let [checked, setChecked] = useState(false);


  let submit = () => {
    let usernameValue = username.current.value;
    let passwordValue = password.current.value;

    props.setLoading(true);
    props.setStage({username:usernameValue, password:passwordValue},2);
  }

  let keyHandler = (e) => {
    if (e.key === 'Enter' && checked){
      submit();
    }
  }

  return (
    <React.Fragment>
      <div className = 'header'>
        Account Info
      </div>
      <div className = 'subheader'>
        Enter a Username and Password.
      </div>
      <AnimatedInput onKeyUp = {keyHandler} onRef = {ref => {setEmail(ref); ref.current.focus()}} title = 'USERNAME' background = '#0F0F0F11'/>
      <AnimatedPasswordInput onKeyUp = {keyHandler} onRef = {ref => setPassword(ref)} title = 'PASSWORD' background = '#0F0F0F11'/>
      <div className = 'row'>
        <CustomCheckbox onInput = {e => setChecked(e.target.checked)} style = {{marginRight:'0.5em'}}/>
        <span>I agree to the <Link to = '/privacy' className = 'link' tabIndex = '-1'>Privacy Policy</Link></span>
      </div>
      <button onClick = {props.nextStage} disabled = {!email.current.value}>Reset Password</button>
    </React.Fragment>
  )
}

function SecondarySection(props){
  return (
    <React.Fragment>
      <div className = 'header'>
        This email is already in use.
      </div>
      <div className = 'subheader'>
        Would you like to sign in instead?
      </div>
      <Link to = '/login' style = {{width:'100%'}} tabIndex = '-1'><button>SIGN IN</button></Link>
      <button className = 'AlternameColor' style = {{background:'white',color:'black'}} onClick = {() => props.setStage({},0)}>NO THANKS</button>
    </React.Fragment>
  )
}

export default PasswordReset;