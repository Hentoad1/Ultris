import React from 'react';
import './chat.css';

const defaultState = {
    display:true,
    socket:undefined,
    messages:[]
}
class Chat extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.initialize = this.initialize.bind(this);
        this.KeyHandler = this.KeyHandler.bind(this);
    }

    initialize(gameMode,socket){
        this.setState({display:gameMode === 'online',socket})
        socket.on('message', function(type, name, msg){
            console.log('fired');
            let messages = this.state.messages;
            messages.push({type,name,msg});
            this.setState({messages});
        }.bind(this));
    }

    KeyHandler(e){
        if (e.key === 'Enter'){
			if (!/^\s*$/.test(e.target.value)){ //makes sure its not blank
				if (this.state.socket !== undefined){
                    console.log('sent');
                    this.state.socket.emit('send message',e.target.value);
                }
				
                
                e.target.value = '';
			}
		}
    }

    render() {
        if (this.state.display){
            return (
                <div className = 'chat'>
                    <ul className = 'chatMessages'>
                        {this.state.messages.map((e,i) => <li className = {e.type} key = {i}>{e.name}: {e.msg}</li>)}
                    </ul>
                    <input className = 'chatInput' onKeyUp = {this.KeyHandler} placeholder = 'Type here to send a message...'/>
                </div>
            )
        }
    }
}
  
export default Chat;
