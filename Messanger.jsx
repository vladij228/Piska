import React, { useState, useEffect, useRef } from 'react';
import './TelegramMessenger.css';

const TelegramMessenger = () => {
  // Состояния для мессенджера
  const [chats, setChats] = useState([
    { id: 1, name: 'Анна Петрова', lastMessage: 'Привет! Как дела?', time: '10:30', unread: 2, avatar: 'A', online: true },
    { id: 2, name: 'Иван Сидоров', lastMessage: 'Жду тебя завтра', time: '09:15', unread: 0, avatar: 'И', online: false },
    { id: 3, name: 'Мария Иванова', lastMessage: 'Отправила документы', time: 'Вчера', unread: 0, avatar: 'М', online: true },
    { id: 4, name: 'Рабочая группа', lastMessage: 'Сергей: Готово к встрече', time: 'Пн', unread: 5, avatar: 'Р', online: false },
    { id: 5, name: 'Техподдержка', lastMessage: 'Ваша заявка рассмотрена', time: '12/05', unread: 0, avatar: 'Т', online: false },
    { id: 6, name: 'Банк', lastMessage: 'Ваши финансы под защитой', time: 'только что', unread: 0, avatar: '₿', online: true, isBank: true },
  ]);

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  // Состояния для банковского приложения
  const [bankBalance, setBankBalance] = useState(15470.50);
  const [messengerBalance, setMessengerBalance] = useState(500.00);
  const [savings, setSavings] = useState([
    { id: 1, name: 'Накопительный счет', amount: 5000, percent: 4.5, endDate: '2024-12-31' },
    { id: 2, name: 'Инвестиционный вклад', amount: 8000, percent: 6.2, endDate: '2024-10-15' }
  ]);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'transfer', amount: -500, description: 'Перевод Анне Петровой', date: '2023-10-20' },
    { id: 2, type: 'deposit', amount: 1000, description: 'Пополнение с карты', date: '2023-10-18' },
    { id: 3, type: 'withdraw', amount: -200, description: 'Снятие наличных', date: '2023-10-15' },
    { id: 4, type: 'interest', amount: 45.30, description: 'Начисление процентов', date: '2023-10-05' }
  ]);
  const [showBankScreen, setShowBankScreen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);

  // Загрузка сообщений для чата
  useEffect(() => {
    if (activeChat) {
      if (!messages[activeChat.id]) {
        let chatMessages = [];
        
        if (activeChat.isBank) {
          // Сообщения для банковского чата
          chatMessages = [
            { id: 1, text: 'Добро пожаловать в банковский сервис!', time: '10:25', isMy: false },
            { id: 2, text: 'Здесь вы можете управлять своими финансами, переводить деньги и открывать вклады.', time: '10:25', isMy: false },
            { id: 3, text: 'Для начала работы нажмите кнопку "Открыть банк" ниже.', time: '10:26', isMy: false },
          ];
        } else {
          // Обычные сообщения для других чатов
          chatMessages = [
            { id: 1, text: 'Привет! Как дела?', time: '10:28', isMy: false },
            { id: 2, text: 'Привет! Все отлично, спасибо!', time: '10:29', isMy: true },
            { id: 3, text: 'Что планируешь на выходные?', time: '10:29', isMy: false },
            { id: 4, text: 'Еще не решил. Может, куда-то сходим?', time: '10:30', isMy: true },
          ];
        }
        
        setMessages(prev => ({ ...prev, [activeChat.id]: chatMessages }));
      }
    }
  }, [activeChat, messages]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMy: true
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));

    // Обновляем последнее сообщение в списке чатов
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id 
        ? { ...chat, lastMessage: inputMessage, time: 'только что', unread: 0 }
        : chat
    ));

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Банковские функции
  const handleTransferToBank = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || amount > messengerBalance) return;

    setBankBalance(prev => prev + amount);
    setMessengerBalance(prev => prev - amount);
    
    // Добавляем транзакцию
    setTransactions(prev => [{
      id: Date.now(),
      type: 'transfer',
      amount: amount,
      description: 'Пополнение из мессенджера',
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);
    
    setTransferAmount('');
    
    // Добавляем сообщение в чат
    const newMessage = {
      id: Date.now(),
      text: `Перевел ${amount} ₽ в банк`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMy: true
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));
  };

  const handleTransferToMessenger = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || amount > bankBalance) return;

    setBankBalance(prev => prev - amount);
    setMessengerBalance(prev => prev + amount);
    
    // Добавляем транзакцию
    setTransactions(prev => [{
      id: Date.now(),
      type: 'transfer',
      amount: -amount,
      description: 'Перевод в мессенджер',
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);
    
    setTransferAmount('');
    
    // Добавляем сообщение в чат
    const newMessage = {
      id: Date.now(),
      text: `Вывел ${amount} ₽ в мессенджер`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMy: true
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));
  };

  const handleOpenDeposit = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || amount > bankBalance) return;

    const newDeposit = {
      id: Date.now(),
      name: 'Новый вклад',
      amount: amount,
      percent: 5.5,
      endDate: '2024-12-31'
    };

    setSavings(prev => [...prev, newDeposit]);
    setBankBalance(prev => prev - amount);
    
    // Добавляем транзакцию
    setTransactions(prev => [{
      id: Date.now(),
      type: 'deposit',
      amount: -amount,
      description: 'Открытие вклада',
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);
    
    setTransferAmount('');
    
    // Добавляем сообщение в чат
    const newMessage = {
      id: Date.now(),
      text: `Открыл вклад на ${amount} ₽ под 5.5% годовых`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMy: true
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));
  };

  const handleSendMoneyToContact = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || amount > messengerBalance || !selectedContact) return;

    setMessengerBalance(prev => prev - amount);
    
    // Добавляем транзакцию
    setTransactions(prev => [{
      id: Date.now(),
      type: 'transfer',
      amount: -amount,
      description: `Перевод ${selectedContact.name}`,
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);
    
    setTransferAmount('');
    setSelectedContact(null);
    
    // Добавляем сообщение в чат
    const newMessage = {
      id: Date.now(),
      text: `Перевел ${amount} ₽ ${selectedContact.name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMy: true
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));
  };

  const renderBankScreen = () => {
    return (
      <div className="bank-screen">
        <div className="bank-header">
          <button className="back-button" onClick={() => setShowBankScreen(false)}>
            ←
          </button>
          <h2>Банковские услуги</h2>
        </div>

        <div className="bank-content">
          <div className="balance-cards">
            <div className="balance-card">
              <h3>Баланс в мессенджере</h3>
              <div className="amount">{messengerBalance.toFixed(2)} ₽</div>
            </div>
            <div className="balance-card">
              <h3>Банковский счет</h3>
              <div className="amount">{bankBalance.toFixed(2)} ₽</div>
            </div>
          </div>

          <div className="transfer-section">
            <h3>Перевод средств</h3>
            <div className="transfer-options">
              <input
                type="number"
                placeholder="Сумма"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="transfer-input"
              />
              <div className="transfer-buttons">
                <button onClick={handleTransferToBank}>В банк</button>
                <button onClick={handleTransferToMessenger}>В мессенджер</button>
                <button onClick={handleOpenDeposit}>Открыть вклад</button>
              </div>
            </div>

            <div className="contact-transfer">
              <h4>Перевод контакту</h4>
              <select 
                onChange={(e) => setSelectedContact(chats.find(c => c.id === parseInt(e.target.value)))}
                className="contact-select"
              >
                <option value="">Выберите контакт</option>
                {chats.filter(chat => !chat.isBank).map(chat => (
                  <option key={chat.id} value={chat.id}>{chat.name}</option>
                ))}
              </select>
              <button 
                onClick={handleSendMoneyToContact}
                disabled={!selectedContact || !transferAmount}
              >
                Перевести
              </button>
            </div>
          </div>

          <div className="savings-section">
            <h3>Мои вклады</h3>
            {savings.length === 0 ? (
              <p>У вас пока нет открытых вкладов</p>
            ) : (
              <div className="savings-list">
                {savings.map(saving => (
                  <div key={saving.id} className="saving-item">
                    <div className="saving-info">
                      <h4>{saving.name}</h4>
                      <p>{saving.amount.toFixed(2)} ₽ под {saving.percent}% годовых</p>
                    </div>
                    <div className="saving-date">
                      До {saving.endDate}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="transactions-section">
            <h3>История операций</h3>
            <div className="transactions-list">
              {transactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <h4>{transaction.description}</h4>
                    <p>{transaction.date}</p>
                  </div>
                  <div className={`transaction-amount ${transaction.amount > 0 ? 'income' : 'expense'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} ₽
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="telegram-messenger">
      <div className="sidebar" style={{ display: showSidebar ? 'flex' : 'none' }}>
        <div className="sidebar-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="chats-list">
          {filteredChats.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveChat(chat);
                if (chat.isBank) {
                  setShowBankScreen(true);
                }
              }}
            >
              <div className="avatar">{chat.avatar}</div>
              <div className="chat-info">
                <div className="chat-name">{chat.name}</div>
                <div className="last-message">{chat.lastMessage}</div>
              </div>
              <div className="chat-meta">
                <div className="time">{chat.time}</div>
                {chat.unread > 0 && <div className="unread-count">{chat.unread}</div>}
              </div>
            </div>
          ))}
        </div>
        <div className="user-balance">
          Баланс: {messengerBalance.toFixed(2)} ₽
        </div>
      </div>

      <div className="chat-container">
        {showBankScreen ? (
          renderBankScreen()
        ) : activeChat ? (
          <>
            <div className="chat-header">
              <button 
                className="back-button"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                ☰
              </button>
              <div className="avatar">{activeChat.avatar}</div>
              <div className="chat-info">
                <div className="chat-name">{activeChat.name}</div>
                <div className="chat-status">
                  {activeChat.online ? 'online' : 'был(а) недавно'}
                </div>
              </div>
              <div className="header-actions">
                <button className="icon-button">🔍</button>
                <button className="icon-button">⋮</button>
              </div>
            </div>

            <div className="messages-container">
              {messages[activeChat.id]?.map(message => (
                <div key={message.id} className={`message ${message.isMy ? 'my-message' : 'their-message'}`}>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{message.time}</div>
                  </div>
                </div>
              ))}
              {activeChat.isBank && (
                <div className="bank-buttons">
                  <button onClick={() => setShowBankScreen(true)} className="bank-button">
                    Открыть банк
                  </button>
                  <button className="bank-button">
                    Мой баланс
                  </button>
                  <button className="bank-button">
                    История операций
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <div className="input-actions">
                <button className="icon-button">📎</button>
                <button className="icon-button">😊</button>
              </div>
              <textarea
                className="message-input"
                placeholder="Сообщение"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
              />
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                {inputMessage.trim() ? '➤' : '🎤'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <h2>Выберите чат чтобы начать общение</h2>
              <p>Мессенджер с банковскими функциями</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramMessenger;
