/**
 * AI Service for DiamondManager - Claude Integration
 * Provides intelligent task analysis, goal alignment, and personal productivity optimization
 */

import { TEAM_PROFILES, getTeamMemberProfile, getTeamSuperpowers } from '../data/teamProfiles';

class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_CLAUDE_API_KEY || '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';
    this.baseUrl = 'https://api.anthropic.com/v1';
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
          - Tavoite: €1M vuositulot SaaS-ratkaisujen kautta
          - Tiimi: Tommi (CTO), Pete (Lead Dev), Janne (Design - nyt aktiivinen Kurkipotku kehityksessä!), Mikko (Finance), Juhani (Sales)
          - TEKNINEN ARKKITEHTUURI: 5 mikropalvelua (auth, user, team, challenge, feedback) + Railway Cloud
          - ✅ SAAVUTUKSIA: Multi-app authentication system käytössä, complete data isolation
          - KEHITYSTYÖKALU: Claude Code AI-avusteinen workflow + Diamond Coach testing
          
          🏆 PRIORITEETTIJÄRJESTYS (KRIITTINEN):
          1. **KURKIPOTKU.COM** (newapp) - NRO 1 PRIORITEETTI koko yritykselle
             • Jalkapallo-alusta production-tilassa
             • Janne nyt aktiivisesti mukana UX/UI kehityksessä
             • Kaikki kehitys dokumentoitava ja monitoroitava tarkasti
             • Diamond Coach logiikka testataan tässä projektissa
          
          2. **DIAMONDMANAGER** - Kaupallinen potentiaali (sinä olet tässä!)
             • AI-pohjainen tiimityökalu kehitteillä
             • MERKITTÄVÄ kaupallistamispotentiaali SaaS-tuotteena
             • Claude integration proof-of-concept tälle markkinalle
          
          3. DiamondShift: Farmastic Oy asiakasprojekti
          4. Banz.Ai: Live-soccer sovellukset (suunnittelu)
          
          TEKNINEN TILANNE (Sept 2025):
          • MongoDB Atlas: App-scoped collections (users, users_diamondshift, users_diamondmanager)
          • Authentication: Multi-tenant JWT tokens, complete data isolation
          • Development: WSL2 + Windows, curl.exe testing, Railway auto-deploy
          • AI Workflow: TASK.md system + Claude Code assistant
          
          TEHTÄVÄSI:
          1. **KURKIPOTKU.COM ENSISIJAISESTI** - Priorisoi kaikki tehtävät Kurkipotku-kehityksen tukemiseksi
          2. Monitoroi ja dokumentoi Kurkipotku-kehitystä (Janne + tiimi yhteistyö)
          3. Testaa ja kehitä Diamond Coach -logiikkaa Kurkipotku-kontekstissa
          4. Arvioi DiamondManager SaaS-potentiaalia ja kaupallistamismahdollisuuksia
          5. Ehdota tapoja hyödyntää mikropalveluarkkitehtuuria molempien tuotteiden skaalaamisen
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

      const response = await fetch(this.baseUrl + '/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01'
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
   * Get user profile (based on real Diamond Makers team profiles)
   */
  async getUserProfile(userId) {
    // Try to get real team member profile
    const teamProfile = getTeamMemberProfile(userId || 'pete');
    
    if (teamProfile) {
      return {
        firstName: teamProfile.name,
        role: teamProfile.role,
        title: teamProfile.title,
        email: teamProfile.email,
        superpowers: teamProfile.superpowers,
        workingPatterns: {
          peakHours: teamProfile.workingStyle.peakHours,
          preferences: teamProfile.workingStyle.preferences,
          communication: teamProfile.workingStyle.communication
        },
        personalGoals: teamProfile.personalGoals,
        expertise: teamProfile.expertise,
        currentFocus: teamProfile.currentFocus,
        fullProfile: teamProfile // Include complete profile for AI context
      };
    }
    
    // Fallback to Pete if no match
    return {
      firstName: 'Pete',
      role: 'Lead Developer',
      workingPatterns: {
        peakHours: '9-11 AM, 2-4 PM',
        preferences: 'Deep work blocks, AI-assisted development, Railway deployments'
      },
      personalGoals: TEAM_PROFILES.pete.personalGoals,
      superpowers: TEAM_PROFILES.pete.superpowers,
      currentFocus: TEAM_PROFILES.pete.currentFocus
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
        'Tommi': 'CEO & CTO - Architecture & Strategy',
        'Pete': 'Lead Developer - Backend & Systems',
        'Janne': 'Designer - UX/UI (aktiivinen Kurkipotku-kehityksessä)',
        'Mikko': 'Finance - Business Strategy',
        'Juhani': 'Sales - Customer Relations'
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