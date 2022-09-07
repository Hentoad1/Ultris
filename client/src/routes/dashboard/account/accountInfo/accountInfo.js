import React from 'react';

import { AnimatedInput } from '../../../../assets/components/animatedInput';

import './accountInfo.css';

function AccountInfo(){
  return (
    <div className = 'splitmenu'>
      <div>
        <div className = 'header'>
          <div className = 'title'>
            Username
          </div>
          <div className = 'description'>
            Your username is the name other players will see when battling against you in online matches. It will also display on leaderboards.
          </div>
        </div>
        <div className = 'content'>
          <AnimatedInput placeholder = 'Username' value = 'example'/>
          <button>Save Changes</button>
        </div>
      </div>
      <div>
        <div className = 'header'>
          header 2
        </div>
        <div className = 'content'>
          bodybodybodybodybodybod ybodybodybodybodybody
        </div>
      </div>
    </div>
  )
}

export default AccountInfo;
