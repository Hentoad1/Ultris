import {useState} from 'react';
import { Link , Navigate } from 'react-router-dom';

import {AnimatedInput,AnimatedPasswordInput} from '../../assets/components/animatedInput.js';
import useAPI from '../../assets/hooks/useAPI.js';
import {ReactComponent as Loading} from '../../assets/svgs/Loading.svg';

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
    QueryAPI('/account/login', loginInfo,() => {
      setLoading(false);
    });
  };

  let keyHandler = function(e){
    if (e.key === 'Enter'){
        submit();
    }
  }

  let loadingContent = loading ? 
  <div className = 'loading'>
      <Loading/>
  </div>
  : null;

  return (
    <div className = "page_content centered">
        <div className = "menu">
            <div className = 'header'>
                <h1>Account Info</h1>
                <span>Enter your Email and Password.</span>
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