import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() =>{
    const ws = new WebSocket('ws://localhost:8000');
    

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log('Message from server ', event.data);
      setMessages(prevMessages => [...prevMessages, event.data]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!socket) {
    return <div>Connecting to WebSocket...</div>;
  } 
  return (
    <>
      <div className="App">
        <input onChange={(e)=>{setInputValue(e.target.value)}}></input>
        <button onClick={()=>{
          socket.send(inputValue);
        }}>Send</button>
        <h1>WebSocket Messages</h1>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App
