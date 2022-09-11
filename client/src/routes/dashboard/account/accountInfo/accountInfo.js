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
      <div className = 'section'>
        <div className = 'header'>
          <div className = 'title'>Display Name</div>
          <div className = 'description'>The Display Name is what other players will see when battling against you in online matches. It will also display when you get a high score on leaderboards.</div>
        </div>
        <div className = 'content'>
          <AnimatedInput placeholder = 'Display Name' value = {info.username}/>
          <button className = 'save' disabled>SAVE CHANGES</button>
        </div>
      </div>
      <div className = 'section'>
        <div className = 'header'>
          <div className = 'title'>Password</div>  
          <div className = 'description'>Your password is used only to log into your account. Do not share this with anyone.</div>
        </div>
        <div className = 'content'>
          <AnimatedPasswordInput placeholder = 'Current Password'/>
          <AnimatedPasswordInput placeholder = 'New Password'/>
          <AnimatedPasswordInput placeholder = 'Confirm New Password'/>
          <button className = 'save' disabled>SAVE CHANGES</button>
        </div>
      </div>
      <div className = 'section'>
        <div className = 'header'>
          <div className = 'title'>E-Mail</div>
          <div className = 'description'>Your Email address is where all information involving your account and its security be sent to.</div>
        </div>
        <div className = 'content'>
          <AnimatedInput placeholder = 'Email' value = {info.email}/>
          <button className = 'save' disabled>SAVE CHANGES</button>
        </div>
      </div>
    {loadingContent}
    </div>
  )
}

export default AccountInfo;
