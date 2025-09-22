import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import aiService from '../services/aiService';

const ChatInterface = ({ currentUser, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diamondmakers'); // diamondmakers, omat, tavoitteet
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with personalized welcome message
  useEffect(() => {
    const getPersonalizedWelcome = () => {
      const userName = currentUser?.firstName || 'Käyttäjä';
      const userRole = currentUser?.role || 'tiimin jäsen';
      
      // Personalized greetings based on user
      const personalizations = {
        'tommi': 'CEO ja visionääri! Kurkipotku.com strateginen johtaminen odottaa. 🎯',
        'pete': 'Lead Developer! Mikropalveluarkkitehtuuri ja Claude integration hallinnassa. ⚙️',
        'janne': 'Design-guru! Kurkipotku.com UX/UI kehitys aktiivisena prioriteettina. 🎨',
        'mikko': 'Talousstrategisti! €1M tavoitteen saavuttaminen numeroiden avulla. 📊',
        'juhani': 'Myyntimestari! Asiakashankinta ja customer success fokuksessa. 🤝'
      };
      
      const roleSpecificGreeting = personalizations[userName.toLowerCase()] || 
        `${userRole} Diamond Makers -tiimissä! 💎`;

      return `Moikka ${userName}! 👋

Tervetuloa DiamondManageriin - ${roleSpecificGreeting}

**Kurkipotku.com on prioriteetti #1** 🏆
Janne kehittää aktiivisesti UX/UI:ta jalkapallo-alustalle.

**Mitä osaan sinulle:**
• 🎯 Priorisoi tehtäviä Kurkipotku.com menestyksen mukaan
• 🌟 Kerro tiimin superpowers ("Missä Janne on hyvä?")
• 📊 Auttaa €1M tavoitteen saavuttamisessa SaaS-ratkaisuilla
• ⚡ Hyödyntää 5-mikropalvelu arkkitehtuuriamme tehokkaasti
• 🤖 Claude Code workflow optimointi

**Testaa superpowers:**
• "Missä sinä olet hyvä?"
• "Missä Tommi on hyvä?"
• "Kuka voisi auttaa UX-suunnittelussa?"

Olen Claude-pohjainen AI joka tuntee Diamond Makers -ekosysteemin syvällisesti. Kerro mitä mietit! ✨`;
    };

    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: getPersonalizedWelcome(),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // TODO: Implement AI response
      const aiResponse = await getAIResponse(inputText, activeTab, currentUser);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Anteeksi, kohtasin teknisen ongelman. Yritä hetken kuluttua uudelleen.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (input, context, user) => {
    try {
      console.log('🤖 Calling Claude API with context:', context);
      
      // Use real Claude API
      const response = await aiService.sendMessageToClaude(
        input,
        user?.id || 'demo-user',
        context, // activeTab
        [] // conversationHistory - could be enhanced later
      );
      
      return response.content;
      
    } catch (error) {
      console.error('❌ AI service error:', error);
      return `Anteeksi, kohtasin teknisen ongelman Claude API:n kanssa. 🔧\n\nVirhe: ${error.message}\n\nTarkista verkkoyhteytesi ja yritä hetken päästä uudelleen.`;
    }
  };

  const tabs = [
    { id: 'diamondmakers', label: 'DiamondMakers tehtävät', icon: '💎' },
    { id: 'omat', label: 'Omat tehtävät', icon: '👤' },
    { id: 'tavoitteet', label: 'Tavoitteet', icon: '🎯' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Logo and User Info */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 diamond-shape bg-gradient-to-br from-blue-400 to-purple-600" />
              <div>
                <h1 className="text-lg font-bold text-white">DiamondManager AI</h1>
                <p className="text-sm text-white/60">Claude-powered team assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Tab Navigation - Compact */}
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500/30 text-blue-200'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {tab.icon} {tab.label.split(' ')[0]}
                  </button>
                ))}
              </div>
              
              <div className="text-white/70 text-sm">
                {currentUser?.firstName}
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1 text-sm text-white/60 hover:text-white/90 transition-colors"
              >
                Kirjaudu ulos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex space-x-4"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.type === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {currentUser?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                )}
              </div>
              
              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {message.type === 'user' ? currentUser?.firstName : 'DiamondCoach AI'}
                  </span>
                  <span className="text-xs text-white/40">
                    {message.timestamp.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex space-x-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-1">DiamondCoach AI</div>
                <div className="flex items-center space-x-2 text-white/60">
                  <div className="animate-pulse">Ajattelen...</div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Form - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Kerro mitä mietit tai kysy neuvoa... (Esim: 'Missä Janne on hyvä?')"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 pr-16"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/30 text-xs">
                {activeTab === 'diamondmakers' ? '💎' : activeTab === 'omat' ? '👤' : '🎯'}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>Lähetä</span>
              <span>✨</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;