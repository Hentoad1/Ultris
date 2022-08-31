import { Fragment, useState, useCallback, useContext, createContext } from 'react';

import {ReactComponent as Warning} from '../svgs/Warning.svg';

import '../styles/alerts.css';

const AlertContext = createContext();

function useAlerts(){
  let [alerts, setAlerts] = useContext(AlertContext);

  let add = (content) => {
    setAlerts(alerts => [...alerts, {content, id: Math.random()}]);
  }

  return add;
}

function Alerts(props){
  let [alerts, setAlerts] = useState([]);

  console.log(alerts);

  const remove = useCallback((id) => {
    console.log('removing',id,'of',alerts);
    setAlerts(a => a.filter(e => e.id !== id))
  },[setAlerts, alerts]);

  return (
    <Fragment>
      <div className = 'alerts'>
        {alerts.map((data,i) => <Alert {...data} remove = {remove} key = {i}/>)}
      </div>
      <AlertContext.Provider value={[alerts, setAlerts]}>
        {props.children}
      </AlertContext.Provider>
    </Fragment>
  )
}

function Alert(props){
  return (
    <div className = 'alert' onAnimationEnd = {() => props.remove(props.id)}>
      <Warning/>
      <span>
        {props.content}
      </span>
    </div>
  )
}

export {Alerts};

export default useAlerts;