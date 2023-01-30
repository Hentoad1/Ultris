import {ReactComponent as Loading} from '../../assets/svgs/Loading.svg';

import styles from './loadingOverlay.css';

function LoadingOverlay(){
  return (
    <div className = {styles.loadingOverlay}>
      <Loading/>
    </div>
  )
}


export default LoadingOverlay;