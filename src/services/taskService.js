/**
 * Task Service for DiamondManager - Task and Goal Management
 * Handles task persistence, assignment, and goal tracking
 */

class TaskService {
  constructor() {
    this.tasksKey = 'diamondmanager_tasks';
    this.goalsKey = 'diamondmanager_goals';
    this.teamGoalsKey = 'diamondmanager_team_goals';
  }

  /**
   * Get all tasks for a user or team
   */
  getUserTasks(userId, includeAssigned = true) {
    const tasks = this.getAllTasks();
    return tasks.filter(task => {
      if (task.assignedTo === userId) return true;
      if (task.createdBy === userId) return true;
      if (includeAssigned && task.teamVisible) return true;
      return false;
    });
  }

  /**
   * Get all tasks from storage
   */
  getAllTasks() {
    try {
      const stored = localStorage.getItem(this.tasksKey);
      return stored ? JSON.parse(stored) : this.getDefaultTasks();
    } catch (error) {
      console.error('Error loading tasks:', error);
      return this.getDefaultTasks();
    }
  }

  /**
   * Save a new task
   */
  saveTask(taskData, createdBy) {
    const tasks = this.getAllTasks();
    
    const newTask = {
      id: this.generateTaskId(),
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignedTo: taskData.assignedTo || createdBy,
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: taskData.dueDate || null,
      estimatedTime: taskData.estimatedTime || '2-3 tuntia',
      strategicValue: taskData.strategicValue || 5,
      category: taskData.category || 'Yleinen',
      teamVisible: taskData.teamVisible !== false, // Default to visible
      completionRate: this.calculateCompletionRate(taskData.status),
      requiredSkills: taskData.requiredSkills || [],
      goalId: taskData.goalId || null
    };

    tasks.push(newTask);
    localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    
    console.log('✅ Task saved:', newTask.title);
    return newTask;
  }

  /**
   * Update existing task
   */
  updateTask(taskId, updates, updatedBy) {
    const tasks = this.getAllTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return null;
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy,
      completionRate: this.calculateCompletionRate(updates.status || tasks[taskIndex].status)
    };

    tasks[taskIndex] = updatedTask;
    localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    
    console.log('✅ Task updated:', updatedTask.title);
    return updatedTask;
  }

  /**
   * Delete task
   */
  deleteTask(taskId) {
    const tasks = this.getAllTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    
    localStorage.setItem(this.tasksKey, JSON.stringify(filteredTasks));
    console.log('🗑️ Task deleted:', taskId);
  }

  /**
   * Get team tasks overview
   */
  getTeamTasksOverview() {
    const tasks = this.getAllTasks();
    const overview = {
      total: tasks.length,
      active: tasks.filter(t => t.status === 'active').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      averageCompletion: Math.round(
        tasks.reduce((acc, t) => acc + t.completionRate, 0) / tasks.length || 0
      )
    };

    return overview;
  }

  /**
   * Get tasks by assignee
   */
  getTasksByAssignee() {
    const tasks = this.getAllTasks();
    const byAssignee = {};

    tasks.forEach(task => {
      const assignee = task.assignedTo || 'Ei delegoitu';
      if (!byAssignee[assignee]) {
        byAssignee[assignee] = [];
      }
      byAssignee[assignee].push(task);
    });

    return byAssignee;
  }

  /**
   * Save personal goal
   */
  savePersonalGoal(userId, goalData) {
    const goals = this.getPersonalGoals(userId);
    
    const newGoal = {
      id: this.generateGoalId(),
      title: goalData.title,
      description: goalData.description || '',
      type: 'personal',
      status: goalData.status || 'active',
      priority: goalData.priority || 'medium',
      targetDate: goalData.targetDate || null,
      progress: goalData.progress || 0,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: goalData.milestones || [],
      linkedTasks: []
    };

    goals.push(newGoal);
    localStorage.setItem(`${this.goalsKey}_${userId}`, JSON.stringify(goals));
    
    console.log('🎯 Personal goal saved:', newGoal.title);
    return newGoal;
  }

  /**
   * Get personal goals for user
   */
  getPersonalGoals(userId) {
    try {
      const stored = localStorage.getItem(`${this.goalsKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading personal goals:', error);
      return [];
    }
  }

  /**
   * Get team goals (company-wide)
   */
  getTeamGoals() {
    try {
      const stored = localStorage.getItem(this.teamGoalsKey);
      return stored ? JSON.parse(stored) : this.getDefaultTeamGoals();
    } catch (error) {
      console.error('Error loading team goals:', error);
      return this.getDefaultTeamGoals();
    }
  }

  /**
   * Calculate completion rate based on status
   */
  calculateCompletionRate(status) {
    switch (status) {
      case 'completed': return 100;
      case 'active': return 60;
      case 'pending': return 20;
      case 'blocked': return 30;
      default: return 0;
    }
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique goal ID
   */
  generateGoalId() {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Default team goals focused on achievement
   */
  getDefaultTeamGoals() {
    return [
      {
        id: 'goal_main_revenue',
        title: '€1,000,000 vuositulot',
        description: 'Saavuttaa miljoonan euron vuositulot SaaS-ratkaisujen kautta',
        status: 'active',
        priority: 'high',
        progress: 25,
        targetDate: '2025-12-31',
        type: 'company',
        milestones: [
          'Kurkipotku.com lanseeraus',
          'DiamondManager kaupallistaminen', 
          'Banz.Ai kehitys',
          'Asiakashankinta skaalaus'
        ]
      },
      {
        id: 'goal_product_dev',
        title: 'Tuotekehityksen tehokkuus',
        description: 'Optimoida tuotekehitystyökalut ja -prosessit',
        status: 'active',
        priority: 'high',
        progress: 70,
        targetDate: '2025-10-31',
        type: 'development'
      }
    ];
  }

  /**
   * Default tasks for new installation
   */
  getDefaultTasks() {
    return [
      // Team-wide tasks
      {
        id: 'task_team_test_diamondmanager',
        title: 'Testaa ja kommentoi DiamondManager-sovellus',
        description: 'Testaa DiamondManager-sovellus perusteellisesti ja anna palautetta. Tämä sama logiikka tullaan käyttämään Diamond Coach:issa Kurkipotku.com-sovelluksessa.',
        status: 'active',
        priority: 'high',
        assignedTo: 'tiimi',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        strategicValue: 9,
        completionRate: 30,
        category: 'Tuotekehitys & Testaus',
        teamVisible: true,
        estimatedTime: '1-2 viikkoa',
        requiredSkills: ['Käytettävyystestaus', 'Tuotepalaute'],
        goalId: 'goal_product_dev'
      },
      
      // Pete's specific tasks
      {
        id: 'task_pete_funding_analysis',
        title: 'Arvioi nykyiset rahoitusvaihtoehdot',
        description: 'Arvioi nykyiset rahoitusvaihtoehdot, tee niistä ehdotus ja järjestä aikaa Tommin kanssa näiden läpikäymiseen.',
        status: 'pending',
        priority: 'high',
        assignedTo: 'pete',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        strategicValue: 8,
        completionRate: 0,
        category: 'Rahoitus & Strategia',
        teamVisible: true,
        estimatedTime: '3-5 päivää',
        requiredSkills: ['Liiketoimintastrategia', 'Rahoitusanalyysi'],
        goalId: 'goal_main_revenue'
      },
      
      {
        id: 'task_pete_random_team_generator',
        title: 'Random Team Generator App - korjaukset',
        description: 'Tee korjaukset Random Team Generator Appiin. Tommi pyytää sen jälkeen Jannea tekemään UI:n tälle sovellukselle. Tämä tulee olemaan Diamond Makersin ensimmäinen kaupallinen sovellus (julkaistaan pian).',
        status: 'active',
        priority: 'high',
        assignedTo: 'pete',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        strategicValue: 9,
        completionRate: 20,
        category: 'Ensimmäinen Kaupallinen Tuote',
        teamVisible: true,
        estimatedTime: '1-2 viikkoa',
        requiredSkills: ['Tuotekehitys', 'Laadunvarmistus'],
        goalId: 'goal_main_revenue'
      },
      
      // Juhani's specific tasks
      {
        id: 'task_juhani_ai_training',
        title: 'AI-koulutus ja bisneslogiikan kehittäminen',
        description: 'Järjestä aikaa AI-koulutukseen ja siihen, että pääset kehittämään bisneslogiikkaa sekä kartoittamaan potentiaalisia asiakkaita / asiakasryhmiä.',
        status: 'pending',
        priority: 'high',
        assignedTo: 'juhani',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        strategicValue: 8,
        completionRate: 0,
        category: 'Myynti & Asiakashankinta',
        teamVisible: true,
        estimatedTime: '2-3 viikkoa',
        requiredSkills: ['Myynnin kehittäminen', 'Asiakasanalyysi', 'AI-osaamisen kehitys'],
        goalId: 'goal_main_revenue'
      },
      
      // Mikko's specific tasks  
      {
        id: 'task_mikko_payment_methods',
        title: 'Maksutapojen kartoitus AI:n kanssa',
        description: 'Kartoita käytössä olevat maksutavat AI:n kanssa ja käykää ne läpi Tommin ja Peten kanssa. Käytä esimerkkeinä Diamond Makersia sekä Mikon omistamaa Farmastic Oy:ta.',
        status: 'pending',
        priority: 'high',
        assignedTo: 'mikko',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        strategicValue: 8,
        completionRate: 0,
        category: 'Talous & Maksujärjestelmät',
        teamVisible: true,
        estimatedTime: '1-2 viikkoa',
        requiredSkills: ['Talousanalyysi', 'Maksujärjestelmät', 'Liiketoimintaprosessit'],
        goalId: 'goal_main_revenue'
      },
      
      // General development tasks
      {
        id: 'task_default_1',
        title: 'DiamondManager tuotantokäyttöön',
        description: 'Saada DiamondManager valmis asiakaskäyttöön',
        status: 'active',
        priority: 'high',
        assignedTo: 'tiimi',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        strategicValue: 9,
        completionRate: 75,
        category: 'Tuotekehitys',
        teamVisible: true,
        estimatedTime: '2-3 viikkoa'
      },
      
      {
        id: 'task_default_2', 
        title: 'Asiakaspalautejärjestelmä',
        description: 'Rakentaa systemaattinen asiakaspalautteen keräys',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'tiimi',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        strategicValue: 7,
        completionRate: 20,
        category: 'Asiakaskokemus',
        teamVisible: true,
        estimatedTime: '1-2 viikkoa'
      }
    ];
  }
}

// Export singleton instance
const taskService = new TaskService();
export default taskService;