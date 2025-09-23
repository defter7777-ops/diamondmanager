/**
 * Simple Goals Service for DiamondManager
 * Manages personal and team goals with localStorage persistence
 */

class GoalsService {
  constructor() {
    this.goalsKey = 'diamondmanager_goals';
  }

  /**
   * Get default goals for Diamond Makers team
   */
  getDefaultGoals() {
    return [
      {
        id: 'revenue-1m',
        title: '€1,000,000 vuositulot SaaS-ratkaisuilla',
        description: 'Saavuttaa €1M vuositulot DiamondManager, Kurkipotku ja muiden SaaS-tuotteiden kautta',
        category: 'revenue',
        target: 1000000,
        current: 125000,
        unit: '€',
        progress: 12.5,
        deadline: '2025-12-31',
        status: 'active',
        owner: 'team'
      },
      {
        id: 'saas-products',
        title: '3 SaaS-tuotetta tuotannossa',
        description: 'DiamondManager, Kurkipotku, ja kolmas tuote täysimittaisessa tuotantokäytössä',
        category: 'products', 
        target: 3,
        current: 1,
        unit: 'tuotetta',
        progress: 33,
        deadline: '2025-06-30',
        status: 'active',
        owner: 'team'
      },
      {
        id: 'customer-base',
        title: '100+ maksavaa asiakasta',
        description: 'Rakentaa vakaa asiakaskunta toistuvilla kuukausimaksuilla',
        category: 'customers',
        target: 100,
        current: 8,
        unit: 'asiakasta',
        progress: 8,
        deadline: '2025-09-30', 
        status: 'active',
        owner: 'team'
      }
    ];
  }

  /**
   * Get all goals
   */
  getAllGoals() {
    try {
      const goals = localStorage.getItem(this.goalsKey);
      if (goals) {
        return JSON.parse(goals);
      }
      
      // First time - return default goals
      const defaultGoals = this.getDefaultGoals();
      this.saveGoals(defaultGoals);
      return defaultGoals;
      
    } catch (error) {
      console.error('Error loading goals:', error);
      return this.getDefaultGoals();
    }
  }

  /**
   * Save goals to localStorage
   */
  saveGoals(goals) {
    try {
      localStorage.setItem(this.goalsKey, JSON.stringify(goals));
      return true;
    } catch (error) {
      console.error('Error saving goals:', error);
      return false;
    }
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(goalId, newCurrent) {
    try {
      const goals = this.getAllGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      
      if (goalIndex !== -1) {
        goals[goalIndex].current = newCurrent;
        goals[goalIndex].progress = Math.round((newCurrent / goals[goalIndex].target) * 100);
        goals[goalIndex].updatedAt = new Date().toISOString();
        
        // Check if goal is completed
        if (newCurrent >= goals[goalIndex].target) {
          goals[goalIndex].status = 'completed';
          goals[goalIndex].completedAt = new Date().toISOString();
        }
        
        this.saveGoals(goals);
        return goals[goalIndex];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return null;
    }
  }

  /**
   * Add new goal
   */
  addGoal(goalData) {
    try {
      const goals = this.getAllGoals();
      const newGoal = {
        id: `goal_${Date.now()}`,
        title: goalData.title,
        description: goalData.description || '',
        category: goalData.category || 'personal',
        target: goalData.target || 100,
        current: goalData.current || 0,
        unit: goalData.unit || '%',
        progress: goalData.current ? Math.round((goalData.current / goalData.target) * 100) : 0,
        deadline: goalData.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        owner: goalData.owner || 'personal',
        createdAt: new Date().toISOString()
      };
      
      goals.push(newGoal);
      this.saveGoals(goals);
      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      return null;
    }
  }

  /**
   * Get goals summary for AI context
   */
  getGoalsSummary() {
    const goals = this.getAllGoals();
    const activeGoals = goals.filter(g => g.status === 'active');
    
    return {
      total: goals.length,
      active: activeGoals.length,
      completed: goals.filter(g => g.status === 'completed').length,
      goals: activeGoals
    };
  }
}

// Export singleton instance
const goalsService = new GoalsService();
export default goalsService;