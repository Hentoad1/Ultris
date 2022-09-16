import { Fragment, useState, useEffect, useCallback, useContext, createContext } from 'react';

import {ReactComponent as Warning} from '../svgs/Warning.svg';
import {ReactComponent as Checkmark} from '../svgs/Checkmark.svg';

import '../styles/alerts.css';

const AlertContext = createContext();

function useAlerts(){
  let [, setAlerts] = useContext(AlertContext);

  let add = useCallback((content, options = {}) => {
    let svg = <Checkmark/>;
    if (options.type === 'error'){
      svg = <Warning/>;
    }

    const newAlert = (
      <div className = {'alert ' + options.type ?? ''} onAnimationEnd = {() => {}/*setAlerts(alerts => alerts.slice(1))*/}>
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
}

export {Alerts};

export default useAlerts;