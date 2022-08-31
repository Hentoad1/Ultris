import { useState, useEffect } from 'react';

import {ReactComponent as Warning} from '../svgs/Warning.svg';

import '../styles/alerts.css';

let sharedAlerts = [];

function useSharedState() {
  const [state, _setState] = useState(sharedAlerts);

  // If shared count is changed by other hook instances, update internal count
  useEffect(() => {
    _setState(sharedAlerts);
  }, [sharedAlerts]);

  const setState = (value) => {
    sharedAlerts = value; // Update shared count for use by other hook instances
    _setState(value);    // Update internal count
  };
  
  return [state, setState];
}

function useAlerts(){
  let [alerts, setAlerts] = useSharedState();
  let [count, setCount] = useState(0);

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

  return add;
}

function Alerts(){
  let [alerts] = useSharedState();
  
  useEffect(() => {
    console.log('alerts', alerts);
  }, [alerts])

  return (
    <div className = 'alerts'>
      {alerts}
    </div>
  )
}

export {Alerts};

export default useAlerts;