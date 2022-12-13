
import './404.css';

import { Link } from 'react-router-dom';

function Send404(){
  return (
    <div className = "page_content centered">
      <div className = "Error404">
        <h1>404 Error</h1>
        <div>This page does not exist.</div>
        <Link to = '/'>Return to home</Link>
      </div>
    </div>
  )
}

export default Send404;