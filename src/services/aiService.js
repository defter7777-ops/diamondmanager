/**
 * AI Service for DiamondManager - Claude Integration
 * Provides intelligent task analysis, goal alignment, and personal productivity optimization
 */

import { getTeamMemberProfile, getTeamSuperpowers } from '../data/teamProfiles';
import profileService from './profileService';

class AIService {
  constructor() {
    // Use backend proxy instead of direct API calls
    this.baseUrl = process.env.REACT_APP_DIAMONDMANAGER_BACKEND_URL || 'https://diamondmanager-backend-production.up.railway.app';
    this.model = 'claude-3-5-sonnet-20241022';
  }

  /**
   * Build comprehensive context for Claude based on user and company data
   */
  async buildClaudeContext(userId, activeTab = 'diamondmakers') {
    try {
      const userProfile = await this.getUserProfile(userId);
      const currentTasks = await this.getUserTasks(userId);
      const companyGoals = await this.getCompanyGoals();
      const teamContext = await this.getTeamContext();

      const contextByTab = {
        diamondmakers: `
          Olet DiamondCoach AI, Diamond Makers -yrityksen tekoälyavustaja. Puhut suomea ja tunnet yrityksen teknisen tilanteen syvällisesti.
          
          DIAMOND MAKERS YRITYKSEN KONTEKSTI:
          - PÄÄTAVOITE: €1,000,000 vuositulot SaaS-ratkaisujen kautta
          - Tiimi: Tommi (CTO), Pete (Lead Dev), Janne (Design), Mikko (Finance), Juhani (Sales)
          - TEKNINEN ARKKITEHTUURI: 5 mikropalvelua + Railway Cloud
          - ✅ SAAVUTUKSIA: Multi-app authentication, complete data isolation
          - KEHITYSTYÖKALU: Claude Code AI-avusteinen workflow
          
          🎯 STRATEGISET PROJEKTIT:
          1. **KURKIPOTKU.COM** - Jalkapallo-alusta (production)
             • SaaS-tuote kehityksessä
             • Kaupallistamispotentiaali: Korkea
             • Status: Aktiivinen kehitys
          
          2. **DIAMONDMANAGER** - AI-pohjainen tiimityökalu
             • MERKITTÄVÄ kaupallistamispotentiaali
             • Claude integration proof-of-concept
             • Status: Käytössä sisäisesti
          
          3. **DiamondShift** - Performance platform (Farmastic Oy)
             • Asiakasprojekti tuotannossa
             • Revenue stream: Aktiivinen
          
          4. **Banz.Ai** - Live-soccer sovellukset
             • Suunnitteluvaihe
             • Potentiaalinen skaalautuvuus: Korkea
          
          TEKNINEN TILANNE (Sept 2025):
          • MongoDB Atlas: App-scoped collections (users, users_diamondshift, users_diamondmanager)
          • Authentication: Multi-tenant JWT tokens, complete data isolation
          • Development: WSL2 + Windows, curl.exe testing, Railway auto-deploy
          • AI Workflow: TASK.md system + Claude Code assistant
          
          TEHTÄVÄSI:
          1. **TAVOITTEIDEN SAAVUTTAMINEN** - Priorisoi tehtäviä €1M tavoitteen mukaisesti
          2. **AI-AVUSTEISTEN TYÖMENETELMIEN KEHITYS** - Ehdota tehokkaita AI-pohjaisia työkaluja ja prosesseja
          3. Analysoi ja ehdota parhaita strategioita SaaS-tulojen kasvattamiseksi
          4. Tue tiimin jäseniä heidän vahvuuksiensa mukaisissa tehtävissä
          5. Optimoi projektien välisiä resursseja ja työnjakoa
          6. Seuraa ja raportoi edistymistä strategisten tavoitteiden osalta
        `,
        
        omat: `
          Olet DiamondCoach AI, henkilökohtainen produktiivuusavustajasi Diamond Makersissa.
          
          HENKILÖKOHTAINEN KONTEKSTI (Omat tehtävät):
          - Nimi: ${userProfile.firstName || 'Käyttäjä'}
          - Rooli: ${userProfile.role || 'Tiimin jäsen'}
          - Työskentelytapa: Keskittynyt työskentely aamupäivällä, yhteistyö iltapäivällä
          - Aktiiviset henkilökohtaiset tehtävät: ${currentTasks.length} kpl
          
          TEHTÄVÄSI:
          1. Optimoi henkilökohtaista työskentelyä ja aikataulua
          2. Priorisoi tehtäviä strategisen arvon perusteella (1-10)
          3. Ehdota optimaalisia työskentelyaikoja
          4. Seuraa henkilökohtaista edistymistä
          5. Anna kannustavaa palautetta saavutuksista
        `,
        
        tavoitteet: `
          Olet DiamondCoach AI, tavoitejohtamisen asiantuntija Diamond Makersissa.
          
          TAVOITTEIDEN KONTEKSTI:
          - Yrityksen päätavoite: €1M vuositulot
          - Henkilökohtaiset tavoitteet: ${userProfile.personalGoals?.join(', ') || 'Ei määritelty'}
          - Edistyminen: Seurataan aktiivisesti
          
          TEHTÄVÄSI:
          1. Yhdistä henkilökohtaiset tavoitteet yrityksen strategiaan
          2. Mittaa ja seuraa tavoitteiden edistymistä
          3. Tunnista esteitä ja ratkaisuja
          4. Aseta realistisia välitavoitteita
          5. Juhli saavutuksia ja motivoi jatkamaan
        `
      };

      return {
        systemPrompt: contextByTab[activeTab] + `
          
          OHJEISTUS:
          1. Vastaa aina suomeksi ja käytä emojeja havainnollistamaan
          2. Pidä vastaukset ytimekkäinä mutta hyödyllisinä (max 200 sanaa)
          3. Anna konkreettisia, toimenpiteisiin johtavia neuvoja
          4. Tue päätöksentekoa, älä tee päätöksiä puolesta
          5. Juhli saavutuksia ja kannusta jatkamaan
          6. Olet tiimin jäsen, ei vain työkalu - ole empaattinen ja kannustava
          
          SUPERPOWERS-OMINAISUUS:
          - Jos käyttäjä kysyy "Missä [nimi] on hyvä?" tai "Mitkä ovat superpowers?", kerro tiimin jäsenten superpowers
          - Jokaisella tiimin jäsenellä on dokumentoidut superpowers: Tommi, Pete, Janne, Mikko, Juhani
          - Käytä tätä tietoa suositellaksesi kuka voisi auttaa eri tehtävissä
          
          Vastaa aina rakentavasti ja positiivisesti.
        `,
        
        userContext: {
          currentTasks,
          workingPatterns: userProfile.workingPatterns,
          personalGoals: userProfile.personalGoals || []
        },
        
        companyContext: {
          goals: companyGoals,
          teamStatus: teamContext
        }
      };
    } catch (error) {
      console.error('Error building Claude context:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Send message to Claude with full context
   */
  async sendMessageToClaude(userMessage, userId, activeTab = 'diamondmakers', conversationHistory = []) {
    try {
      console.log('🤖 Analyzing message for superpowers inquiry...');
      
      // Check if this is a superpower inquiry first
      const superpowerResponse = await this.handleSuperpowerInquiry(userMessage, userId);
      if (superpowerResponse) {
        console.log('✅ Superpower inquiry detected, returning structured response');
        return {
          type: 'superpowers',
          content: superpowerResponse,
          timestamp: new Date(),
          actions: [
            {
              emoji: '🔍',
              label: 'Kuka muu on hyvä?',
              action: 'show-team-superpowers',
              data: {}
            }
          ]
        };
      }

      // Check if this message contains potential tasks
      console.log('🔍 Checking for potential tasks...');
      const taskDetection = await this.detectPotentialTasks(userMessage, userId, activeTab);
      if (taskDetection.hasTasks) {
        console.log('📋 Tasks detected, asking for user confirmation');
        return {
          type: 'task-confirmation',
          content: taskDetection.confirmationMessage,
          timestamp: new Date(),
          actions: taskDetection.actions,
          detectedTasks: taskDetection.tasks
        };
      }
      
      console.log('🤖 Sending message to Claude API...');
      const context = await this.buildClaudeContext(userId, activeTab);
      
      const messages = [
        {
          role: "system",
          content: context.systemPrompt
        },
        ...conversationHistory,
        {
          role: "user",
          content: userMessage
        }
      ];

      const response = await fetch(this.baseUrl + '/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          temperature: 0.7,
          messages
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Claude API error:', response.status, errorData);
        throw new Error(`Claude API error: ${response.status}`);
      }

      const claudeResponse = await response.json();
      console.log('✅ Claude response received');
      
      // Parse and enhance response with interactive elements
      return this.enhanceClaudeResponse(
        claudeResponse.content[0].text,
        context,
        userId,
        activeTab
      );

    } catch (error) {
      console.error('❌ Claude API error:', error);
      return {
        type: 'error',
        content: 'Anteeksi, kohtasin teknisen ongelman Claude API:n kanssa. 🔧\n\nTarkista verkkoyhteytesi ja yritä hetken päästä uudelleen.',
        timestamp: new Date(),
        actions: []
      };
    }
  }

  /**
   * Enhance Claude responses with interactive elements
   */
  enhanceClaudeResponse(claudeContent, context, userId, activeTab) {
    const response = {
      type: 'text',
      content: claudeContent,
      timestamp: new Date(),
      actions: []
    };

    // Add contextual actions based on Claude's response and active tab
    if (claudeContent.includes('tehtävä') || claudeContent.includes('task')) {
      response.actions.push({
        emoji: '➕',
        label: 'Luo uusi tehtävä',
        action: 'create-task',
        data: { suggestion: claudeContent, tab: activeTab }
      });
    }

    if (claudeContent.includes('aikataulu') || claudeContent.includes('schedule') || claudeContent.includes('aika')) {
      response.actions.push({
        emoji: '📅',
        label: 'Avaa kalenteri',
        action: 'open-calendar',
        data: { tab: activeTab }
      });
    }

    if (claudeContent.includes('analyysi') || claudeContent.includes('tilasto') || claudeContent.includes('mittaa')) {
      response.actions.push({
        emoji: '📊',
        label: 'Näytä tilastot',
        action: 'show-analytics',
        data: { tab: activeTab }
      });
    }

    if (claudeContent.includes('tavoite') || claudeContent.includes('goal')) {
      response.actions.push({
        emoji: '🎯',
        label: 'Aseta tavoite',
        action: 'set-goal',
        data: { suggestion: claudeContent, tab: activeTab }
      });
    }

    // Add strategic score if mentioned
    const strategicMatch = claudeContent.match(/(\d+)\/10/);
    if (strategicMatch) {
      response.strategicValue = parseInt(strategicMatch[1]);
    }

    return response;
  }

  /**
   * Get user profile (combines team profiles with personal superpowers)
   */
  async getUserProfile(userId) {
    // Get personal superpowers from profileService
    const personalProfile = profileService.getUserProfile(userId);
    
    // Try to get real team member profile
    const teamProfile = getTeamMemberProfile(userId || 'pete');
    
    if (teamProfile) {
      return {
        firstName: teamProfile.name,
        role: teamProfile.role,
        title: teamProfile.title,
        email: teamProfile.email,
        superpowers: personalProfile?.superpowers || teamProfile.superpowers,
        personalSuperpowers: personalProfile?.superpowers || [],
        teamSuperpowers: teamProfile.superpowers,
        workingPatterns: {
          peakHours: teamProfile.workingStyle.peakHours,
          preferences: teamProfile.workingStyle.preferences,
          communication: teamProfile.workingStyle.communication,
          personalStyle: personalProfile?.workingStyle
        },
        personalGoals: teamProfile.personalGoals,
        expertise: teamProfile.expertise,
        currentFocus: teamProfile.currentFocus,
        fullProfile: teamProfile, // Include complete profile for AI context
        hasPersonalSuperpowers: !!personalProfile?.superpowers
      };
    }
    
    // For non-team members or when team profile not found
    return {
      firstName: personalProfile?.firstName || personalProfile?.name || 'User',
      role: 'Team Member',
      superpowers: personalProfile?.superpowers || [],
      personalSuperpowers: personalProfile?.superpowers || [],
      workingPatterns: {
        peakHours: 'Not defined',
        preferences: personalProfile?.workingStyle || 'Not defined'
      },
      personalGoals: [],
      hasPersonalSuperpowers: !!personalProfile?.superpowers
    };
  }

  /**
   * Get user tasks (based on actual Diamond Makers development)
   */
  async getUserTasks(userId) {
    return [
      {
        id: 1,
        title: 'DiamondManager Claude API integration',
        status: 'completed',
        priority: 'high',
        description: 'Real-time AI responses with Diamond Makers context'
      },
      {
        id: 2,
        title: 'Multi-app authentication system testing',
        status: 'completed', 
        priority: 'high',
        description: 'Data isolation between DiamondShift/Kurkipotku/DiamondManager'
      },
      {
        id: 3,
        title: 'DiamondShift client project optimization',
        status: 'active',
        priority: 'high',
        description: 'Farmastic Oy performance platform development'
      },
      {
        id: 4,
        title: 'Banz.Ai architecture planning',
        status: 'pending',
        priority: 'medium',
        description: 'Live soccer apps with Kurkipotku integration'
      },
      {
        id: 5,
        title: 'Mikropalveluiden skaalaus asiakasprojekteille',
        status: 'pending',
        priority: 'medium',
        description: 'SaaS-tulojen kasvattaminen olemassa olevalla arkkitehtuurilla'
      }
    ];
  }

  /**
   * Get company goals (based on actual Diamond Makers development)
   */
  async getCompanyGoals() {
    return {
      primaryObjective: '€1,000,000 vuositulot - SaaS-pohjaisten ratkaisujen kautta',
      currentPriorities: '🏆 KURKIPOTKU.COM development (NRO 1), DiamondManager commercialization, multi-app ecosystem',
      quarterlyGoals: [
        '🏆 **KURKIPOTKU.COM** - Jalkapallo-alusta kehitys ja dokumentointi (PRIORITEETTI #1)',
        'Janne + tiimi yhteistyön optimointi Kurkipotku UX/UI:ssa',
        'Diamond Coach logiikan testaus ja kehitys Kurkipotku-projektissa',
        'DiamondManager SaaS-tuotteen kaupallistaminen',
        'Multi-app authentication system (✅ COMPLETED)',
        'DiamondShift asiakasprojekti jatkuu (Farmastic Oy)'
      ],
      technicalAchievements: [
        'Kurkipotku.com production-alusta toiminnassa',
        'Mikropalveluarkkitehtuuri (5 backend-palvelua) tukee kaikkia tuotteita',
        'Railway Cloud deployment (100% operational)',
        'Multi-tenant SaaS authentication (data isolation)',
        'AI-assisted development workflow (Claude Code)',
        'DiamondManager Claude integration (proof-of-concept SaaS-tuotteelle)'
      ],
      commercialPotential: {
        kurkipotku: 'Jalkapallo-alusta, production-valmis, Janne aktiivisesti kehittämässä UX:ää',
        diamondManager: 'AI-pohjainen tiimityökalu, merkittävä SaaS-potentiaali, Claude integration',
        technical: 'Skaalautuva mikropalveluarkkitehtuuri tukee molempia tuotteita'
      }
    };
  }

  /**
   * Get team context (based on actual Diamond Makers setup)
   */
  async getTeamContext() {
    const teamSuperpowers = getTeamSuperpowers();
    
    return {
      teamSize: 5,
      teamMembers: {
        'Tommi': 'CEO & CTO - AI-Assisted Development & Strategy',
        'Pete': 'Content Provider - Customer Relations, Testing & Business Development', 
        'Janne': 'Designer - UX/UI & User Experience',
        'Mikko': 'Finance - Business Strategy & Analytics',
        'Juhani': 'Sales - Customer Relations & Growth'
      },
      teamSuperpowers: {
        'Tommi': teamSuperpowers.tommi,
        'Pete': teamSuperpowers.pete, 
        'Janne': teamSuperpowers.janne,
        'Mikko': teamSuperpowers.mikko,
        'Juhani': teamSuperpowers.juhani
      },
      currentProjects: {
        'Kurkipotku': '🏆 PRIORITEETTI #1 - Football training platform (production), Janne actively developing UX/UI, Diamond Coach testing',
        'DiamondManager': 'AI-powered team management (Claude integration), SIGNIFICANT commercial SaaS potential',
        'DiamondShift': 'Performance optimization platform (Farmastic Oy client)',
        'Banz.Ai': 'Live soccer apps (planning phase)'
      },
      technicalStack: {
        'Backend': '5 microservices (auth, user, team, challenge, feedback)',
        'Frontend': 'React + TailwindCSS',
        'Database': 'MongoDB Atlas with app-scoped collections',
        'Deployment': 'Railway Cloud (auto-deploy from main)',
        'Development': 'WSL2 + Windows, Claude Code AI assistant',
        'Authentication': 'Multi-app JWT with complete data isolation'
      },
      developmentWorkflow: {
        'AI-Assisted': 'Claude Code for architecture, debugging, testing',
        'Task Management': 'TASK.md system with AI collaboration',
        'Documentation': 'Comprehensive guides following KISS principles',
        'Testing': 'Real data validation, curl.exe testing',
        'Deployment': 'Railway auto-deploy with monitoring'
      },
      recentAchievements: [
        'Multi-app authentication system deployed (Sept 2025)',
        'Complete CORS resolution across all services',
        'Data isolation between DiamondShift/Kurkipotku/DiamondManager',
        'Railway deployment optimization',
        'Comprehensive documentation system'
      ]
    };
  }

  /**
   * Detect potential tasks in user message
   */
  async detectPotentialTasks(message, userId, activeTab) {
    const normalizedMessage = message.toLowerCase();
    
    // Task indicators (Finnish patterns)
    const taskIndicators = [
      'pitää tehdä', 'täytyy tehdä', 'tee', 'toteuta', 'luo', 'rakenna', 'korjaa',
      'suunnittele', 'analysoi', 'tutki', 'selvitä', 'ota yhteyttä', 'kirjoita',
      'päivitä', 'lisää', 'poista', 'muuta', 'kehitä', 'testaa', 'deploy',
      'valmistele', 'järjestä', 'koordinoi', 'review', 'tarkista'
    ];
    
    // Time indicators
    const timeIndicators = [
      'tänään', 'huomenna', 'tällä viikolla', 'ensi viikolla', 'deadlinena',
      'kiireellinen', 'pian', 'ennen', 'jälkeen', 'mennessä'
    ];
    
    // Check for task patterns
    const hasTaskWords = taskIndicators.some(indicator => 
      normalizedMessage.includes(indicator)
    );
    
    const hasTimeReference = timeIndicators.some(indicator => 
      normalizedMessage.includes(indicator)
    );
    
    // Strong task indicators
    const strongTaskPatterns = [
      /pitää (tehdä|toteuttaa|rakentaa|korjata|päivittää)/g,
      /täytyy (tehdä|hoitaa|saada)/g,
      /voitaisiinko (tehdä|toteuttaa|lisätä)/g,
      /ehdotan että (tehdään|toteutetaan|luodaan)/g,
      /seuraavaksi (teen|teemme|toteutan)/g
    ];
    
    const hasStrongPattern = strongTaskPatterns.some(pattern => 
      pattern.test(normalizedMessage)
    );
    
    if (hasTaskWords || hasTimeReference || hasStrongPattern) {
      // Extract potential tasks using simple text analysis
      const tasks = await this.extractTasksFromMessage(message, userId, activeTab);
      
      if (tasks.length > 0) {
        return {
          hasTasks: true,
          tasks: tasks,
          confirmationMessage: this.generateTaskConfirmationMessage(tasks, message),
          actions: [
            {
              emoji: '✅',
              label: 'Kyllä, luo tehtävä(t)',
              action: 'create-tasks',
              data: { tasks: tasks }
            },
            {
              emoji: '❌', 
              label: 'Ei, jatka keskustelua',
              action: 'continue-conversation',
              data: { originalMessage: message }
            },
            {
              emoji: '✏️',
              label: 'Muokkaa ensin',
              action: 'edit-tasks',
              data: { tasks: tasks }
            }
          ]
        };
      }
    }
    
    return { hasTasks: false };
  }

  /**
   * Extract tasks from user message
   */
  async extractTasksFromMessage(message, userId, activeTab) {
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const tasks = [];
    
    const taskIndicators = [
      'pitää tehdä', 'täytyy tehdä', 'tee', 'toteuta', 'luo', 'rakenna', 'korjaa',
      'suunnittele', 'analysoi', 'tutki', 'selvitä', 'ota yhteyttä', 'kirjoita',
      'päivitä', 'lisää', 'poista', 'muuta', 'kehitä', 'testaa'
    ];
    
    for (let sentence of sentences) {
      const normalizedSentence = sentence.toLowerCase().trim();
      
      if (taskIndicators.some(indicator => normalizedSentence.includes(indicator))) {
        // Estimate strategic value based on keywords
        let strategicValue = 5; // default
        
        if (normalizedSentence.includes('kurkipotku')) strategicValue = 9;
        else if (normalizedSentence.includes('asiakas') || normalizedSentence.includes('client')) strategicValue = 8;
        else if (normalizedSentence.includes('urgent') || normalizedSentence.includes('kiire')) strategicValue = 7;
        else if (normalizedSentence.includes('bug') || normalizedSentence.includes('korjaa')) strategicValue = 6;
        
        // Extract time context
        let timeContext = 'Ei määritelty';
        if (normalizedSentence.includes('tänään')) timeContext = 'Tänään';
        else if (normalizedSentence.includes('huomenna')) timeContext = 'Huomenna';
        else if (normalizedSentence.includes('tällä viikolla')) timeContext = 'Tällä viikolla';
        else if (normalizedSentence.includes('ensi viikolla')) timeContext = 'Ensi viikolla';
        
        tasks.push({
          title: this.cleanTaskTitle(sentence.trim()),
          description: sentence.trim(),
          strategicValue: strategicValue,
          estimatedTime: this.estimateTaskTime(sentence),
          timeContext: timeContext,
          category: this.categorizeTask(sentence, activeTab),
          source: 'ai-detected'
        });
      }
    }
    
    return tasks;
  }

  /**
   * Generate confirmation message for detected tasks
   */
  generateTaskConfirmationMessage(tasks, originalMessage) {
    let message = `🤖 Tunnistin viestistäsi ${tasks.length} mahdollista tehtävää:\n\n`;
    
    tasks.forEach((task, index) => {
      message += `**${index + 1}. ${task.title}**\n`;
      message += `   • Strateginen arvo: ⭐ ${task.strategicValue}/10\n`;
      message += `   • Arvioitu aika: ⏱️ ${task.estimatedTime}\n`;
      message += `   • Aikataulussa: 📅 ${task.timeContext}\n`;
      message += `   • Kategoria: 📂 ${task.category}\n\n`;
    });
    
    message += `Haluatko että luon näistä tehtäviä Diamond Makers projekteihin? 🎯`;
    
    return message;
  }

  /**
   * Helper methods for task processing
   */
  cleanTaskTitle(sentence) {
    // Remove task indicators and clean up the title
    const cleanSentence = sentence
      .replace(/^(pitää tehdä|täytyy tehdä|tee|toteuta|luo|rakenna|korjaa|suunnittele|analysoi)/gi, '')
      .replace(/^\s*(että\s*)?/gi, '')
      .trim();
    
    // Capitalize first letter
    return cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
  }

  estimateTaskTime(sentence) {
    const normalizedSentence = sentence.toLowerCase();
    
    if (normalizedSentence.includes('pika') || normalizedSentence.includes('nopea')) return '30 min';
    if (normalizedSentence.includes('review') || normalizedSentence.includes('tarkista')) return '1 tunti';
    if (normalizedSentence.includes('suunnittele') || normalizedSentence.includes('analysoi')) return '2-4 tuntia';
    if (normalizedSentence.includes('toteuta') || normalizedSentence.includes('kehitä')) return '4-8 tuntia';
    if (normalizedSentence.includes('luo') || normalizedSentence.includes('rakenna')) return '1-2 päivää';
    
    return '2-3 tuntia';
  }

  categorizeTask(sentence, activeTab) {
    const normalizedSentence = sentence.toLowerCase();
    
    if (normalizedSentence.includes('kurkipotku')) return 'Kurkipotku.com (PRIORITEETTI #1)';
    if (normalizedSentence.includes('diamondmanager')) return 'DiamondManager';
    if (normalizedSentence.includes('diamondshift')) return 'DiamondShift (Farmastic)';
    if (normalizedSentence.includes('ui') || normalizedSentence.includes('design')) return 'UX/UI Design';
    if (normalizedSentence.includes('backend') || normalizedSentence.includes('api')) return 'Backend Development';
    if (normalizedSentence.includes('testi') || normalizedSentence.includes('bug')) return 'Testing & QA';
    
    // Default based on active tab
    if (activeTab === 'diamondmakers') return 'Yrityksen strategiset tehtävät';
    if (activeTab === 'omat') return 'Henkilökohtaiset tehtävät';
    if (activeTab === 'tavoitteet') return 'Tavoitteiden seuranta';
    
    return 'Yleinen';
  }

  /**
   * Handle superpower inquiries about team members
   */
  async handleSuperpowerInquiry(question, userId) {
    const teamSuperpowers = getTeamSuperpowers();
    const normalizedQuestion = question.toLowerCase();
    
    // Check if asking about self
    if (normalizedQuestion.includes('missä sinä olet hyvä') || normalizedQuestion.includes('mitkä ovat sinun superpowers')) {
      const userProfile = await this.getUserProfile(userId);
      return this.formatSuperpowerResponse(userProfile.firstName, userProfile.superpowers, userProfile);
    }
    
    // Check if asking about specific team member
    const teamMembers = ['tommi', 'pete', 'janne', 'mikko', 'juhani'];
    const mentionedMember = teamMembers.find(name => 
      normalizedQuestion.includes(name.toLowerCase())
    );
    
    if (mentionedMember) {
      const memberProfile = getTeamMemberProfile(mentionedMember);
      return this.formatSuperpowerResponse(memberProfile.name, memberProfile.superpowers, memberProfile);
    }
    
    // General team superpowers overview
    if (normalizedQuestion.includes('kuka on hyvä') || normalizedQuestion.includes('tiimin superpowers')) {
      return this.formatTeamSuperpowersOverview(teamSuperpowers);
    }
    
    return null; // Not a superpower inquiry
  }

  /**
   * Format individual superpower response
   */
  formatSuperpowerResponse(name, superpowers, profile) {
    let response = `🌟 **${name}:n Superpowers:**\n\n`;
    
    superpowers.forEach(power => {
      response += `${power}\n`;
    });
    
    if (profile.currentFocus) {
      response += `\n🎯 **Tämänhetkinen fokus:**\n`;
      profile.currentFocus.forEach(focus => {
        response += `• ${focus}\n`;
      });
    }
    
    response += `\n💡 **Hyödynnä ${name}:n osaamista:**\n`;
    if (name === 'Tommi') {
      response += '• Strategiset päätökset ja visiointityö\n• Teknisen arkkitehtuurin suunnittelu\n• Tiimin koordinointi ja priorisointipäätökset';
    } else if (name === 'Pete') {
      response += '• Backend-toteutukset ja integraatiot\n• Teknisten haasteiden ratkaiseminen\n• Railway deployment ja DevOps';
    } else if (name === 'Janne') {
      response += '• UX/UI suunnittelu ja käyttökokemus\n• Kurkipotku.com visuaalinen kehitys\n• User research ja käytettävyys';
    } else if (name === 'Mikko') {
      response += '• Liiketoimintastrategia ja hinnoittelu\n• Taloudellinen analyysi ja suunnittelu\n• Asiakasprojektien kannattavuus';
    } else if (name === 'Juhani') {
      response += '• Asiakashankinta ja myynti\n• Customer success ja asiakassuhteet\n• Markkinointi ja brändin rakentaminen';
    }
    
    return response;
  }

  /**
   * Format team superpowers overview
   */
  formatTeamSuperpowersOverview(teamSuperpowers) {
    let response = `🚀 **Diamond Makers Tiimin Superpowers:**\n\n`;
    
    Object.entries(teamSuperpowers).forEach(([name, powers]) => {
      const profile = getTeamMemberProfile(name);
      response += `**${profile.name}** (${profile.role}):\n`;
      powers.slice(0, 3).forEach(power => { // Show top 3 superpowers
        response += `  ${power}\n`;
      });
      response += '\n';
    });
    
    response += '💡 **Käytä komentoja kuten:** "Missä Janne on hyvä?" tai "Mitkä ovat Tommi:n superpowers?"';
    
    return response;
  }

  /**
   * Default context when real context fails to load
   */
  getDefaultContext() {
    return {
      systemPrompt: `
        Olet DiamondCoach AI, Diamond Makers -yrityksen tekoälyavustaja. 
        Vastaa suomeksi ja auta käyttäjää työskentelemään tehokkaammin.
        Keskity tehtävien priorisoinnin ja tavoitteiden saavuttamisen tukemiseen.
        Pidä vastaukset ytimekkäinä ja anna konkreettisia neuvoja.
        
        TÄRKEÄ OMINAISUUS: Kun käyttäjä kysyy "Missä [nimi] on hyvä?" tai "Mitkä ovat superpowers?", 
        anna yksityiskohtainen listaus tiimin jäsenten superpowers-ominaisuuksista.
      `,
      userContext: { currentTasks: [], workingPatterns: {}, personalGoals: [] },
      companyContext: { goals: {}, teamStatus: {} }
    };
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;