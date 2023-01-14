import React, { useState, useEffect } from 'react';
import { NavLink, Link, useSearchParams } from 'react-router-dom';

import useAPI from '../../assets/hooks/useAPI.js';

import Scrollbar from '../../assets/components/scrollbar.js';

import {ReactComponent as SingleLeft} from '../../assets/svgs/Single_Arrow_Left.svg';
import {ReactComponent as DoubleLeft} from '../../assets/svgs/Double_Arrow_Left.svg';
import {ReactComponent as SingleRight} from '../../assets/svgs/Single_Arrow_Right.svg';
import {ReactComponent as DoubleRight} from '../../assets/svgs/Double_Arrow_Right.svg';

import {ReactComponent as Loading} from '../../assets/svgs/Loading.svg';

import './leaderboard.css';

function Leaderboard(props){
  let [params] = useSearchParams();
  let [pageData, setPageData] = useState(null);
  let [maxPage, setMaxPage] = useState(null);
  let QueryAPI = useAPI();

  let page = params.get('page') ?? 1;
  page = parseInt(page);

  useEffect(() => {
    setPageData(null);
    QueryAPI('/leaderboard', {type:props.type, page:page-1},(result) => {
      if (result){
        setPageData(result.rows);
        setMaxPage(result.totalPages);
      }else{
        setPageData('error');
      }
    });
    // adding queryAPI here causes multiple API calls over and over again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[props.type, page])

  let hideTable = false;

  let table = null;
  if (pageData === null){
    hideTable = true;
    table = <Loading/>;
  }else if (typeof pageData !== 'object' || pageData.length === 0){
    hideTable = true;
    table = <div>An error occured loading the leaderboard.</div>;
  }else{
    table = (
      <table className = 'statTable'>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>{props.type === 'sprint' ? 'Time' : 'Score'}</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((stat, i) => 
            <tr key = {i}>
              <td>{stat.place}</td>
              <td>{stat.name}</td>
              <td>{stat.score}</td>
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
        <Link to = '.?page=1' draggable = {false}>
          <DoubleLeft/>
        </Link>
        <Link to = {'.?page=' + (page - 1)} draggable = {false}>
          <SingleLeft/>
        </Link>
      </React.Fragment>
    );
  }

  let forwardArrowContent = null;

  if (page < maxPage){
    forwardArrowContent = (
      <React.Fragment>
        <Link to = {'.?page=' + (page + 1)} draggable = {false}>
          <SingleRight/>
        </Link>
        <Link to = {'.?page=' + maxPage} draggable = {false}>
          <DoubleRight/>
        </Link>
      </React.Fragment>
    );
  }

  let navigatorContent = null;

  if (!hideTable){
    navigatorContent = (
      <div className = 'pageButtons'>
        {backArrowContent}
        {numberedPages.map(pageNumber => {
          return (
            <Link to = {'.?page=' + pageNumber} key = {pageNumber} className = {pageNumber === parseInt(page) ? 'active' : ''} draggable = {false}>{pageNumber}</Link>
          );
        })}
        {forwardArrowContent}
      </div>
    );
  }

  return (
    <Scrollbar>
      <div className = 'page_content leaderboardWrapper'>
        <div className = 'categoryButtons'>
          <NavLink to = '/leaderboard/sprint'>Sprint</NavLink>
          <NavLink to = '/leaderboard/blitz'>Blitz</NavLink>
        </div>
        <div className = 'leaderboard'>
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {table}
          {navigatorContent}
        </div>
      </div>
    </Scrollbar>
  )
}

export default Leaderboard;