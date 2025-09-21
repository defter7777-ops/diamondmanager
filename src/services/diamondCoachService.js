/**
 * DiamondCoach Service - Adapted for Diamond Makers Team Members
 * 
 * Original: Youth soccer player coaching
 * Adapted: Professional team member development and AI multiplication
 */

// Professional Team Member Progress States
export const TEAM_PROGRESS_STATES = {
  NEW_TEAM_MEMBER: 'new_team_member',           // Just joined Diamond Makers
  SKILLS_MAPPED: 'skills_mapped',               // Completed skills assessment
  VALUE_CONTRIBUTING: 'value_contributing',     // Actively contributing value
  MENTOR_EMERGING: 'mentor_emerging',           // Starting to help others
  SUPERPOWER_RECOGNIZED: 'superpower_recognized', // Team recognizes their unique value
  AI_MULTIPLIER: 'ai_multiplier'                // Using AI workflows effectively
};

// Professional Diamond Categories (adapted from sports categories)
export const PROFESSIONAL_DIAMOND_CATEGORIES = {
  GREEN: {
    name: "Technical Excellence",
    description: "Coding, design, analysis, domain expertise",
    color: "#10b981",
    examples: ["Clean code", "System design", "Problem solving", "Tool mastery"]
  },
  BLUE: {
    name: "Collaboration Mastery", 
    description: "Communication, leadership, mentoring, teamwork",
    color: "#3b82f6",
    examples: ["Clear communication", "Helping colleagues", "Leadership", "Knowledge sharing"]
  },
  GOLD: {
    name: "Delivery Impact",
    description: "Execution, results, shipping features, revenue impact",
    color: "#f59e0b", 
    examples: ["Shipping features", "Meeting deadlines", "Revenue contribution", "Client satisfaction"]
  }
};

// Professional Coaching Triggers
export const PROFESSIONAL_TRIGGERS = {
  // Onboarding Journey
  firstLogin: {
    id: 'first_login',
    message: "Welcome to Diamond Makers! 🎉 Let's discover how your unique skills contribute to our €1M goal. Ready to start your superpower assessment?",
    action: 'startSkillsAssessment',
    diamonds: 5,
    category: 'BLUE'
  },

  skillsCompleted: {
    id: 'skills_completed',
    message: "Excellent! 💎 Your skills profile shows you're strongest in {topSkill}. Let's find tasks that match your superpower.",
    action: 'suggestOptimalTasks',
    diamonds: 10,
    category: 'GREEN'
  },

  firstContribution: {
    id: 'first_contribution',
    message: "🚀 Your first contribution shipped! That {contributionType} moved us closer to our revenue goals. You're officially making an impact!",
    action: 'celebrateImpact',
    diamonds: 15,
    category: 'GOLD'
  },

  // AI Workflow Adoption
  aiWorkflowUsed: {
    id: 'ai_workflow_used',
    message: "⚡ You just used an AI workflow to complete {taskType} 10x faster! This is exactly the productivity multiplication we need. Want to share this technique with the team?",
    action: 'shareWorkflowWithTeam',
    diamonds: 20,
    category: 'GREEN'
  },

  // Team Collaboration
  mentorMoment: {
    id: 'mentor_moment',
    message: "🎯 I noticed you helped {colleagueName} solve that {problemType}. Your mentoring superpower is emerging! The team benefits when you share your expertise.",
    action: 'recognizeMentoring',
    diamonds: 15,
    category: 'BLUE'
  },

  // Business Impact
  revenueContribution: {
    id: 'revenue_contribution',
    message: "💰 Your work on {featureName} is projected to generate €{revenueAmount}/month! This is the kind of impact that gets us to millionaire status.",
    action: 'celebrateRevenueImpact',
    diamonds: 25,
    category: 'GOLD'
  },

  // Personal Growth
  skillGrowth: {
    id: 'skill_growth',
    message: "📈 I've noticed significant improvement in your {skillArea} over the past month. Your growth mindset is paying off! Ready for the next challenge?",
    action: 'suggestAdvancedChallenge',
    diamonds: 12,
    category: 'GREEN'
  },

  // Innovation
  innovativeApproach: {
    id: 'innovative_approach',
    message: "💡 Your approach to {problemArea} is brilliant! This kind of creative thinking sets Diamond Makers apart. Should we document this as a team best practice?",
    action: 'documentInnovation',
    diamonds: 18,
    category: 'GREEN'
  }
};

// Professional Coaching State Manager
class ProfessionalCoachingStateManager {
  constructor() {
    this.state = this.loadState();
    this.cooldownPeriods = new Map();
    this.lastTriggerTimes = new Map();
  }

  loadState() {
    const saved = localStorage.getItem('diamondCoachProfessionalState');
    return saved ? JSON.parse(saved) : {
      currentState: TEAM_PROGRESS_STATES.NEW_TEAM_MEMBER,
      completedAssessments: [],
      skillsProfile: null,
      contributionHistory: [],
      mentorshipGiven: [],
      aiWorkflowsUsed: [],
      diamondsEarned: {
        GREEN: 0,
        BLUE: 0,
        GOLD: 0
      },
      personalContext: {},
      lastInteraction: null
    };
  }

  saveState() {
    localStorage.setItem('diamondCoachProfessionalState', JSON.stringify(this.state));
  }

  updateProgress(newState, context = {}) {
    this.state.currentState = newState;
    this.state.personalContext = { ...this.state.personalContext, ...context };
    this.state.lastInteraction = new Date().toISOString();
    this.saveState();
  }

  addContribution(contribution) {
    this.state.contributionHistory.push({
      ...contribution,
      timestamp: new Date().toISOString()
    });
    this.saveState();
  }

  awardDiamonds(category, amount, reason) {
    this.state.diamondsEarned[category] += amount;
    this.saveState();
    
    // Return award info for UI
    return {
      category,
      amount,
      reason,
      total: this.state.diamondsEarned[category],
      timestamp: new Date().toISOString()
    };
  }

  canTrigger(triggerId) {
    const lastTrigger = this.lastTriggerTimes.get(triggerId);
    const cooldown = this.cooldownPeriods.get(triggerId) || 24 * 60 * 60 * 1000; // Default 24 hours
    
    if (!lastTrigger) return true;
    
    return Date.now() - lastTrigger > cooldown;
  }

  markTriggered(triggerId) {
    this.lastTriggerTimes.set(triggerId, Date.now());
  }

  getCurrentContext() {
    return {
      state: this.state.currentState,
      personalContext: this.state.personalContext,
      diamondsEarned: this.state.diamondsEarned,
      totalContributions: this.state.contributionHistory.length,
      recentActivity: this.state.contributionHistory.slice(-5)
    };
  }
}

// Professional AI Service Integration
class ProfessionalAIService {
  constructor(apiBaseUrl = process.env.REACT_APP_API_BASE_URL) {
    this.baseUrl = apiBaseUrl;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async generateCoaching(memberProfile, context, coachingType = 'general') {
    const cacheKey = `coaching_${memberProfile.id}_${coachingType}_${Date.now()}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }

    const prompt = this.buildProfessionalCoachingPrompt(memberProfile, context, coachingType);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          prompt,
          maxTokens: 300,
          temperature: 0.7
        })
      });

      const result = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        response: result.coaching,
        timestamp: Date.now()
      });

      return result.coaching;
    } catch (error) {
      console.error('AI Coaching service error:', error);
      return this.getFallbackCoaching(memberProfile, coachingType);
    }
  }

  buildProfessionalCoachingPrompt(memberProfile, context, coachingType) {
    const basePrompt = `You are Diamond Coach, an AI assistant helping Diamond Makers team members reach their full potential and contribute to the company's €1M revenue goal.

Team Member Profile:
- Name: ${memberProfile.name}
- Role: ${memberProfile.role || 'Team Member'}
- Superpower: ${memberProfile.identifiedStrength || 'Being discovered'}
- Current State: ${context.state}
- Available Time: ${memberProfile.timeSlots || 'Variable'}
- Growth Goals: ${memberProfile.developmentAreas?.join(', ') || 'To be defined'}

Recent Context:
- Recent contributions: ${context.recentActivity?.length || 0}
- Diamonds earned: Green ${context.diamondsEarned?.GREEN || 0}, Blue ${context.diamondsEarned?.BLUE || 0}, Gold ${context.diamondsEarned?.GOLD || 0}
- Current priority: ${context.currentPriority || 'Team productivity'}

Coaching Style:
- Be encouraging but practical
- Focus on leveraging superpowers
- Connect personal growth to company success
- Suggest specific, actionable next steps
- Use Diamond Makers terminology (diamonds, superpowers, €1M goal)
- Keep responses under 150 words
- Be authentic and motivating`;

    const typeSpecificPrompts = {
      skillsAnalysis: `${basePrompt}

Task: Analyze their skills and suggest 3 ways to:
1. Leverage their strongest superpower this week
2. Contribute to current company priorities
3. Grow toward their career goals

Be specific and actionable.`,

      taskMatching: `${basePrompt}

Task: Recommend the ONE task that maximizes both:
1. Value to Diamond Makers
2. Personal development

Explain why this match is perfect for their superpower.`,

      mentoring: `${basePrompt}

Task: They want to grow in a skill area. Suggest specific mentoring opportunities and learning paths that connect personal growth to company value creation.`,

      general: basePrompt
    };

    return typeSpecificPrompts[coachingType] || typeSpecificPrompts.general;
  }

  getFallbackCoaching(memberProfile, coachingType) {
    const fallbacks = {
      skillsAnalysis: `Great to see you developing your skills, ${memberProfile.name}! Focus on what you do best - that's where you'll add the most value to Diamond Makers. Every expert was once a beginner. 💎`,
      
      taskMatching: `${memberProfile.name}, I see potential in you! Look for tasks that energize you - those usually align with your natural superpowers. The team needs what you uniquely bring. 🚀`,
      
      mentoring: `Learning never stops, ${memberProfile.name}! Find someone who excels in the area you want to grow. Most people love sharing their expertise. Your growth strengthens the entire team. 📈`,
      
      general: `Keep pushing forward, ${memberProfile.name}! Every small step gets us closer to our goals. Your contribution matters more than you know. 💪`
    };

    return fallbacks[coachingType] || fallbacks.general;
  }
}

// Main Professional DiamondCoach Service
export class ProfessionalDiamondCoachService {
  constructor() {
    this.stateManager = new ProfessionalCoachingStateManager();
    this.aiService = new ProfessionalAIService();
    this.eventListeners = new Map();
  }

  // Initialize coaching for a team member
  async initialize(memberProfile) {
    const context = this.stateManager.getCurrentContext();
    
    // If new member, trigger welcome
    if (context.state === TEAM_PROGRESS_STATES.NEW_TEAM_MEMBER) {
      await this.triggerCoaching('firstLogin', { memberProfile });
    }

    return context;
  }

  // Trigger coaching based on team member actions
  async triggerCoaching(triggerType, actionContext = {}) {
    const trigger = PROFESSIONAL_TRIGGERS[triggerType];
    if (!trigger || !this.stateManager.canTrigger(triggerType)) {
      return null;
    }

    this.stateManager.markTriggered(triggerType);

    // Award diamonds if specified
    let diamondAward = null;
    if (trigger.diamonds > 0) {
      diamondAward = this.stateManager.awardDiamonds(
        trigger.category,
        trigger.diamonds,
        trigger.message
      );
    }

    // Generate personalized coaching message
    let message = trigger.message;
    
    // Replace placeholders with actual context
    if (actionContext.topSkill) {
      message = message.replace('{topSkill}', actionContext.topSkill);
    }
    if (actionContext.contributionType) {
      message = message.replace('{contributionType}', actionContext.contributionType);
    }
    if (actionContext.colleagueName) {
      message = message.replace('{colleagueName}', actionContext.colleagueName);
    }
    if (actionContext.problemType) {
      message = message.replace('{problemType}', actionContext.problemType);
    }

    const coachingResult = {
      triggerId: triggerType,
      message,
      action: trigger.action,
      diamondAward,
      timestamp: new Date().toISOString(),
      actionContext
    };

    // Notify listeners (UI components)
    this.notifyListeners('coaching_triggered', coachingResult);

    return coachingResult;
  }

  // Get AI-powered personalized coaching
  async getPersonalizedCoaching(memberProfile, coachingType = 'general') {
    const context = this.stateManager.getCurrentContext();
    const coaching = await this.aiService.generateCoaching(memberProfile, context, coachingType);
    
    return {
      type: coachingType,
      message: coaching,
      context,
      timestamp: new Date().toISOString()
    };
  }

  // Record team member contribution
  recordContribution(contribution) {
    this.stateManager.addContribution(contribution);
    
    // Check if this triggers any coaching
    if (contribution.type === 'feature_shipped') {
      this.triggerCoaching('firstContribution', {
        contributionType: contribution.description || 'feature'
      });
    }
    
    if (contribution.type === 'ai_workflow') {
      this.triggerCoaching('aiWorkflowUsed', {
        taskType: contribution.taskType || 'task'
      });
    }
    
    if (contribution.type === 'mentoring') {
      this.triggerCoaching('mentorMoment', {
        colleagueName: contribution.helpedMember,
        problemType: contribution.problemArea
      });
    }
  }

  // Event listener system for UI updates
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in coaching event listener:', error);
        }
      });
    }
  }

  // Get current coaching state for UI
  getCurrentState() {
    return this.stateManager.getCurrentContext();
  }

  // Reset coaching state (for development/testing)
  resetState() {
    localStorage.removeItem('diamondCoachProfessionalState');
    this.stateManager = new ProfessionalCoachingStateManager();
  }
}

// Export singleton instance
export const professionalDiamondCoach = new ProfessionalDiamondCoachService();