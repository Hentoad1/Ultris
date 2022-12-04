import { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../wrapper';
import './statmenu.css';

const minorStatTitles = [
  'SINGLES',
  'DOUBLES',
  'TRIPLES',
  'QUADS',
  'T-SPIN SINGLES',
  'T-SPIN DOUBLES',
  'T-SPIN TRIPLES',
  'T-SPIN MINI SINGLES',
  'T-SPIN MINI DOUBLES',
  'ALL CLEARS',
  'LARGEST B2B STREAK'
];

const defaultStats = {
  displayMinors: true,
  primaryStat: '',
  primaryStatValue: '',
  secondaryStats: [],
  minorStats: []
}

function StatMenu(){
  let socket = useContext(SocketContext);
  let [display, setDisplay] = useState(false);
  let [stats, setStats] = useState(defaultStats);

  let gameEnd = (stats) => {
    socket.on('overwritePrimaryStat', function (value) {
      stats.primaryStatValue = value;
    })

    document.addEventListener('keyup', KeyHandler, false);
    var listenFunc;
    
    new Promise(function (resolve) {
      setTimeout(resolve, 2000, stats.display);
      listenFunc = function (e) {
        if (['r'].includes(e.key)) {
          resolve(false);
        }
      };
      document.addEventListener('keyup', listenFunc, false);
    }).then((displayValue) => {
      setDisplay(displayValue);
      setStats(stats);

      document.removeEventListener('keyup', listenFunc, false);
      socket.off('overwritePrimaryStat');
    });
  }

  useEffect(() => {
    socket.openStatMenu = gameEnd;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[socket]);

  let KeyHandler = (e) => {
    const dropMenu = () => {
      setDisplay(false);
      document.removeEventListener('keyup', this.KeyHandler, false);
    };

    if (e.key === 'Escape') {
      //dropMenu();
      //exit
    }
    if (e.key === 'r') {
      dropMenu();
    }
  }

  let minors = null;
  if (stats.displayMinors) {
    minors = stats.minorStats.map((e, i) => <li key={i + stats.secondaryStats.length}>{minorStatTitles[i]}: {e}</li>);
  }

  console.log(stats);

  return (
    <div className={'statMenu ' + (display ? 'visible' : 'hidden')}>
      <span className='primaryStat'>{stats.primaryStat}</span>
      <span className='primaryStatValue'>{stats.primaryStatValue}</span>
      <ul className="minorStats">
        {stats.secondaryStats.map((x, i) => <li key={i}>{x.title}: {x.value}</li>)}
        {minors}
      </ul>
      <span>
        PRESS R TO RESTART
      </span>
    </div>
  )
}

export default StatMenu;
