import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { Link } from 'react-router-dom';

import {ReactComponent as Refresh} from '../../assets/svgs/Reload.svg';

import './browse.css';


function BrowseMenu(){
  let socket = useOutletContext();
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

  return (
    <div className = 'page_content browse'>
      <h1 className = 'header'>Public Rooms</h1>
      <div className = 'roomList'>
        <Refresh onClick = {refresh}/>
        {rooms.map(room => (
          <Link to = {'play/' + room.id}>
            <div className = 'name'>{room.name}</div>
            <div className = 'players'>{room.players.max === null ? room.players.current : room.players.current + ' / ' + room.players.max}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BrowseMenu;
