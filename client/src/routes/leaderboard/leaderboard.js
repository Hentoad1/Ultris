import React, { useState, useEffect } from 'react';
import { NavLink, Link, useSearchParams } from 'react-router-dom';

import useAPI from '../../assets/hooks/useAPI.js';

import {ReactComponent as SingleLeft} from '../../assets/svgs/Single_Arrow_Left.svg';
import {ReactComponent as DoubleLeft} from '../../assets/svgs/Double_Arrow_Left.svg';
import {ReactComponent as SingleRight} from '../../assets/svgs/Single_Arrow_Right.svg';
import {ReactComponent as DoubleRight} from '../../assets/svgs/Double_Arrow_Right.svg';

import './leaderboard.css';

function Leaderboard(props){
  let [params] = useSearchParams();
  let [pageData, setPageData] = useState(null);
  let [maxPage, setMaxPage] = useState(null);
  let QueryAPI = useAPI();

  let page = params.get('page') ?? 1;
  page = parseInt(page);

  useEffect(() => {
    QueryAPI('/leaderboard', {type:props.type, page:page-1},(result) => {
      if (result){
        setPageData(result.rows);
        setMaxPage(result.totalPages);
      }
    });
  },[props.type, page, QueryAPI])

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
        <tbody>
          {pageData.map((stat, i) => 
            <tr key = {i}>
              <td>{stat.place}</td>
              <td>{stat.score}</td>
              <td>{stat.name}</td>
              <td>{stat.date}</td>
            </tr>
          )}
        </tbody>
      </table>
    )
  }

  const pagesToRender = 7;


  let minPage = Math.max(1, page - Math.floor(pagesToRender / 2));
  let numberedPages = [];

  for (let i = 0; i < pagesToRender; i++){
    if (i + minPage > maxPage){
      break;
    }
    numberedPages.push(i + minPage);
  }

  let backArrowContent = null;

  if (page > 1){
    backArrowContent = (
      <React.Fragment>
        <Link to = '.?page=1'>
          <DoubleLeft/>
        </Link>
        <Link to = {'.?page=' + (page - 1)}>
          <SingleLeft/>
        </Link>
      </React.Fragment>
    );
  }

  let forwardArrowContent = null;

  if (page < maxPage){
    forwardArrowContent = (
      <React.Fragment>
        <Link to = {'.?page=' + (page + 1)}>
          <SingleRight/>
        </Link>
        <Link to = {'.?page=' + maxPage}>
          <DoubleRight/>
        </Link>
      </React.Fragment>
    );
  }

  return (
    <div className = 'page_content leaderboard'>
      <div className = 'categoryButtons'>
        <NavLink to = '/leaderboard/sprint'>Sprint</NavLink>
        <NavLink to = '/leaderboard/blitz'>Blitz</NavLink>
      </div>
      {table}
      <div className = 'pageButtons'>
        {backArrowContent}
        {numberedPages.map(pageNumber => {
          return (
            <Link to = {'.?page=' + pageNumber} key = {pageNumber} className = {pageNumber === parseInt(page) ? 'active' : ''}>{pageNumber}</Link>
          );
        })}
        {forwardArrowContent}
      </div>
    </div> 
  )
}

export default Leaderboard;