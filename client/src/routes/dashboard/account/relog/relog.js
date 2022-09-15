import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

import { AnimatedInput, AnimatedPasswordInput } from '../../../../assets/components/animatedInput';
import LoadingOverlay from '../../../../assets/components/loadingOverlay';
import CodeInput from '../../../../assets/components/codeInput';
import useAPI from '../../../../assets/hooks/useAPI';

function Relog(){
  let [code, setCode] = useState('');
  let [loading, setLoading] = useState(false);
  let QueryAPI = useAPI();
  let location = useLocation();

  let email = new URLSearchParams(location.search).get('email');

  let submit = function(){
    if (!loading){
      setLoading(true);
      QueryAPI('/account/relog', {token:code}, function(result){
        setLoading(false);
      });
    }
  }

  let loadingContent = loading ? <LoadingOverlay/> : null; 

  return (
    <div className = 'centered'>
      <div className = "menu">
        <div className = 'header'>
          Extra Verification Required
        </div>
        <div className = 'subheader'>
          As an extra security measure, an Email containing a code has been sent to {email}
        </div>
        <CodeInput length = {6} getValue = {code => setCode(code)}/>
        <button onClick = {submit}>
          SUBMIT
        </button>
        {loadingContent}
      </div>
    </div>
  )
}

export default Relog;
