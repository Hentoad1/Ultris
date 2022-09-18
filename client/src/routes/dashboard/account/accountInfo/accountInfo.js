import { useState, useEffect } from 'react';


import { AnimatedInput, AnimatedPasswordInput } from '../../../../assets/components/animatedInput';
import LoadingOverlay from '../../../../assets/components/loadingOverlay';
import useAPI from '../../../../assets/hooks/useAPI';

import './accountInfo.css';

function AccountInfo(){
  let [loading, setLoading] = useState(true);
  let [info, setInfo] = useState({});
  let QueryAPI = useAPI();

  //This warning is fine because data should only be fetched once.
  useEffect(() => {
    QueryAPI('/account/getInfo', null, function(result){
      setLoading(false);
      if (result){
        setInfo(result);
      }
    });
  }, [])

  let loadingContent = loading ? <LoadingOverlay /> : null;
  
  return (
    <div className = 'splitmenu'>
      <UsernameSection username = {info.username}/>
      <PasswordSection/>
      <EmailSection email = {info.email}/>
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
    <div className = 'section'>
      <div className = 'header'>
        <div className = 'title'>Display Name</div>
        <div className = 'description'>The Display Name is what other players will see when battling against you in online matches. It will also display when you get a high score on leaderboards.</div>
      </div>
      <div className = 'content'>
        <AnimatedInput title = 'Display Name' value = {props.username} onValueChange = {v => setValue(v)} inputHandler = {e => e.target.value = e.target.value.toUpperCase()}/>
        <button className = 'save' disabled = {inital === value} onClick = {submit}>SAVE CHANGES</button>
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
    <div className = 'section'>
      <div className = 'header'>
        <div className = 'title'>Password</div>  
        <div className = 'description'>Your password is used only to log into your account. Do not share this with anyone.</div>
      </div>
      <div className = 'content'>
        <AnimatedPasswordInput title = 'Current Password' onValueChange = {e => setPassword1(e)} onRef = {r => updateRef(r, 0)}/>
        <AnimatedPasswordInput title = 'New Password' onValueChange = {e => setPassword2(e)} onRef = {r => updateRef(r, 1)}/>
        <AnimatedPasswordInput title = 'Confirm New Password' onValueChange = {e => setPassword3(e)} onRef = {r => updateRef(r, 2)}/>
        <button className = 'save' disabled = {!filled} onClick = {submit}>SAVE CHANGES</button>
      </div>
    </div>
  )
}

function EmailSection(props){
  let [inital, setInital] = useState(props.email);
  let [value, setValue] = useState(inital);
  let [loading, setLoading] = useState(false);
  let [ref, setRef] = useState();
  let QueryAPI = useAPI();


  useEffect(() => {
    setInital(props.email);
    setValue(props.email);
  }, [props.email])

  function submit(){
    if (!loading){
      setLoading(true);
      QueryAPI('/account/setEmail', {email:value}, function(email){
        setLoading(false);
        ref.current.value = '';
        if (email){
          ref.current.placeholder = email;
          setInital(email);
          setValue(email);
          console.log(email);
        }
      });
    }
  }

  return (
    <div className = 'section'>
      <div className = 'header'>
        <div className = 'title'>Email</div>
        <div className = 'description'>Your Email address is where all information involving your account and its security be sent to.</div>
      </div>
      <div className = 'content'>
        <AnimatedInput title = 'Email' placeholder = {inital} onValueChange = {v => setValue(v)} onRef = {r => setRef(r)}/>
        <button className = 'save' disabled = {inital === value} onClick = {submit}>SAVE CHANGES</button>
      </div>
    </div>
  )
}

export default AccountInfo;
