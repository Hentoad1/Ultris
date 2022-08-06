import React from 'react';
import './statmenu.css';

const offlineStatTitles = [
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
const onlineStatTitles = ['TOTAL PLAYERS', ...offlineStatTitles];
const defaultState = {
    display:false,
    displayMinors:true,
    primaryStat:'',
    primaryStatValue:'',
    secondaryStats:[],
    minorStats:[],
    online:false
};

class StatMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.KeyHandler = this.KeyHandler.bind(this);
        this.gameEnd = this.gameEnd.bind(this);
        this.initialize = this.initialize.bind(this);
    }

    initialize(gameMode,socket){
        /*
        ending scenarios:

        offline {
            press r to restart
        }

        online {
            - lose mid game
                press r to sprint
                to c to go to menu
            - lose end of the game
                press and key to continue to menu
        }

        */
    }

    gameEnd(stats){
        console.log(stats);
        if (stats.needsFormatting){
            let place = stats.primaryStatValue;
            if (place === 1){
                place += 'ST';
            }else if (place === 2){
                place += 'ND';
            }else if (place === 3){
                place += 'RD';
            }else{
                place += 'TH';
            }
            stats.primaryStatValue = place;
            delete stats.needsFormatting;
        }
        document.addEventListener('keyup', this.KeyHandler, false);
        new Promise(function(resolve){
            setTimeout(resolve,2000,stats.display);
            document.addEventListener('keyup', function(e){
                if (['Escape','r','c'].includes(e.key)){
                    resolve(false);
                }
            }, false);
        })
        .then(function(displayValue){
            stats.display = displayValue;
            this.setState(stats);
        }.bind(this));
    }

    KeyHandler(e){
        const dropMenu = function(){
            this.setState({display:false});
            document.removeEventListener('keyup', this.KeyHandler, false);
        }.bind(this);

        if (e.key === 'Escape'){
            dropMenu();
            //exit
        }
        if (e.key === 'r'){
            dropMenu();
            this.props.reset();
        }
        if (e.key === 'c'){
            dropMenu();
            //spectate
        }
    }

    render() {
        let minors = '';
        if (this.state.displayMinors){
            if (this.state.online){
                minors = this.state.minorStats.map((e,i) => <li key = {i + this.state.secondaryStats.length}>{onlineStatTitles[i]}: {e}</li>);
            }else{
                minors = this.state.minorStats.map((e,i) => <li key = {i + this.state.secondaryStats.length}>{offlineStatTitles[i]}: {e}</li>);
            }
        }

        return (
            <div className = {'statMenu ' + (this.state.display ? 'visible' : 'hidden')}>
                <span className = 'primaryStat'>{this.state.primaryStat}</span>
                <span className = 'primaryStatValue'>{this.state.primaryStatValue}</span>
                <ul className = "minorStats">
                    {this.state.secondaryStats.map((x,i) => <li key = {i}>{x.title}: {x.value}</li>)}
                    {minors}
                </ul>
                <span>
                PRESS R TO RESTART<br/>
                PRESS ESC TO EXIT TO MENU
                </span>
            </div>
        )
    }
}
  
export default StatMenu;
