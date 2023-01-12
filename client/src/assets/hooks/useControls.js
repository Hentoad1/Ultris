const defaultControls = {
  exit:'Escape',
  reset:'r',
  left:'ArrowLeft',
  right:'ArrowRight',
  soft:'ArrowDown',
  rotate90:'ArrowUp',
  rotate180:'a',
  rotate270:'z',
  hold:'c',
  hard:' ',
}

function useControls(){
  let getControls = () => {
    let controls = localStorage.getItem('controls');
    
    if (controls === null){
      return defaultControls;
    }

    return JSON.parse(controls);
  }

  let setControls = (controls) => {
    localStorage.setItem('controls', JSON.stringify(controls));
  }

  return [getControls, setControls];
}

export {defaultControls}

export default useControls;