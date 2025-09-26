/**
 * Feature Flag Service for Safe AI Logic Rollout
 * Enables gradual deployment, A/B testing, and quick rollbacks
 */

class FeatureFlagService {
  constructor() {
    this.flags = this.loadFlags();
    this.userAssignments = this.loadUserAssignments();
    this.metrics = this.loadMetrics();
    
    // Default feature flags configuration
    this.defaultFlags = {
      // AI System Flags
      'improved_intent_classifier': {
        enabled: false,
        rolloutPercent: 0,
        description: 'Hybrid intent classification with learning',
        rollbackTriggers: {
          errorRate: 0.1,
          userSatisfaction: 0.7,
          performance: 2000 // ms
        }
      },
      
      'feedback_learning_system': {
        enabled: false,
        rolloutPercent: 0,
        description: 'User feedback learning and corrections',
        rollbackTriggers: {
          errorRate: 0.05,
          userSatisfaction: 0.8
        }
      },
      
      'multi_intent_handling': {
        enabled: false,
        rolloutPercent: 0,
        description: 'Handle multiple intents in single message',
        rollbackTriggers: {
          errorRate: 0.08,
          userSatisfaction: 0.75
        }
      },
      
      'confidence_calibration': {
        enabled: false,
        rolloutPercent: 0,
        description: 'Dynamic confidence adjustment and uncertainty handling',
        rollbackTriggers: {
          errorRate: 0.07,
          userSatisfaction: 0.8
        }
      },
      
      // Revenue-focused AI responses
      'goal_driven_responses': {
        enabled: true,
        rolloutPercent: 100,
        description: 'AI responses focused on €1M revenue goal'
      },
      
      // UI/UX Flags
      'enhanced_task_ui': {
        enabled: true,
        rolloutPercent: 100,
        description: 'Drag-and-drop task prioritization and enhanced UI'
      },
      
      'mobile_optimizations': {
        enabled: false,
        rolloutPercent: 0,
        description: 'Mobile-first UI improvements'
      }
    };
    
    // Initialize flags if not present
    this.initializeFlags();
  }

  /**
   * Check if a feature is enabled for a specific user
   */
  isFeatureEnabled(flagName, userId = null) {
    const flag = this.flags[flagName];
    
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found`);
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // If 100% rollout, enable for everyone
    if (flag.rolloutPercent >= 100) {
      return true;
    }

    // If 0% rollout, disable for everyone
    if (flag.rolloutPercent <= 0) {
      return false;
    }

    // Check user assignment
    if (userId) {
      return this.isUserInRollout(flagName, userId, flag.rolloutPercent);
    }

    // For system-wide checks without user context
    return flag.rolloutPercent >= 100;
  }

  /**
   * Determine if a user is in the rollout group
   */
  isUserInRollout(flagName, userId, rolloutPercent) {
    const assignmentKey = `${flagName}_${userId}`;
    
    // Check if user has a stored assignment
    if (this.userAssignments.has(assignmentKey)) {
      return this.userAssignments.get(assignmentKey);
    }

    // Generate consistent assignment based on user ID hash
    const hash = this.hashUserId(userId, flagName);
    const isInRollout = hash < rolloutPercent;
    
    // Store assignment for consistency
    this.userAssignments.set(assignmentKey, isInRollout);
    this.saveUserAssignments();
    
    return isInRollout;
  }

  /**
   * Update feature flag configuration
   */
  updateFlag(flagName, updates) {
    if (!this.flags[flagName]) {
      console.warn(`Cannot update non-existent flag: ${flagName}`);
      return false;
    }

    const oldConfig = { ...this.flags[flagName] };
    this.flags[flagName] = { ...this.flags[flagName], ...updates };
    
    // Log change
    console.log(`🚩 Feature flag updated:`, {
      flag: flagName,
      old: oldConfig,
      new: this.flags[flagName]
    });

    // Clear user assignments if rollout changed significantly
    if (Math.abs(oldConfig.rolloutPercent - this.flags[flagName].rolloutPercent) > 20) {
      this.clearUserAssignments(flagName);
    }

    this.saveFlags();
    return true;
  }

  /**
   * Gradually increase rollout percentage
   */
  graduateRollout(flagName, targetPercent = 100, stepSize = 25) {
    const flag = this.flags[flagName];
    if (!flag) {
      console.warn(`Cannot graduate non-existent flag: ${flagName}`);
      return false;
    }

    const currentPercent = flag.rolloutPercent;
    const newPercent = Math.min(targetPercent, currentPercent + stepSize);

    console.log(`📈 Graduating rollout for ${flagName}: ${currentPercent}% → ${newPercent}%`);
    
    return this.updateFlag(flagName, { rolloutPercent: newPercent });
  }

  /**
   * Emergency rollback of a feature
   */
  emergencyRollback(flagName, reason = 'Manual rollback') {
    console.warn(`🚨 Emergency rollback triggered for ${flagName}: ${reason}`);
    
    this.updateFlag(flagName, { 
      enabled: false, 
      rolloutPercent: 0,
      rollbackReason: reason,
      rollbackTimestamp: Date.now()
    });

    // Record rollback metric
    this.recordMetric(flagName, 'rollback', { reason, timestamp: Date.now() });

    return true;
  }

  /**
   * A/B test between old and new system
   */
  startABTest(flagName, splitPercent = 50) {
    return this.updateFlag(flagName, {
      enabled: true,
      rolloutPercent: splitPercent,
      abTestActive: true,
      abTestStarted: Date.now()
    });
  }

  /**
   * Record metrics for feature flag monitoring
   */
  recordMetric(flagName, metricType, data) {
    const metricKey = `${flagName}_${metricType}`;
    
    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, []);
    }

    const metric = {
      timestamp: Date.now(),
      type: metricType,
      data: data
    };

    this.metrics.get(metricKey).push(metric);

    // Keep only last 1000 metrics per flag
    const metrics = this.metrics.get(metricKey);
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }

    this.saveMetrics();

    // Check for rollback triggers
    this.checkRollbackTriggers(flagName);
  }

  /**
   * Check if rollback conditions are met
   */
  checkRollbackTriggers(flagName) {
    const flag = this.flags[flagName];
    if (!flag || !flag.rollbackTriggers) return;

    const recentMetrics = this.getRecentMetrics(flagName, 300000); // Last 5 minutes

    // Check error rate
    if (flag.rollbackTriggers.errorRate) {
      const errorRate = this.calculateErrorRate(recentMetrics);
      if (errorRate > flag.rollbackTriggers.errorRate) {
        this.emergencyRollback(flagName, `Error rate too high: ${errorRate}`);
        return;
      }
    }

    // Check user satisfaction
    if (flag.rollbackTriggers.userSatisfaction) {
      const satisfaction = this.calculateUserSatisfaction(recentMetrics);
      if (satisfaction < flag.rollbackTriggers.userSatisfaction) {
        this.emergencyRollback(flagName, `User satisfaction too low: ${satisfaction}`);
        return;
      }
    }

    // Check performance
    if (flag.rollbackTriggers.performance) {
      const avgPerformance = this.calculateAveragePerformance(recentMetrics);
      if (avgPerformance > flag.rollbackTriggers.performance) {
        this.emergencyRollback(flagName, `Performance too slow: ${avgPerformance}ms`);
        return;
      }
    }
  }

  /**
   * Get feature flag status report
   */
  getStatusReport() {
    const report = {
      activeFlags: 0,
      rolloutFlags: 0,
      disabledFlags: 0,
      flagDetails: {},
      recentRollbacks: [],
      systemHealth: 'healthy'
    };

    Object.entries(this.flags).forEach(([flagName, flag]) => {
      if (flag.enabled) {
        if (flag.rolloutPercent === 100) {
          report.activeFlags++;
        } else if (flag.rolloutPercent > 0) {
          report.rolloutFlags++;
        }
      } else {
        report.disabledFlags++;
      }

      report.flagDetails[flagName] = {
        enabled: flag.enabled,
        rolloutPercent: flag.rolloutPercent,
        description: flag.description,
        metrics: this.getFlagMetrics(flagName),
        rollbackReason: flag.rollbackReason || null
      };

      // Check for recent rollbacks
      if (flag.rollbackTimestamp && (Date.now() - flag.rollbackTimestamp < 3600000)) {
        report.recentRollbacks.push({
          flag: flagName,
          reason: flag.rollbackReason,
          timestamp: flag.rollbackTimestamp
        });
      }
    });

    // Determine system health
    if (report.recentRollbacks.length > 2) {
      report.systemHealth = 'degraded';
    } else if (report.recentRollbacks.length > 0) {
      report.systemHealth = 'caution';
    }

    return report;
  }

  /**
   * Helper methods
   */

  hashUserId(userId, flagName) {
    // Simple hash function for consistent user assignment
    let hash = 0;
    const str = `${userId}_${flagName}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  initializeFlags() {
    // Add any missing default flags
    Object.entries(this.defaultFlags).forEach(([flagName, defaultConfig]) => {
      if (!this.flags[flagName]) {
        this.flags[flagName] = { ...defaultConfig };
      }
    });
    
    this.saveFlags();
  }

  clearUserAssignments(flagName) {
    const keysToRemove = [];
    this.userAssignments.forEach((value, key) => {
      if (key.startsWith(`${flagName}_`)) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => this.userAssignments.delete(key));
    this.saveUserAssignments();
  }

  getRecentMetrics(flagName, timeWindowMs) {
    const cutoff = Date.now() - timeWindowMs;
    const allMetrics = [];

    this.metrics.forEach((metricsList, key) => {
      if (key.startsWith(flagName)) {
        const recentMetrics = metricsList.filter(metric => metric.timestamp > cutoff);
        allMetrics.push(...recentMetrics);
      }
    });

    return allMetrics;
  }

  calculateErrorRate(metrics) {
    if (metrics.length === 0) return 0;
    
    const errorCount = metrics.filter(m => m.type === 'error').length;
    return errorCount / metrics.length;
  }

  calculateUserSatisfaction(metrics) {
    const satisfactionMetrics = metrics.filter(m => m.type === 'user_satisfaction');
    if (satisfactionMetrics.length === 0) return 1.0;
    
    const avgSatisfaction = satisfactionMetrics.reduce(
      (sum, m) => sum + (m.data.satisfaction || 0), 0
    ) / satisfactionMetrics.length;
    
    return avgSatisfaction;
  }

  calculateAveragePerformance(metrics) {
    const performanceMetrics = metrics.filter(m => m.type === 'performance');
    if (performanceMetrics.length === 0) return 0;
    
    const avgPerformance = performanceMetrics.reduce(
      (sum, m) => sum + (m.data.duration || 0), 0
    ) / performanceMetrics.length;
    
    return avgPerformance;
  }

  getFlagMetrics(flagName) {
    const flagMetrics = {};
    
    this.metrics.forEach((metricsList, key) => {
      if (key.startsWith(flagName)) {
        const metricType = key.replace(`${flagName}_`, '');
        flagMetrics[metricType] = {
          count: metricsList.length,
          latest: metricsList[metricsList.length - 1]?.timestamp || null
        };
      }
    });
    
    return flagMetrics;
  }

  // Storage methods
  loadFlags() {
    try {
      const stored = localStorage.getItem('diamondmanager_feature_flags');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
    }
    return {};
  }

  saveFlags() {
    try {
      localStorage.setItem('diamondmanager_feature_flags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save feature flags:', error);
    }
  }

  loadUserAssignments() {
    try {
      const stored = localStorage.getItem('diamondmanager_user_assignments');
      if (stored) {
        return new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load user assignments:', error);
    }
    return new Map();
  }

  saveUserAssignments() {
    try {
      localStorage.setItem('diamondmanager_user_assignments', JSON.stringify([...this.userAssignments]));
    } catch (error) {
      console.warn('Failed to save user assignments:', error);
    }
  }

  loadMetrics() {
    try {
      const stored = localStorage.getItem('diamondmanager_feature_metrics');
      if (stored) {
        return new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load feature metrics:', error);
    }
    return new Map();
  }

  saveMetrics() {
    try {
      localStorage.setItem('diamondmanager_feature_metrics', JSON.stringify([...this.metrics]));
    } catch (error) {
      console.warn('Failed to save feature metrics:', error);
    }
  }
}

export default FeatureFlagService;