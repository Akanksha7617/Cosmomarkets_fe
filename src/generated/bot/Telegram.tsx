import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../global.scss'

const Telegram: React.FC = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [minimized, setMinimized] = useState(false);

    const handleSendMessage = async (e) => {

        const CHAT_ID = '6294125706';
        const token = '6288740725:AAEAAjyp8eHAmxkESlDW0O_qrdFgeNn0D20';
        try {
            const requestBody = {
                chat_id: CHAT_ID,
                text: inputValue,
            };

            e.preventDefault();


            const circularReplacer = () => {
                const seen = new WeakSet();
                return (key, value) => {
                    if (typeof value === 'object' && value !== null) {
                        if (seen.has(value)) {
                            return;
                        }
                        seen.add(value);
                    }
                    return value;
                };
            };

            const jsonString = JSON.stringify(requestBody, circularReplacer());
            const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, jsonString, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const sentMessage = {
                id: Date.now(),
                text: e.target.message.value,
                sender: 'user',
            };

            setMessages([...messages, sentMessage]);
            setInputValue('');
            e.target.reset();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


    const sendMessage = async (text) => {
        const chatId = '6294125706';
        const token = '6288740725:AAEAAjyp8eHAmxkESlDW0O_qrdFgeNn0D20';

        text.preventDefault();
        if (inputValue.trim() !== '') {
            setMessages([...messages, inputValue]);
            setInputValue('');

            try {
                await axios.get(`https://api.telegram.org/bot${token}/sendMessage`, {
                    params: {
                        chat_id: chatId,
                        text: text,
                    },
                });
                console.log('Message sent successfully');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Function to fetch messages
    const fetchMessages = async () => {
        const chatId = '6294125706'; // Replace with the actual chat ID
        const token = '6288740725:AAEAAjyp8eHAmxkESlDW0O_qrdFgeNn0D20'; // Replace with your bot's API token

        try {
            const response = await axios.get(`https://api.telegram.org/bot${token}/getUpdates`, {
                params: {
                    chat_id: chatId,
                },
            });
            const receivedMessages = response.data.result.map((message) => message.message.text);
            setMessages(receivedMessages);
            console.log('Messages fetched successfully');
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Fetch messages on component mount
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 1000); // Fetch messages every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const toggleMinimized = () => {
        setMinimized(!minimized);
    };


    return (
        // <div>

        //     <div className="chatbot-container">
        //         <div className="chatbot-header">Chat Bot</div>
        //         <div className="chatbot-messages">
        //             {messages.map((message, index) => (
        //                 <div key={index}>{message}</div>
        //             ))}

        //         </div>

        //         <div className="chatbot-input">
        //             <form onSubmit={handleSendMessage}>
        //                 <input
        //                     type="text"
        //                     placeholder="Type your message"
        //                     value={inputValue}
        //                     onChange={handleInputChange}
        //                 />
        //                 <button type="submit">Send</button>
        //             </form>
        //         </div>
        //     </div>
        // </div>
        <div>
        <div className={`chatbot-container ${minimized ? 'minimized' : ''}`}>
          <div className="chatbot-header" onClick={toggleMinimized}>
            Chat Bot
          </div>
          {!minimized && (
            <>
              <div className="chatbot-messages">
                {messages.map((message, index) => (
                  <div key={index}>{message}</div>
                ))}
              </div>
              <div className="chatbot-input">
                <form onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type your message"
                    value={inputValue}
                    onChange={handleInputChange}
                  />
                  <button type="submit">Send</button>
                </form>
              </div>
            </>
          )}
        </div>
        <button className="minimize-button" onClick={toggleMinimized}>
          {minimized ? 'Maximize' : 'Minimize'}
        </button>
      </div>
    );
};

export default Telegram;
