import { useState } from 'react';
import { useLocation } from 'react-router';

import LoadingOverlay from '../../../../assets/components/loadingOverlay';
import CodeInput from '../../../../assets/components/codeInput';
import useAPI from '../../../../assets/hooks/useAPI';

import styles from '../../../../assets/styles/menu.css';

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
    <div className = 'c'>
      <div className = {styles.menu}>
        <div className = {styles.header}>
          Extra Verification Required
        </div>
        <div className = {styles.subheader}>
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
