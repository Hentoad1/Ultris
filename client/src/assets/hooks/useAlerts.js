import { Fragment, useState, useEffect, useContext, createContext } from 'react';

import {ReactComponent as Warning} from '../svgs/Warning.svg';

import '../styles/alerts.css';

const AlertContext = createContext();
const CountContext = createContext();

function useAlerts(){
  let [alerts, setAlerts] = useContext(AlertContext);
  let [count, setCount] = useContext(CountContext);

  let add = (content) => {
    let remove = () => {
      setAlerts(alerts => alerts.slice(1));
    };

    const newAlert = (
      <div className = 'alert' onAnimationEnd = {remove}>
        <Warning/>
        <span>
          {content}
        </span>
      </div>
    );

    setCount(count => count + 1);
    setAlerts(alerts => [...alerts, newAlert]);
  }

  return add;
}

function Alerts(props){
  const alerts = useState([]);
  const count = useState(0);


  console.log(alerts[0]);
  return (
    <Fragment>
      <div className = 'alerts'>
        {alerts[0].map((x,i)=> <div key = {i}>{x}</div>)}
      </div>
      <AlertContext.Provider value={alerts}>
        <CountContext.Provider value={count}>
          {props.children}
        </CountContext.Provider>
      </AlertContext.Provider>
    </Fragment>
  )
}

export {Alerts};

export default useAlerts;