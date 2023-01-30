import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {AnimatedInput,AnimatedPasswordInput} from '../../assets/components/animatedInput.js';
import CustomCheckbox from '../../assets/components/customCheckbox.js';
import useAPI from '../../assets/hooks/useAPI.js';
import LoadingOverlay from '../../assets/components/loadingOverlay.js';

import styles from '../../assets/styles/menu.css';

function Register(){
  let [stage, setStage] = useState(0);
  let [userData, setUserData] = useState({});
  let [loading, setLoading] = useState(false);
  let QueryAPI = useAPI();

  let nextStage = (newData,stage) => {
    let newUserData = Object.assign({...userData}, newData);
    setUserData(newUserData);

    if (stage === 2){
      QueryAPI('/user/register', newUserData, (result) => {
        setLoading(false);
        if (result && result.reset){
          setStage(0);
        }
      });
    }else{
      setStage(stage);
    }
  }



  let stageContent = null;
  if (stage === 0){
    stageContent = <EmailSection setStage = {nextStage} setLoading = {setLoading}/>
  }else if (stage === 0.5){
    stageContent = <SigninSection setStage = {nextStage} setLoading = {setLoading}/>
  }else if (stage === 1){
    stageContent = <AccountSection setStage = {nextStage} setLoading = {setLoading}/>
  }

  let loadingContent = loading ? <LoadingOverlay /> : null;

  return (
    <div className = "p c">
      <div className = {styles.menu}>
        {stageContent}
        {loadingContent}
      </div>
    </div>
  )
}

function EmailSection(props){
  let [email, setEmail] = useState({current:{}});
  let QueryAPI = useAPI();

  let submit = () => {
    props.setLoading(true);
    let emailJSON = {email:email.current.value};


    QueryAPI('/user/email/', emailJSON, (result) => {
      props.setLoading(false);
      if (result){
        if (result.taken){
          props.setStage({},0.5);
        }else{
          props.setStage(emailJSON,1);
        }
      }
    });
  }

  let keyHandler = function(e){
    if (e.key === 'Enter'){
        submit();
    }
  }

  return (
    <React.Fragment>
      <div className = {styles.header}>
        Enter your Email Address.
      </div>
      <div className = {styles.subheader}>
        This will be used to keep your account secure. No promotional emails will be sent to you.
      </div>
      <AnimatedInput onKeyUp = {keyHandler} onRef = {ref => {setEmail(ref); ref.current.focus()}} title = 'EMAIL ADDRESS' background = '#0F0F0F11'/>
      <button onClick = {submit}>CONTINUE</button>
      <span>Already have an account? <Link to = '/login'><span>Sign in</span></Link></span>
    </React.Fragment>
  )
}

function AccountSection(props){
  let [username, setUsername] = useState({current:{}});
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
      <div className = {styles.header}>
        Account Info
      </div>
      <div className = {styles.subheader}>
        Enter a Username and Password.
      </div>
      <AnimatedInput onKeyUp = {keyHandler} onRef = {ref => {setUsername(ref); ref.current.focus()}} title = 'USERNAME' background = '#0F0F0F11'/>
      <AnimatedPasswordInput onKeyUp = {keyHandler} onRef = {ref => setPassword(ref)} title = 'PASSWORD' background = '#0F0F0F11'/>
      <div className = {styles.row}>
        <CustomCheckbox onInput = {e => setChecked(e.target.checked)} style = {{marginRight:'0.5em'}}/>
        <span>I agree to the <Link to = '/privacy' tabIndex = '-1'><span>Privacy Policy</span></Link></span>
      </div>
      <button onClick = {submit} disabled = {!checked}>REGISTER</button>
    </React.Fragment>
  )
}

function SigninSection(props){
  return (
    <React.Fragment>
      <div className = {styles.header}>
        This email is already in use.
      </div>
      <div className = {styles.subheader}>
        Would you like to sign in instead?
      </div>
      <Link to = '/login' style = {{width:'100%'}} tabIndex = '-1'><button>SIGN IN</button></Link>
      <button onClick = {() => props.setStage({},0)}>NO THANKS</button>
    </React.Fragment>
  )
}

export default Register;