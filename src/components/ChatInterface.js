import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import aiService from '../services/aiService';

const ChatInterface = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diamondmakers'); // diamondmakers, omat, tavoitteet
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Moikka ${currentUser?.firstName}! 👋

Tervetuloa DiamondManageriin - Diamond Makers -tiimin tekoälyavusteiseen työkaluun! 🚀

**Mitä osaan tehdä:**
• 🎯 Analysoida tehtäviä strategisen arvon perusteella (1-10)
• 📊 Auttaa priorisoimaan työtä €1M tavoitteen saavuttamiseksi  
• ⏰ Ehdottaa optimaalisia työskentelyaikoja
• 🤝 Koordinoida tiimityötä ja yhteisiä projekteja
• 💡 Antaa konkreettisia neuvoja tuottavuuden parantamiseen

**Käytä välilehtiä:**
• 💎 **DiamondMakers tehtävät** - Yrityksen strategiset tehtävät
• 👤 **Omat tehtävät** - Henkilökohtainen produktiivuus
• 🎯 **Tavoitteet** - Seuranta ja mittarit

Olen Claude-pohjainen tekoäly joka ymmärtää Diamond Makers -kontekstin. Kerro mitä mietit tai kysy neuvoa - annan konkreettisia, toimenpiteisiin johtavia ehdotuksia! ✨`,
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
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500/20 text-blue-100 border border-blue-400/30'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 text-white border border-white/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">🤖</div>
                <span>Ajattelen...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Kirjoita tähän kysymyksesi, koodia tai tehtäviä..."
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400/50 focus:bg-white/15"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          Lähetä
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;