import { useState, useEffect } from 'react';


import {ReactComponent as Warning} from '../../../../assets/svgs/Filled_Warning.svg';

import { AnimatedInput, AnimatedPasswordInput } from '../../../../assets/components/animatedInput';
import LoadingOverlay from '../../../../assets/components/loadingOverlay';
import useAPI from '../../../../assets/hooks/useAPI';

import styles from '../../../../assets/styles/splitMenu.css';

function AccountInfo(){
  let [loading, setLoading] = useState(true);
  let [info, setInfo] = useState({});
  let QueryAPI = useAPI();

  useEffect(() => {
    QueryAPI('/account/getInfo', null, function(result){
      setLoading(false);
      if (result){
        console.log(result);
        setInfo(result);
      }
    });

    //This warning can be ignored because data should only be fetched once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let loadingContent = loading ? <LoadingOverlay /> : null;
  
  return (
    <div className = {styles.splitMenu}>
      <UsernameSection username = {info.username}/>
      <PasswordSection/>
      <EmailSection email = {info.email} verified = {info.verified}/>
    {loadingContent}
    </div>
  )
}

function UsernameSection(props){
  let [inital, setInital] = useState(props.username);
  let [value, setValue] = useState(inital);
  let [loading, setLoading] = useState(false);
  let QueryAPI = useAPI();


  //if username given ever changes, change inital state, because it probably loaded in 
  useEffect(() => {
    setInital(props.username);
    setValue(props.username); //set value as well so they are synced
  }, [props.username])

  function submit(){
    if (!loading){
      setLoading(true);
      QueryAPI('/account/setUsername', {username:value}, function(username){
        setLoading(false);
        if (username){
          setInital(username);
          setValue(username);
        }
      });
    }
  }

  return (
    <div className = {styles.sideMenu}>
      <div className = {styles.header}>
        <div className = {styles.title}>Display Name</div>
        <div className = {styles.description}>The Display Name is what other players will see when battling against you in online matches. It will also display when you get a high score on leaderboards.</div>
      </div>
      <div className = {styles.content}>
        <AnimatedInput title = 'Display Name' value = {props.username} onValueChange = {v => setValue(v)} inputHandler = {e => e.target.value = e.target.value.toUpperCase()}/>
        <div className = {styles.buttons}>
          <button className = {styles.save} disabled = {inital === value} onClick = {submit}>SAVE CHANGES</button>
        </div>
      </div>
    </div>
  )
}

function PasswordSection(props){
  let [password1, setPassword1] = useState('');
  let [password2, setPassword2] = useState('');
  let [password3, setPassword3] = useState('');
  let [refs, setRefs] = useState([]);
  let [loading, setLoading] = useState(false);
  let QueryAPI = useAPI();

  let filled = password1 !== '' && password2 !== '' && password3 !== '';

  function submit(){
    if (!loading){
      setLoading(true);
      let passwordJSON = {
        currentPassword:password1,
        newPassword:password2,
        newPasswordConfirm:password3
      };
      QueryAPI('/account/setPassword', passwordJSON, function(){
        setLoading(false);
        setPassword1('');
        setPassword2('');
        setPassword3('');
        refs.forEach(ref => {
          ref.current.value = '';
        })
      });
    }
  }

  let updateRef = function(ref, index){
    setRefs(refs => {
      refs.slice();
      refs[index] = ref;
      return refs;
    })
  }

  return (
    <div className = {styles.sideMenu}>
      <div className = {styles.header}>
        <div className = {styles.title}>Password</div>  
        <div className = {styles.description}>Your password is used only to log into your account. Do not share this with anyone. Must be 8-128 characters long.</div>
      </div>
      <div className = {styles.content}>
        <AnimatedPasswordInput title = 'Current Password' onValueChange = {e => setPassword1(e)} onRef = {r => updateRef(r, 0)}/>
        <AnimatedPasswordInput title = 'New Password' onValueChange = {e => setPassword2(e)} onRef = {r => updateRef(r, 1)}/>
        <AnimatedPasswordInput title = 'Confirm New Password' onValueChange = {e => setPassword3(e)} onRef = {r => updateRef(r, 2)}/>
        <div className = {styles.buttons}>
          <button className = {styles.save} disabled = {!filled} onClick = {submit}>SAVE CHANGES</button>
        </div>
      </div>
    </div>
  )
}

function EmailSection(props){
  let [inital, setInital] = useState(props.email);
  let [value, setValue] = useState(inital);
  let [verified, setVerified] = useState(false);
  let [loading, setLoading] = useState(false);
  let [ref, setRef] = useState();
  let QueryAPI = useAPI();


  useEffect(() => {
    setInital(props.email);
    setValue(props.email);
  }, [props.email])

  useEffect(() => {
    setVerified(props.verified);
  }, [props.verified])


  function submit(){
    if (!loading){
      setLoading(true);
      QueryAPI('/account/setEmail', {email:value}, function(result){
        setLoading(false);
        ref.current.value = '';
        if (result){
          ref.current.placeholder = result.email;
          setInital(result.email);
          setValue(result.email);
        }else{
          setValue('');
        }
      });
    }
  }

  function verify(){
    if (!loading){
      setLoading(true);
      QueryAPI('/account/verify', null, function(){
        setLoading(false);
      });
    }
  }

  let verifyButton = null;
  let verifyError = null;
  let verifyStyle = {};
  if (!verified){
    verifyButton = <button className = {styles.save} onClick = {verify}>VERIFY EMAIL</button>;
    verifyError = <div className = {styles.error}><Warning/> Your email is not verified.</div>;
    verifyStyle = {
      '--background-color':'#6F2DBD22',
      '--border-color':'#6F2DBD',
      '--border-focus-color':'#6F2DBD'
    };
  }
  return (
    <div className = {styles.sideMenu}>
      <div className = {styles.header}>
        <div className = {styles.title}>Email</div>
        <div className = {styles.description}>Your Email address is where all information involving your account and its security be sent to. No promotional content will be sent to your email.</div>
      </div>
      <div className = {styles.content}>
        <AnimatedInput title = 'Email' placeholder = {inital} onValueChange = {v => setValue(v)} onRef = {r => setRef(r)} parentStyle = {verifyStyle}/>
        {verifyError}
        <div className = {styles.buttons}>
          {verifyButton}
          <button className = {styles.save} disabled = {inital === value || value === ''} onClick = {submit}>SAVE CHANGES</button>
        </div>
      </div>
    </div>
  )
}

export default AccountInfo;
