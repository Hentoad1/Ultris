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
    display:false,
    displayMinors:true,
    primaryStat:'',
    primaryStatValue:'',
    secondaryStats:null,
    minorStats:[]
};

class StatMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.KeyHandler = this.KeyHandler.bind(this);
        this.gameEnd = this.gameEnd.bind(this);
    }

    initialize(gameMode,socket){
        socket.on('connection',function(){
            console.log('connection');
        });
    }

    gameEnd(stats){
        console.log(stats);
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
            minors = this.state.minorStats.map((e,i) => <li key = {i + this.state.secondaryStats.length}>{minorStatTitles[i]}: {e}</li>);
        }

        return (
            <div className = {'statMenu ' + (this.state.display ? 'visible' : 'hidden')}>
                <span className = 'primaryStat'>{this.state.primaryStat}</span>
                <span className = 'primaryStatValue'>{this.state.primaryStatValue}</span>
                <ul className = "minorStats">
                    {this.state.secondaryStats !== null ? this.state.secondaryStats.map((x,i) => <li key = {i}>{x.title}: {x.value}</li>) : ''}
                    {minors}
                </ul>
                <span id = 'restartInfo'>
                PRESS R TO RESTART<br/>
                PRESS ESC TO EXIT TO MENU
                </span>
            </div>
        )
    }
}
  
export default StatMenu;
