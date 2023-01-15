import { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSocket from '../../assets/hooks/useSocket';

import {ReactComponent as Refresh} from '../../assets/svgs/Reload.svg';

import './browse.css';


function BrowseMenu(){
  let socket = useSocket();
  let [rooms, setRooms] = useState([]);

  let refresh = () => {
    socket.emit('get rooms', rooms => {
      setRooms(rooms);
    });
  }

  useEffect(() => {
    refresh();
    //just refresh once otherwise have the user do it manually
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  let roomContent = null;
  if (rooms.length > 0){
    roomContent = (
      <Fragment>
        <Refresh onClick = {refresh}/>
        {rooms.map(room => (
          <Link to = {'/play/' + room.id}>
            <div className = 'name'>{room.name}</div>
            <div className = 'players'>{room.players.max === null ? room.players.current : room.players.current + ' / ' + room.players.max}</div>
          </Link>
        ))}
      </Fragment>
    );
  }else{
    roomContent = (
      <div>No public rooms have been created.</div>
    );
  }

  return (
    <div className = 'page_content browse'>
      <h1 className = 'header'>Public Rooms</h1>
      <div className = 'roomList'>
        {roomContent}
      </div>
    </div>
  )
}

export default BrowseMenu;
