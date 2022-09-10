import { useState, useEffect } from 'react';

import { AnimatedInput, AnimatedPasswordInput } from '../../../../assets/components/animatedInput';
import { InfoBox } from '../../../../assets/components/customIcons';
import useAPI from '../../../../assets/hooks/useAPI';

import './accountInfo.css';

function AccountInfo(){
  let [info, setInfo] = useState({});
  let QueryAPI = useAPI();

  //This warning is fine because data should only be fetched once.
  useEffect(() => {
    QueryAPI('/account/getInfo', null, function(result){
      if (result){
        setInfo(result);
      }
    });
  }, [])

  return (
    <div className = 'splitmenu'>
      <div>
        <div className = 'header'>
          <div className = 'title'>Display Name</div>
          <div className = 'description'>The Display Name is what other players will see when battling against you in online matches. It will also display when you get a high score on leaderboards.</div>
        </div>
        <div className = 'content'>
          <AnimatedInput placeholder = 'Display Name' value = {info.username}/>
          <button className = 'save' disabled>SAVE CHANGES</button>
        </div>
      </div>
      <div>
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
      <div>
        <div className = 'header'>
          <div className = 'title'>E-Mail</div>
          <div className = 'description'>Your Email address is where all information involving your account and its security be sent to.</div>
        </div>
        <div className = 'content'>
          <AnimatedInput placeholder = 'Email' value = 'example'/>
          <button className = 'save' disabled>SAVE CHANGES</button>
        </div>
      </div>
    </div>
  )
}

export default AccountInfo;
