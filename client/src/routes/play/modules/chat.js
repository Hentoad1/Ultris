import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';

import './chat.css';

const WhiteSpaceRegex = new RegExp(/^\s*$/);

function Chat(){
  let socket = useOutletContext();
  let [messages, setMessages] = useState([]);
  let [inLobby, setInLobby] = useState(true);

  useEffect(() => {
    const messageFunction = (type, name, msg) => {
      setMessages(messages => [...messages, { type, name, msg }]);
    };

    const startFunction = () => setInLobby(false);

    const endFunction = () => setInLobby(true);
    
    socket.on('message', messageFunction);
    socket.on('start', startFunction);
    socket.on('end', endFunction);

    return function(){
      socket.off('message', messageFunction);
      socket.off('start', startFunction);
      socket.off('end', endFunction);
    }

  },[socket])

  let KeyHandler = (e) => {
    if (e.key === 'Enter') {
      let value = e.target.value;
      if (!WhiteSpaceRegex.test(value)) { //makes sure its not blank
        socket.emit('send message', value);
      }
      e.target.value = '';
    }
  };

  return (
    <div className={'chat' + (inLobby ? ' inLobby' : '')}>
      <ul className='chatMessages'>
        {messages.map((e, i) => <li className={e.type} key={i}>{e.name}: {e.msg}</li>)}
      </ul>
      <input className='chatInput' onKeyUp={KeyHandler} onFocus={() => socket.game.removeListeners()} onBlur={() => socket.game.addListeners()} placeholder='Type here to send a message...' />
    </div>
  )
}

export default Chat;
