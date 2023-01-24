import {useState, useEffect} from 'react';
import Scrollbar from '../../../assets/components/scrollbar';
import useSocket from '../../../assets/hooks/useSocket';

import './winmenu.css';

const suffixList = ['ST','ND','RD','TH'];

function WinMenu(){
  let socket = useSocket();
  let [display, setDisplay] = useState(false);
  let [playerList, setPlayerList] = useState([]);

  const KeyHandler = function(e){
    e.preventDefault();
    setDisplay(false);
    document.removeEventListener('keyup', KeyHandler, false);
  }

  useEffect(() => {
    const endFunction = (players) => {
      setDisplay(true);
      setPlayerList(players);

      new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
        document.addEventListener('keyup', KeyHandler, false);
      });
    };

    const startFunction = () => {
      setDisplay(false);
    };

    socket.on('end', endFunction);
    socket.on('start', startFunction);
    socket.on('spectate', startFunction);

    return function(){
      socket.off('end', endFunction);
      socket.off('start', startFunction);
      socket.off('spectate', startFunction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  return (
    <Scrollbar>
      <div className = {'winMenu ' + (display ? 'visible' : 'hidden')} onKeyDown = {e => e.preventDefault()}>
        <div className = 'listWrapper'>
          <ul className = 'userList'>
            {playerList.map((player,i) => 
              (
                <li className = 'userStat' key = {i}>
                  <div className = 'place'>{(i + 1) + suffixList[Math.min(i,3)]}</div>
                  <div className = 'username'>{player.username}</div>
                  <div className = 'lines'>{player.linesSent} LINES SENT<br/>{player.linesReceived} LINES RECEIVED</div>
                </li>
              )
            )}
          </ul>
          <span>PRESS ANY KEY TO RETURN TO THE MENU</span>
        </div>
      </div>
    </Scrollbar>
  )
}

export default WinMenu;
