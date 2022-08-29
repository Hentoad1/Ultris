import { useState, useEffect } from 'react';

import {ReactComponent as Warning} from '../svgs/Warning.svg';

import '../styles/alerts.css';

function useAlerts(){
  const [alerts, setAlerts] = useState([]);
  const [count, setCount] = useState(0);

  let add = (content) => {
    let remove = () => {
      setAlerts(alerts => alerts.slice(1));
    };

    const newAlert = (
      <div className = 'alert' onAnimationEnd = {remove} key = {count}>
        <Warning/>
        <span>
          {content}
        </span>
      </div>
    )

    setAlerts(alerts => [...alerts, newAlert]);
    setCount(count => count + 1);
  }

  return [alerts,add];
}

function Alerts(){
  let [alerts] = useAlerts();

  console.log('alert render happened');

  useEffect(() => {
    console.log('alerts in function', alerts);
  }, [alerts,alerts.length]);
  
  return (
    <div className = 'alerts'>
      {'text'}
    </div>
  )
}

export {Alerts};

export default useAlerts;