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
  let [email, setEmail] = useState('');

  return (
    <Fragment>
      <div className = 'header'>
        Reset your Password
      </div>
      <div className = 'subheader'>
        Enter the Email Address that you used to register your account with. You will be sent an email with instructions to reset your password.
      </div>
      <AnimatedInput onValueChange = {e => setEmail(e)} title = 'EMAIL' background = '#0F0F0F11'/>
      <button onClick = {() => props.nextStage(email)} disabled = {!email}>Reset Password</button>
      <Link to = '/login' className = 'link'>Sign In</Link>
    </Fragment>
  )
}

function SecondarySection(props){
  return (
    <Fragment>
      <div className = 'header'>
        Email Sent
      </div>
      <div className = 'subheader'>
        An email has been sent to {props.email} with instructions on how to reset your password.
      </div>

    </Fragment>
  )
}

export default PasswordReset;