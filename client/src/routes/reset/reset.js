import { useState } from 'react';

import { useSearchParams } from 'react-router-dom';
import { AnimatedPasswordInput } from '../../assets/components/animatedInput';
import useAPI from '../../assets/hooks/useAPI';

import styles from './reset.css';

function ResetPassword(){
  let QueryAPI = useAPI();
  let [params] = useSearchParams();
  let [password, setPassword] = useState();
  let [confirm, setConfirm] = useState();

  const submit = () => {
    let payload = {
      password,
      confirm,
      token:params.get('token')
    }
    
    QueryAPI('/user/resetPassword', payload);
  }

  return (
    <div className = 'p c'>
      <div className = {styles.menu}>  
        <div className = {styles.header}>Enter a new password.</div>
        <div className = {styles.subheader}>Your password must be at least 8 characters long.</div>
        <AnimatedPasswordInput title = 'PASSWORD' onValueChange = {e => setPassword(e)}/>
        <AnimatedPasswordInput title = 'CONFIRM PASSWORD' onValueChange = {e => setConfirm(e)}/>
        <button onClick = {submit}>Reset</button>
      </div>
    </div>
  )
}

export default ResetPassword;