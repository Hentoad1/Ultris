import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

import { AnimatedInput, AnimatedPasswordInput } from '../../../../assets/components/animatedInput';
import LoadingOverlay from '../../../../assets/components/loadingOverlay';
import CodeInput from '../../../../assets/components/codeInput';
import useAPI from '../../../../assets/hooks/useAPI';

function Relog(){
  let QueryAPI = useAPI();
  let location = useLocation();

  let email = new URLSearchParams(location.search).get('email');


  return (
    <div className = 'centered'>
      <div className = "menu">
        <div className = 'header'>
          Extra Verification Required
        </div>
        <div className = 'subheader'>
          As an extra security measure, an Email containing a code has been sent to {email}
        </div>
        <CodeInput/>
        <button>
          SUBMIT
        </button>
      </div>
    </div>
  )
}

export default Relog;
