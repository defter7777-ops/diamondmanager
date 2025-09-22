import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import aiService from '../services/aiService';
import profileService from '../services/profileService';
import taskService from '../services/taskService';

const ChatInterface = ({ currentUser, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diamondmakers'); // diamondmakers, omat, tavoitteet
  const [activeTasks, setActiveTasks] = useState([]);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [needsSuperpowerOnboarding, setNeedsSuperpowerOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('welcome'); // welcome, superpowers, details, complete
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load active tasks
  useEffect(() => {
    const loadActiveTasks = () => {
      try {
        const userId = currentUser?.id || currentUser?.firstName?.toLowerCase() || 'user';
        const tasks = taskService.getUserTasks(userId, true);
        setActiveTasks(tasks.filter(task => task.status === 'active' || task.status === 'pending'));
      } catch (error) {
        console.error('Failed to load active tasks:', error);
      }
    };
    
    loadActiveTasks();
  }, [currentUser]);

  // Check for superpower onboarding and initialize welcome message
  useEffect(() => {
    const userId = currentUser?.id || currentUser?.firstName?.toLowerCase() || 'user';
    const hasSuperpowers = profileService.hasSuperpowerProfile(userId);
    
    if (!hasSuperpowers) {
      setNeedsSuperpowerOnboarding(true);
      setOnboardingStep('welcome');
      
      const questions = profileService.getSuperpowerQuestions();
      const onboardingMessage = {
        id: Date.now(),
        type: 'ai',
        content: questions.welcome,
        timestamp: new Date(),
        messageType: 'superpower-onboarding',
        actions: [
          {
            emoji: '🚀',
            label: 'Aloitetaan!',
            action: 'start-superpower-onboarding',
            data: {}
          },
          {
            emoji: '⏭️', 
            label: 'Ohita toistaiseksi',
            action: 'skip-onboarding',
            data: {}
          }
        ]
      };
      setMessages([onboardingMessage]);
      return;
    }

    // Regular welcome for users with superpowers
    const getPersonalizedWelcome = () => {
      const userName = currentUser?.firstName || 'Käyttäjä';
      const userProfile = profileService.getUserProfile(userId);
      const userSuperpowers = userProfile?.superpowers?.slice(0, 3).join(', ') || 'monipuolinen osaaminen';
      
      return `Moikka ${userName}! 👋

Tervetuloa takaisin DiamondManageriin! 💎

**Sinun superpowerisi:** 🌟  
${userSuperpowers}

**Tavoitteemme:** €1,000,000 vuositulot 🎯
Keskitymme SaaS-ratkaisujen kehittämiseen ja kaupallistamiseen.

**Mitä osaan sinulle:**
• 🎯 Ehdottaa tehtäviä jotka sopivat sinun osaamisellesi
• 🤝 Yhdistää sinut sopivien tiimin jäsenten kanssa  
• 📊 Seurata tavoitteiden edistymistä
• 🚀 Optimoida tiimin kollektiivista työskentelyä

**Kokeile:**
• "Näytä tehtävät"
• "Luo tehtävä: [kuvaus]"
• "Anna tehtävä [nimi]: [kuvaus]"
• "Mitkä ovat tavoitteemme?"

Kerro mitä mietit! ✨`;
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
        content: typeof aiResponse === 'object' ? aiResponse.content : aiResponse,
        timestamp: new Date(),
        messageType: typeof aiResponse === 'object' ? aiResponse.type : 'text',
        actions: typeof aiResponse === 'object' ? aiResponse.actions : [],
        detectedTasks: typeof aiResponse === 'object' ? aiResponse.detectedTasks : null
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

  // Handle task-related commands
  const handleTaskCommand = async (input, context, user) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('näytä tehtävät') || lowerInput.includes('tehtävät') || lowerInput.includes('tasks')) {
      const taskList = activeTasks.length > 0 ? activeTasks.map((task, index) => {
        const completionRate = task.status === 'completed' ? 100 : 
                              task.status === 'active' ? 60 : 20;
        const statusEmoji = task.status === 'active' ? '🔄' : 
                           task.status === 'pending' ? '⏳' : '✅';
        const priorityEmoji = task.priority === 'high' ? '🔴' : 
                             task.priority === 'medium' ? '🟡' : '🟢';
        
        return `**${index + 1}. ${task.title}** ${statusEmoji}\n` +
               `   📊 Edistyminen: ${completionRate}% | ${priorityEmoji} ${task.priority.toUpperCase()}\n` +
               `   📝 ${task.description}\n`;
      }).join('\n') : 'Ei aktiivisia tehtäviä tällä hetkellä! 🎉';
      
      return {
        type: 'task-list',
        content: `📋 **Aktiiviset tehtävät (${activeTasks.length} kpl):**\n\n${taskList}\n\n💡 **Voit:**\n• Luoda uuden tehtävän: "Luo tehtävä: [kuvaus]"\n• Muokata tehtävää: "Muokkaa tehtävää 1: [uusi kuvaus]"\n• Merkitä tehtävän valmiiksi: "Merkitse tehtävä 1 valmiiksi"\n• Delegoida tehtävän: "Anna tehtävä [nimi]: [kuvaus]"`,
        actions: [
          {
            emoji: '➕',
            label: 'Luo uusi tehtävä',
            action: 'create-task-prompt',
            data: {}
          },
          {
            emoji: '📊',
            label: 'Näytä tilastot',
            action: 'show-task-stats',
            data: {}
          }
        ]
      };
    }
    
    return `🤖 Tunnistin tehtäväkyselyn, mutta en ymmärtänyt tarkalleen mitä halusit. Kokeile:\n• "Näytä tehtävät"\n• "Luo tehtävä: [kuvaus]"\n• "Anna tehtävä Jannelle: [kuvaus]"`;
  };

  // Handle action button clicks
  const handleActionClick = async (action, message) => {
    console.log('🔄 Action clicked:', action);
    
    switch (action.action) {
      case 'start-superpower-onboarding':
        setOnboardingStep('superpowers');
        const questions = profileService.getSuperpowerQuestions();
        const exampleMessage = {
          id: Date.now(),
          type: 'ai',
          content: `${questions.examples.join('\n\n')}\n\n**Kerro nyt sinun superpowerisi:**`,
          timestamp: new Date(),
          messageType: 'superpower-examples'
        };
        setMessages(prev => [...prev, exampleMessage]);
        break;
        
      case 'skip-onboarding':
        setNeedsSuperpowerOnboarding(false);
        const skipMessage = {
          id: Date.now(),
          type: 'ai',
          content: `👍 **Selvä!** Voit määrittää superpowerisi myöhemmin sanomalla:\n\n• "Päivitä superpowerini"\n• "Kerron superpowereistani"\n\nOlen silti täällä auttamassa! Mitä mietit tänään? ✨`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, skipMessage]);
        break;
        
      case 'create-task-prompt':
        setInputText('Luo tehtävä: ');
        break;
        
      case 'show-task-stats':
        const statsMessage = `📊 **Tehtävätilastot:**\n\n` +
          `• Aktiivisia tehtäviä: ${activeTasks.filter(t => t.status === 'active').length}\n` +
          `• Odottavia tehtäviä: ${activeTasks.filter(t => t.status === 'pending').length}\n` +
          `• Korkean prioriteetin: ${activeTasks.filter(t => t.priority === 'high').length}\n` +
          `• Keskimääräinen edistyminen: ${Math.round(activeTasks.reduce((acc, t) => acc + (t.status === 'active' ? 60 : t.status === 'pending' ? 20 : 100), 0) / activeTasks.length || 0)}%\n\n` +
          `💡 Tiimi tekee hyvää työtä! Jatka samaan malliin! 🚀`;
        
        const statsAiMessage = {
          id: Date.now(),
          type: 'ai',
          content: statsMessage,
          timestamp: new Date(),
          messageType: 'task-stats'
        };
        setMessages(prev => [...prev, statsAiMessage]);
        break;
        
      case 'create-tasks':
        if (action.data.tasks) {
          // Add detected tasks to active tasks
          const newTasks = action.data.tasks.map((task, index) => ({
            ...task,
            id: Date.now() + index,
            status: 'pending'
          }));
          setActiveTasks(prev => [...prev, ...newTasks]);
          
          const confirmMessage = {
            id: Date.now(),
            type: 'ai', 
            content: `✅ **Tehtävät luotu!**\n\nLisäsin ${newTasks.length} tehtävää listallesi:\n\n${newTasks.map((t, i) => `${i + 1}. ${t.title} (${t.strategicValue}/10 ⭐)`).join('\n')}\n\nVoit nyt muokata, priorisoida tai delegoida näitä tehtäviä keskustelemalla kanssani! 🚀`,
            timestamp: new Date(),
            messageType: 'task-created'
          };
          setMessages(prev => [...prev, confirmMessage]);
        }
        break;
        
      case 'continue-conversation':
        // Just continue with the original message
        const continueMessage = action.data.originalMessage;
        setInputText(continueMessage);
        break;
        
      default:
        console.log('Unknown action:', action.action);
    }
  };

  const getAIResponse = async (input, context, user) => {
    try {
      console.log('🤖 Calling Claude API with context:', context);
      
      const userId = user?.id || user?.firstName?.toLowerCase() || 'user';
      const lowerInput = input.toLowerCase();
      
      // Handle superpower onboarding
      if (needsSuperpowerOnboarding && onboardingStep === 'superpowers') {
        const superpowers = profileService.parseSuperpowersFromMessage(input);
        
        if (superpowers.length > 0) {
          // Save superpowers
          const profile = {
            name: user?.firstName || 'User',
            firstName: user?.firstName,
            superpowers: superpowers,
            onboardingCompleted: new Date().toISOString()
          };
          
          profileService.saveUserProfile(userId, profile);
          setNeedsSuperpowerOnboarding(false);
          setOnboardingStep('complete');
          
          const questions = profileService.getSuperpowerQuestions();
          const completionMessage = {
            type: 'superpower-completion',
            content: `🎉 **Loistavaa!** Tallensin superpowerisi:\n\n${superpowers.map(s => `• ${s}`).join('\n')}\n\n${questions.completion}`,
            actions: [
              {
                emoji: '🚀',
                label: 'Näytä tehtävät',
                action: 'show-tasks-after-onboarding',
                data: {}
              }
            ]
          };
          
          return completionMessage;
        } else {
          return `🤔 En tunnistanut superpowereja viestistäsi. Kokeile kertoa selkeämmin:\n\n**Esimerkki:**\n"Olen hyvä ohjelmoinnissa, tietokantojen suunnittelussa ja API-integraatioissa"\n\n**Tai:**\n"Osaan myyntiä, asiakaspalvelua ja neuvottelua"`;
        }
      }
      
      // Check for superpower updates
      if (lowerInput.includes('päivitä superpower') || lowerInput.includes('kerron superpower')) {
        setNeedsSuperpowerOnboarding(true);
        setOnboardingStep('superpowers');
        return `🌟 **Päivitetään superpowerisi!**\n\nKerro uudet tai päivitetyt taidot ja vahvuudet:\n\n**Esimerkki:**\n"Olen hyvä projektinhallinnassa, tiimin johtamisessa ja strategisessa suunnittelussa"`;
      }
      
      // Check for task-related commands
      const taskCommands = ['näytä tehtävät', 'show tasks', 'tehtävät', 'tasks', 'mitä tehtäviä', 'aktiiviset tehtävät'];
      
      if (taskCommands.some(cmd => lowerInput.includes(cmd))) {
        return await handleTaskCommand(input, context, user);
      }
      
      // Use real Claude API
      const response = await aiService.sendMessageToClaude(
        input,
        user?.id || 'demo-user',
        context, // activeTab
        messages.filter(m => m.type === 'user' || m.type === 'ai').slice(-10) // Last 10 messages for context
      );
      
      // Handle different response types
      if (response.type === 'task-confirmation') {
        return {
          type: 'task-confirmation',
          content: response.content,
          actions: response.actions,
          detectedTasks: response.detectedTasks
        };
      }
      
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
              
              {/* Active Tasks Toggle */}
              <button
                onClick={() => setShowTaskPanel(!showTaskPanel)}
                className="px-3 py-1 text-sm rounded-md transition-all flex items-center space-x-1 hover:bg-white/5"
                title="Näytä aktiiviset tehtävät"
              >
                <span>📋</span>
                <span className="text-white/70">{activeTasks.length}</span>
                {showTaskPanel && <span className="text-white/50">▲</span>}
                {!showTaskPanel && <span className="text-white/50">▼</span>}
              </button>
              
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

      {/* Active Tasks Panel - Collapsible */}
      {showTaskPanel && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex-shrink-0 border-b border-white/10 bg-black/10"
        >
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <span>📋</span>
              <span>Aktiiviset tehtävät ({activeTasks.length})</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeTasks.map((task) => {
                const completionRate = task.status === 'completed' ? 100 : 
                                      task.status === 'active' ? 60 : 20;
                const priorityColor = task.priority === 'high' ? 'text-red-400' : 
                                    task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400';
                
                return (
                  <div key={task.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white line-clamp-2">{task.title}</h4>
                      <span className={`text-xs ${priorityColor} uppercase font-bold`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <p className="text-xs text-white/60 mb-3 line-clamp-2">{task.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/50">Eteneminen</span>
                        <span className="text-xs text-white/70">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'active' ? 'bg-blue-500/20 text-blue-300' : 
                        task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {task.status === 'active' ? 'Aktiivinen' : 
                         task.status === 'pending' ? 'Odottaa' : 'Valmis'}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {activeTasks.length === 0 && (
                <div className="col-span-full text-center py-8 text-white/40">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p>Ei aktiivisia tehtäviä tällä hetkellä!</p>
                  <p className="text-sm mt-1">Voit luoda uusia tehtäviä keskustelemalla AI:n kanssa.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

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
                  {message.messageType && message.messageType !== 'text' && (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      {message.messageType === 'task-list' ? '📋 Tehtävät' : 
                       message.messageType === 'task-confirmation' ? '🤖 Vahvistus' : 
                       message.messageType}
                    </span>
                  )}
                </div>
                <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
                
                {/* Action Buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleActionClick(action, message)}
                        className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded-md transition-colors flex items-center space-x-1"
                      >
                        <span>{action.emoji}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
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
      <div className="flex-shrink-0 border-t border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Kerro mitä mietit tai kysy neuvoa... (Esim: 'Missä Janne on hyvä?')"
                className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600/50 rounded-lg text-white placeholder-slate-300/70 focus:outline-none focus:border-blue-400/70 focus:bg-slate-700/90 pr-16 resize-none overflow-hidden transition-all duration-200"
                disabled={isLoading}
                rows={inputText.split('\n').length || 1}
                style={{
                  minHeight: '48px',
                  maxHeight: '200px',
                  height: Math.max(48, Math.min(200, inputText.split('\n').length * 24 + 24))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute right-3 top-3 text-slate-400 text-xs">
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