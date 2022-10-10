import React from 'react';
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
const defaultState = {
  display: false,
  displayMinors: true,
  primaryStat: '',
  primaryStatValue: '',
  secondaryStats: [],
  minorStats: []
};

class StatMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = defaultState;

    this.KeyHandler = this.KeyHandler.bind(this);
    this.gameEnd = this.gameEnd.bind(this);

    props.globals.statmenu = {
      setState: this.setState.bind(this),
      gameEnd: this.gameEnd
    }
  }

  gameEnd(stats) {
    let socket = this.props.globals.socket;

    socket.on('overwritePrimaryStat', function (value) {
      stats.primaryStatValue = value;
    })

    document.addEventListener('keyup', this.KeyHandler, false);
    var listenFunc;
    
    new Promise(function (resolve) {
      setTimeout(resolve, 2000, stats.display);
      listenFunc = function (e) {
        if (['r'].includes(e.key)) {
          resolve(false);
        }
      };
      document.addEventListener('keyup', listenFunc, false);
    }).then(function (displayValue) {
      stats.display = displayValue;
      this.setState(stats);

      document.removeEventListener('keyup', listenFunc, false);
      socket.off('overwritePrimaryStat');
    }.bind(this));
  }

  KeyHandler(e) {
    const dropMenu = function () {
      this.setState({ display: false });
      document.removeEventListener('keyup', this.KeyHandler, false);
    }.bind(this);

    if (e.key === 'Escape') {
      //dropMenu();
      //exit
    }
    if (e.key === 'r') {
      dropMenu();
      this.props.globals.game.reset();
    }
  }

  render() {
    let minors = '';
    if (this.state.displayMinors) {
      minors = this.state.minorStats.map((e, i) => <li key={i + this.state.secondaryStats.length}>{minorStatTitles[i]}: {e}</li>);
    }

    return (
      <div className={'statMenu ' + (this.state.display ? 'visible' : 'hidden')}>
        <span className='primaryStat'>{this.state.primaryStat}</span>
        <span className='primaryStatValue'>{this.state.primaryStatValue}</span>
        <ul className="minorStats">
          {this.state.secondaryStats.map((x, i) => <li key={i}>{x.title}: {x.value}</li>)}
          {minors}
        </ul>
        <span>
          PRESS R TO RESTART
        </span>
      </div>
    )
  }
}

export default StatMenu;
