import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatWindow:React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);

  // Fetches the chat messages
  const fetchMessages = async () => {

    const chatId = '6294125706'; 
    const token = '6288740725:AAEAAjyp8eHAmxkESlDW0O_qrdFgeNn0D20';

    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${token}/getUpdates`
      );

      if (response.data && response.data.result) {
        const chatMessages = response.data.result.map((item) => ({
          id: item.message.message_id,
          text: item.message.text,
          sender: item.message.from.username || 'Unknown Sender',
        }));

        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Sends a message
  const handleSendMessage = async (e) => {
    const chatId = '6294125706'; 
    const token = '6288740725:AAEAAjyp8eHAmxkESlDW0O_qrdFgeNn0D20';
    e.preventDefault();

    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          chat_id: chatId,
          text: inputValue,
        }
      );

      if (response.data && response.data.ok) {
        // Message sent successfully, fetch updated messages
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setInputValue('');
  };

  useEffect(() => {
    // Fetch messages on component mount
    fetchMessages();
  }, []);

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <span className="sender">{message.sender}</span>
            <span className="text">{message.text}</span>
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
