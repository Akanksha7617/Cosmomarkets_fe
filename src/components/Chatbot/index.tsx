// src/components/ChatBot/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { request, useModel, history } from 'umi';
import { message } from 'antd';
import '../../common.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'options';
  options?: ChatOption[];
}

interface ChatOption {
  id: string;
  label: string;
  action: string;
  nextStep?: string;
}

interface ChatBotProps {
  userId?: string;
  userName?: string;
  userType?: 'admin' | 'client';
}

const ChatBot: React.FC<ChatBotProps> = ({ userId, userName, userType = 'client' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState('main');
  const [chatHistory, setChatHistory] = useState<string[]>(['main']);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { initialState } = useModel('@@initialState');

  // FAQ Data Structure
  const faqData = {
    main: {
      message: "How can I assist you today? Please select a category:",
      options: [
        { id: 'account', label: '👤 Account Related', action: 'navigate', nextStep: 'account' },
        { id: 'deposit', label: '💰 Deposit', action: 'navigate', nextStep: 'deposit' },
        { id: 'withdraw', label: '🏦 Withdraw', action: 'navigate', nextStep: 'withdraw' },
        { id: 'other', label: '❓ Other', action: 'navigate', nextStep: 'other' }
      ]
    },
    account: {
      message: "What account-related help do you need?",
      options: [
        { id: 'login', label: '🔐 Login Related', action: 'navigate', nextStep: 'login' },
        { id: 'password', label: '🔑 How to change my password', action: 'navigate', nextStep: 'password' },
        { id: 'profile', label: '✏️ How to edit profile', action: 'answer', nextStep: 'profile_answer' },
        { id: 'ib', label: '🤝 How to create IB account', action: 'navigate', nextStep: 'ib' },
        { id: 'mt5', label: '📈 How to create MT5 account', action: 'navigate', nextStep: 'mt5' },
        { id: 'subaccount', label: '➕ How to add MT5 sub-account', action: 'navigate', nextStep: 'subaccount' },
        { id: 'back', label: '⬅️ Back to main menu', action: 'back', nextStep: 'main' }
      ]
    },
    login: {
      message: "What login issue are you facing?",
      options: [
        { id: 'forgot_pwd', label: '🔐 Forgot password', action: 'answer', nextStep: 'forgot_pwd_answer' },
        { id: 'locked', label: '🔒 Account locked', action: 'answer', nextStep: 'locked_answer' },
        { id: 'username', label: '❓ Can\'t remember username', action: 'answer', nextStep: 'username_answer' },
        { id: '2fa', label: '📱 Two-factor authentication issues', action: 'answer', nextStep: '2fa_answer' },
        { id: 'back', label: '⬅️ Back', action: 'back', nextStep: 'account' }
      ]
    },
    password: {
      message: "There are two ways to change your password:",
      options: [
        { id: 'settings', label: '⚙️ From Account Settings', action: 'answer', nextStep: 'settings_answer' },
        { id: 'login_page', label: '🌐 From Login Page', action: 'answer', nextStep: 'login_page_answer' },
        { id: 'back', label: '⬅️ Back', action: 'back', nextStep: 'account' }
      ]
    },
    deposit: {
      message: "What deposit help do you need?",
      options: [
        { id: 'how_deposit', label: '💳 How to make a deposit', action: 'answer', nextStep: 'how_deposit_answer' },
        { id: 'methods', label: '💰 Deposit methods available', action: 'answer', nextStep: 'methods_answer' },
        { id: 'not_reflecting', label: '⏳ Deposit not reflecting', action: 'answer', nextStep: 'not_reflecting_answer' },
        { id: 'limits', label: '📊 Minimum/Maximum deposit limits', action: 'navigate', nextStep: 'deposit_limits' },
        { id: 'back', label: '⬅️ Back to main menu', action: 'back', nextStep: 'main' }
      ]
    },
    withdraw: {
      message: "What withdrawal help do you need?",
      options: [
        { id: 'wallet_withdraw', label: '💼 Withdraw from Wallet', action: 'navigate', nextStep: 'wallet_withdraw' },
        { id: 'mt5_withdraw', label: '📈 Withdraw from MT5', action: 'navigate', nextStep: 'mt5_withdraw' },
        { id: 'w_methods', label: '🏦 Withdrawal methods', action: 'answer', nextStep: 'w_methods_answer' },
        { id: 'not_processed', label: '⏳ Withdrawal not processed', action: 'answer', nextStep: 'not_processed_answer' },
        { id: 'w_limits', label: '📊 Withdrawal limits and fees', action: 'answer', nextStep: 'w_limits_answer' },
        { id: 'commission', label: '💰 Commission withdrawal', action: 'answer', nextStep: 'commission_answer' },
        { id: 'back', label: '⬅️ Back to main menu', action: 'back', nextStep: 'main' }
      ]
    },
    wallet_withdraw: {
      message: "Choose wallet withdrawal method:",
      options: [
        { id: 'bank_w', label: '🏦 Bank withdrawal', action: 'answer', nextStep: 'bank_w_answer' },
        { id: 'crypto_w', label: '₿ Crypto withdrawal', action: 'answer', nextStep: 'crypto_w_answer' },
        { id: 'cash_w', label: '💵 Cash withdrawal', action: 'answer', nextStep: 'cash_w_answer' },
        { id: 'back', label: '⬅️ Back', action: 'back', nextStep: 'withdraw' }
      ]
    },
    mt5_withdraw: {
      message: "To withdraw from your MT5 account:",
      answer: "Go to Transactions → MT5 to Wallet → Select MT5 login → Enter amount → Submit. Funds will be transferred to your wallet, then you can withdraw to external accounts.",
      options: [
        { id: 'cant_withdraw', label: '❓ Why can\'t I withdraw all my MT5 balance?', action: 'answer', nextStep: 'cant_withdraw_answer' },
        { id: 'free_margin', label: '📊 What is free margin?', action: 'answer', nextStep: 'free_margin_answer' },
        { id: 'min_withdrawal', label: '💰 Minimum withdrawal amount', action: 'answer', nextStep: 'min_withdrawal_answer' },
        { id: 'back', label: '⬅️ Back', action: 'back', nextStep: 'withdraw' }
      ]
    },
    other: {
      message: "For other inquiries not covered in our FAQ, please raise a support ticket. Our experts will assist you promptly.",
      options: [
        { id: 'create_ticket', label: '🎫 Create Support Ticket', action: 'redirect', nextStep: '/admin/helpDeskUser' },
        { id: 'back', label: '⬅️ Back to main menu', action: 'back', nextStep: 'main' }
      ]
    }
  };

  const answers = {
    profile_answer: "Go to Account Customization → Edit Profile. Here you can update your personal information, contact details, and preferences.",
    forgot_pwd_answer: "You can reset your password by clicking 'Forgot Password' on the login page. Enter your email and follow the instructions sent to your inbox.",
    locked_answer: "Your account may be locked due to multiple failed login attempts. Please contact our support team or wait 30 minutes before trying again.",
    username_answer: "Your username is usually your email address. If you're still unsure, please contact support.",
    '2fa_answer': "Make sure your device time is synchronized. If you've lost access to your authenticator app, please contact support for assistance.",
    settings_answer: "Go to Account Customization → Security Settings → Reset Old Password. Enter your current password and set a new one.",
    login_page_answer: "Click 'Forgot Password' on the login page. Enter your email and follow the reset instructions.",
    how_deposit_answer: "Go to Transactions → Deposit → Select payment method → Upload receipt → Submit request. ",
    methods_answer: "Available methods: Bank transfer, Card deposit, Wire transfer. Each method has different processing times.",
    not_reflecting_answer: "Deposits require admin approval. Check your transaction history or contact support if it's been more than 24 hours.",
    w_methods_answer: "Available withdrawal methods: Bank transfer, Cryptocurrency, Cash pickup. Processing times vary: Bank (2-5 days), Crypto (1-24 hours), Cash (Same day).",
    not_processed_answer: "Withdrawals require admin approval and sufficient balance. Check your transaction status. If marked 'Approved' but funds not received, contact support with transaction ID.",
    w_limits_answer: "Minimum withdrawal: $50. Daily limit: $10,000. Fees: Bank transfer (2%), Crypto (Network fees), Cash (3%). Limits may vary based on account verification level.",
    commission_answer: "Go to Transactions → Commission Withdraw → Enter amount → Provide bank details → Submit. You can only withdraw available commission balance.",
    bank_w_answer: "Go to Transactions → Withdraw → Bank Transfer → Enter amount → Provide bank details → Submit. Ensure you have sufficient wallet balance.",
    crypto_w_answer: "Go to Transactions → Withdraw → Crypto → Enter amount → Provide wallet address → Submit. Double-check wallet address before submitting.",
    cash_w_answer: "Go to Transactions → Withdraw → Cash Withdrawal → Enter amount → Submit request. Contact support for pickup arrangements.",
    cant_withdraw_answer: "You can only withdraw your 'Free Margin' amount. This protects you from margin calls on open positions. Close positions to increase free margin.",
    free_margin_answer: "Free Margin = Equity - Margin Used. It's the amount available for new trades or withdrawal. You cannot withdraw margin that's securing open positions.",
    min_withdrawal_answer: "Minimum MT5 withdrawal is $50. Amount must not exceed your free margin. Check your MT5 terminal for exact free margin amount."
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Hi ${userName || initialState?.currentUser?.firstName || 'there'}! 👋 Welcome to Cosmo Markets support. I'm here to help you. Please select a category:`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'options',
      options: faqData.main.options
    };

    setTimeout(() => {
      setMessages([welcomeMessage]);
      setCurrentStep('main');
      setChatHistory(['main']);
    }, 500);
  };

  const showStep = (stepId: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const step = faqData[stepId];
      if (step) {
        const botMessage: Message = {
          id: `step-${stepId}-${Date.now()}`,
          text: step.message,
          sender: 'bot',
          timestamp: new Date(),
          type: 'options',
          options: step.options
        };
        
        setMessages(prev => [...prev, botMessage]);
        setCurrentStep(stepId);
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleOptionClick = (option: ChatOption) => {
    // Add user's selection to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: option.label,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Handle different action types
    setTimeout(() => {
      switch (option.action) {
        case 'navigate':
          if (option.nextStep) {
            setChatHistory(prev => [...prev, option.nextStep!]);
            showStep(option.nextStep);
          }
          break;

        case 'answer':
          if (option.nextStep && answers[option.nextStep]) {
            showAnswer(answers[option.nextStep], option.nextStep);
          }
          break;

        case 'back':
          goBack();
          break;

        case 'redirect':
          if (option.nextStep) {
            history.push(option.nextStep);
            setIsOpen(false);
            message.success('Redirecting to support tickets...');
          }
          break;
      }
    }, 500);
  };

  const showAnswer = (answerText: string, stepId: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const botMessage: Message = {
        id: `answer-${stepId}-${Date.now()}`,
        text: answerText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: [
          { id: 'back', label: '⬅️ Back', action: 'back', nextStep: 'back' },
          { id: 'main', label: '🏠 Main Menu', action: 'navigate', nextStep: 'main' },
          { id: 'ticket', label: '🎫 Create Support Ticket', action: 'redirect', nextStep: '/admin/helpDeskUser' }
        ]
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const goBack = () => {
    const newHistory = [...chatHistory];
    newHistory.pop(); // Remove current step
    const previousStep = newHistory[newHistory.length - 1] || 'main';
    
    setChatHistory(newHistory);
    showStep(previousStep);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      if (messages.length === 0) {
        initializeChat();
      }
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep('main');
    setChatHistory(['main']);
    initializeChat();
  };

  // Don't render if no user
  if (!initialState?.currentUser && !userId) {
    return null;
  }

  return (
    <div className="chat-bot-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <h3> Cosmo Markets Support</h3>
              <span className="online-status online">● FAQ Assistant</span>
            </div>
            <div className="header-actions">
              <button onClick={toggleChat} className="close-chat" type="button">
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <div className="message-content">
                  {msg.text}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                
                {/* Options */}
                {msg.type === 'options' && msg.options && (
                  <div className="chat-options">
                    {msg.options.map((option) => (
                      <button
                        key={option.id}
                        className="chat-option-button"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="message bot-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Chat Icon */}
      <div className="chat-bot-icon" onClick={toggleChat}>
        {unreadCount > 0 && (
          <div className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</div>
        )}
        
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97c1.31.61 2.75.97 4.29.97 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.54 0-2.98-.36-4.29-.97L3 20l.97-4.71C3.36 14.98 3 13.54 3 12c0-4.96 4.04-9 9-9s9 4.04 9 9-4.04 9-9 9z"/>
            <path d="M8.5 12.5h7M8.5 9.5h7M8.5 15.5h5"/>
          </svg>
        )}
      </div>
    </div>
  );
};

export default ChatBot;