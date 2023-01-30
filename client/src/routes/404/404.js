import { Link } from 'react-router-dom';

import styles from './404.css';

function Send404(){
  return (
    <div className = 'p c'>
      <div className = {styles.Error404}>
        <h1>404 Error</h1>
        <div>This page does not exist.</div>
        <Link to = '/'>Return to home</Link>
      </div>
    </div>
  )
}

export default Send404;