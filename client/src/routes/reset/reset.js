import { useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';
import { AnimatedPasswordInput } from '../../assets/components/animatedInput';

import './reset.css';

function ResetPassword(){
  let [params] = useSearchParams();

  console.log(params);

  return (
    <div className = 'page_content centered'>
      <div className = "menu">  
        <div className = 'header'>Enter a new password.</div>
        <div className = 'subheader'>Your password must be at least 8 characters long.</div>
        <AnimatedPasswordInput title = 'PASSWORD'/>
        <AnimatedPasswordInput title = 'CONFIRM PASSWORD'/>
        <button>Reset</button>
      </div>
    </div>
  )
}

export default ResetPassword;