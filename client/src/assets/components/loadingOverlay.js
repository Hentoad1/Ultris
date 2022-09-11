import {ReactComponent as Loading} from '../../assets/svgs/Loading.svg';

import './loadingOverlay.css';

function LoadingOverlay(){
  return (
    <div className = 'loadingOverlay'>
      <Loading/>
    </div>
  )
}


export default LoadingOverlay;