import { Fragment, useState, useEffect, useCallback, useContext, createContext } from 'react';

import {ReactComponent as Warning} from '../svgs/Warning.svg';
import {ReactComponent as Checkmark} from '../svgs/Checkmark.svg';

import '../styles/alerts.css';

const AlertContext = createContext();

//component that manages the alerts themselves
function AlertWrapper(props){
  let [state, setState] = useState([]);
  let [count, setCount] = useState(0);


  const removeAlert = useCallback(id => {
    setState(state => state.filter(info => info.id !== id));
  },[state, setState]);

  const AddAlert = useCallback((text, options = {}) => {
    setState(state => [...state, {options, text, id:count, removeFunc:removeAlert}]);
    setCount(count => count + 1);
  },[state, setState, count, setCount, removeAlert]);

  return (
    <Fragment>
      <AlertContext.Provider value={AddAlert}>
        <div className = 'alerts'>
          {state.map((info, key) => <Alert key = {key} {...info}></Alert>)}
        </div>
        {props.children}
      </AlertContext.Provider>
    </Fragment>
  )
}

//hook components use to add an alert
function useAlerts(){
  let add = useContext(AlertContext);
  return add;
}

//the actual alert
function Alert(props){
  let removeFunc = () => {
    props.removeFunc(props.id);
  }
  
  let options = props.options;
  return (
    <div className = {'alert ' + options.type ?? ''} onAnimationEnd = {removeFunc}>
      {props.text}
    </div>
  )
}







/*function useAlerts(){
  let [, setAlerts] = useContext(AlertContext);

  let add = useCallback((content, options = {}) => {
    let svg = <Checkmark/>;
    if (options.type === 'error'){
      svg = <Warning/>;
    }

    const newAlert = (
      <div className = {'alert ' + options.type ?? ''} onAnimationEnd = {() => {}//setAlerts(alerts => alerts.slice(1))}>
        {svg}
        <span>
          {content}
        </span>
      </div>
    );

    setAlerts(alerts => [...alerts, newAlert]);
  },[setAlerts]);

  return add;
}

function Alerts(props){
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    //console.log(alerts);
  }, [alerts]);

  return (
    <Fragment>
      <div className = 'alerts'>
        {alerts.map((x,i) => <Fragment key = {i}>{x}</Fragment>)}
      </div>
      <AlertContext.Provider value={[alerts, setAlerts]}>
          {props.children}
      </AlertContext.Provider>
    </Fragment>
  )
}*/

export {AlertWrapper};

export default useAlerts;