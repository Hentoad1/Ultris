import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';

import {AnimatedInput,AnimatedPasswordInput} from '../../assets/components/animatedInput.js';
import CustomCheckbox from '../../assets/components/customCheckbox.js';
import useAPI from '../../assets/hooks/useAPI.js';
import LoadingOverlay from '../../assets/components/loadingOverlay.js';

import '../../assets/styles/menu.css';

function ForgotPassword(){
  let [stage, setStage] = useState(0);
  let QueryAPI = useAPI();

  let nextStage = (email) => {
    QueryAPI('/user/forgot-password', {email}, (result) => {
      if (result){
        setStage(1);
      }
    });
  }

  let stageContent = null;
  if (stage === 0){
    stageContent = <InitalSection nextStage = {nextStage}/>
  }else{
    stageContent = <SecondarySection/>
  }

  return (
    <div className = "page_content centered">
      <div className = "menu">
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
        An email has been sent to you if the email was linked to your account.
      </div>

    </Fragment>
  )
}

export default ForgotPassword;