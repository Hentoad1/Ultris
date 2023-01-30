import {Fragment, useState} from 'react';


import useControls, {defaultControls} from '../../../assets/hooks/useControls';

import styles from './settings.css';

const joinedDefault = Object.values(defaultControls).join();

function Controls(){
  let [getControls, setControl] = useControls();
  let [controls, setControls] = useState(getControls());
  let [popup, setPopup] = useState(null);
  let [inital, setInital] = useState(Object.assign({},controls));

  let rebind = function(keyName){
    let keyListener = function(e){
      window.removeEventListener('keyup',keyListener,false);
      
      if (e.key === undefined){
        controls[keyName] = '';
        setControls(controls);
        setPopup(null);
      }else{
        controls[keyName] = e.key;
        setControls(controls);
        setPopup(null);
      }

    };

    window.addEventListener('keyup',keyListener,false);

    let popup = (
      <div className = {styles.controlPopup} onClick = {keyListener}>
          <h1>PRESS ANY KEY TO REBIND</h1>

          <span>CLICK ANYWHERE TO UNBIND</span>
      </div>
    );
    
    setPopup(popup);
  }

  let save = () => {
    setControl(controls);
    setInital(Object.assign({},controls));
  }

  let ctrlsMatchDefault = Object.values(controls).join() === joinedDefault;
  let ctrlsMatchInitial = Object.values(controls).join() === Object.values(inital).join()

  return (
    <Fragment>
      <table className = {styles.controlTable}>
        <thead>
          <tr>
            <th>Action</th>
            <th>Key</th>
          </tr>
        </thead>
        <tbody>
          {format(controls).map(([keyName, displayName, control],i) => 
            <tr key = {i}>
              <td>{displayName}</td>
              <td onClick = {e => rebind(keyName,displayName,e)}>{control}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className = {styles.controlButtons}>
        <button onClick = {() => setControls(Object.assign({},defaultControls))} disabled = {ctrlsMatchDefault}>Set to Default</button>
        <button disabled = {ctrlsMatchInitial} onClick = {save}>Save</button>
      </div>
      {popup}
    </Fragment>
  )
}

const controlNames = {
  exit:'Exit',
  reset:'Reset',
  left:'Left',
  right:'Right',
  soft:'Soft Drop',
  rotate90:'Rotate 90',
  rotate180:'Rotate 180',
  rotate270:'Rotate 270',
  hold:'Hold',
  hard:'Hard Drop',
}

const keyNames = {
  '':'<UNBOUND>',
  ' ':'Space',
  ArrowLeft:'Left Arrow',
  ArrowRight:'Right Arrow',
  ArrowUp:'Up Arrow',
  ArrowDown:'Down Arrow',
}


function format(object){
  return Object.entries(object).map(function([name, control]){
    if (control === null){ //format control
      control = '';
    }else if (keyNames[control] !== undefined){
      control = keyNames[control];
    }else if (control.length === 1){
      control = control.toUpperCase();
    }

    return (
      [name, controlNames[name], control]
    )
  });
}

export default Controls;
