import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import {AnimatedInput,AnimatedPasswordInput} from '../../assets/components/animatedInput.js';
import CustomCheckbox from '../../assets/components/customCheckbox.js';
import useAPI from '../../assets/hooks/useAPI.js';
import LoadingOverlay from '../../assets/components/loadingOverlay.js';

import './leaderboard.css';

/* add dates to database */

function Leaderboard(){
  let [pageData, setPageData] = useState(null);
  let QueryAPI = useAPI();

  useEffect(() => {
    QueryAPI('/leaderboard', {type:'sprint', page:0},(result) => {
      if (result){
        setPageData(result);
      }
    });
  },[])

  var table = null;
  if (pageData === null){
    table = (
      <div>
        failed to load leaderboard data
      </div>
    )
  }else if (pageData.length === 0){
    table = (
      <div>
        cannot find any match
      </div>
    )
  }else{
    table = (
      <table>
        {pageData.map(stat => 
          <tr>
            <td>{stat.place}</td>
            <td>{stat.score}</td>
            <td>{stat.name}</td>
            <td>{stat.date}</td>
          </tr>
        )}
      </table>
    )
  }

  return (
    <div className = 'page_content leaderboard'>
      {table}
    </div> 
  )
}

export default Leaderboard;