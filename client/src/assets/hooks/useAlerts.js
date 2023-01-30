import { Fragment, useState, useCallback, useContext, createContext } from 'react';

import styles from '../styles/alerts.css';

const AlertContext = createContext();

//component that manages the alerts themselves
function AlertWrapper(props){
  let [state, setState] = useState([]);
  let [count, setCount] = useState(0);


  const removeAlert = useCallback(id => {
    setState(state => {
      let alertsHanging = state.some(info => info.id !== id && !info.expired);

      if (alertsHanging){
        return state.map(info => {
          if (info.id === id){
            return {...info, expired:true};
          }else{
            return info;
          }
        });
      }else{
        return [];
      }
    });
  },[setState]);

  const AddAlert = useCallback((text, options = {}) => {
    setState(state => [...state, {options, text, id:count, removeFunc:removeAlert, expired:false}]);
    setCount(count => count + 1);
  },[setState, count, setCount, removeAlert]);

  return (
    <Fragment>
      <AlertContext.Provider value={AddAlert}>
        <div className = {styles.alerts}>
          {state.map((info, key) => <Alert key = {key} {...info}></Alert>)}
        </div>
        {props.children}
      </AlertContext.Provider>
    </Fragment>
  )
}

//hook components use to add an alert
const useAlerts = () => useContext(AlertContext);

//the actual alert
function Alert(props){
  let removeFunc = () => {
    props.removeFunc(props.id);
  }
  
  let options = props.options;
  return (
    <div className = {(styles.alert + ' ' + (options.type ?? '')).trimEnd()} onAnimationEnd = {removeFunc}>
      {props.text}
    </div>
  )
}

export {AlertWrapper};

export default useAlerts;