import React from 'react';

import './chat.css';


const defaultState = {
    display:true,
    socket:undefined,
    inLobby:true,
    messages:[]
}
class Chat extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.KeyHandler = this.KeyHandler.bind(this);

        this.msgRef = React.createRef();

        props.globals.chat = {
            setState:this.setState.bind(this),
            state:this.state
        }
    }

    componentDidMount(){
        let socket = this.props.globals.socket;
        
        socket.on('message', function(type, name, msg){
            let messages = this.state.messages;
            messages.push({type,name,msg});
            this.setState({messages});
        }.bind(this));

        socket.on('start', function(){
            let elem = this.msgRef.current;
            if (elem !== null){
                elem.style.transition = 'none';
                this.setState({inLobby:false},function(){
                    reflow(elem);
                    elem.style = null;
                });
            }
        }.bind(this));

        socket.on('end', function(){
            let elem = this.msgRef.current;
            new Promise(resolve => setTimeout(resolve,1000))
            .then(function(){
                if (elem !== null){
                    elem.style.transition = 'none';
                    this.setState({inLobby:true},function(){
                        reflow(elem);
                        elem.style = null;
                    });
                }
            }.bind(this));
        }.bind(this));

        function reflow(elem){
            return elem.offsetWidth;
        }
    }

    KeyHandler(e){
        if (e.key === 'Enter'){
			if (!/^\s*$/.test(e.target.value)){ //makes sure its not blank
				if (this.props.globals.socket !== undefined){
                    this.props.globals.socket.emit('send message',e.target.value);
                }
				
                
                e.target.value = '';
			}
		}
    }

    render() {
        return (
            <div className = {'chat' + (this.state.inLobby ? ' inLobby' : '')}>
                <ul className = 'chatMessages' ref = {this.msgRef}>
                    {this.state.messages.map((e,i) => <li className = {e.type} key = {i}>{e.name}: {e.msg}</li>)}
                </ul>
                <input className = 'chatInput' onKeyUp = {this.KeyHandler} placeholder = 'Type here to send a message...'/>
            </div>
        )
    }
}
  
export default Chat;
