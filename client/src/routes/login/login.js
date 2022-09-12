import {useState} from 'react';
import { Link } from 'react-router-dom';

import {AnimatedInput,AnimatedPasswordInput} from '../../assets/components/animatedInput.js';
import useAPI from '../../assets/hooks/useAPI.js';
import LoadingOverlay from '../../assets/components/loadingOverlay.js';

import '../../assets/styles/menu.css';

function Login(props){
  let [loading, setLoading] = useState(false);
  let [email, setEmail] = useState({current:{}});
  let [password, setPassword] = useState({current:{}});
  let QueryAPI = useAPI();
  
  let submit = function(){
    let loginInfo = {
      email: email.current.value,
      password: password.current.value
    }

    setLoading(true);
    QueryAPI('/user/login', loginInfo,() => {
      setLoading(false);
    });
  };

  let keyHandler = function(e){
    if (e.key === 'Enter' && !loading){
        submit();
    }
  }

  let loadingContent = loading ? <LoadingOverlay/> : null;

  return (
    <div className = "page_content centered">
        <div className = "menu">
            <div className = 'header'>
              Account Info
            </div>
            <div className = 'subheader'>
              Enter your Email and Password.
            </div>
            <AnimatedInput onKeyUp = {keyHandler} onRef = {ref => {setEmail(ref); ref.current.focus()}} placeholder = 'EMAIL' background = '#0F0F0F11'/>
            <AnimatedPasswordInput onKeyUp = {keyHandler} onRef = {ref => setPassword(ref)} placeholder = 'PASSWORD' background = '#0F0F0F11'/>
            <button onClick = {submit}>LOGIN</button>
            <span>Don't have an account? <Link to = '/register' className = 'link'>Sign Up</Link></span>
            {loadingContent}
        </div>
    </div>
  )
}

export default Login;