/**
 * Feedback Learning Service for AI Intent Classification
 * Collects and learns from user corrections to improve intent detection
 */

class FeedbackLearningService {
  constructor() {
    this.feedbackHistory = this.loadFeedbackHistory();
    this.correctionPatterns = new Map();
    this.userBehaviorProfiles = new Map();
  }

  /**
   * Record user correction for intent classification
   */
  recordCorrection(userId, originalMessage, detectedIntent, correctIntent, confidence) {
    const correction = {
      userId,
      originalMessage: originalMessage.toLowerCase().trim(),
      detectedIntent,
      correctIntent,
      originalConfidence: confidence,
      timestamp: Date.now(),
      messageLength: originalMessage.length,
      hasKeywords: this.extractKeywords(originalMessage),
      correctionId: this.generateCorrectionId(userId, originalMessage)
    };

    // Store correction
    if (!this.feedbackHistory.has(userId)) {
      this.feedbackHistory.set(userId, []);
    }

    this.feedbackHistory.get(userId).push(correction);

    // Update correction patterns for system-wide learning
    this.updateCorrectionPatterns(correction);

    // Update user behavior profile
    this.updateUserBehaviorProfile(userId, correction);

    // Save to persistent storage
    this.saveFeedbackHistory();

    console.log('🎓 Recorded intent correction:', {
      user: userId,
      from: detectedIntent,
      to: correctIntent,
      message: originalMessage.substring(0, 50) + '...'
    });

    return correction;
  }

  /**
   * Get user-specific intent adjustments
   */
  getUserIntentAdjustments(userId) {
    const userCorrections = this.feedbackHistory.get(userId) || [];
    const adjustments = {};

    // Analyze patterns in user corrections
    userCorrections.forEach(correction => {
      const pattern = this.extractPattern(correction.originalMessage);
      
      if (!adjustments[pattern]) {
        adjustments[pattern] = {
          corrections: 0,
          fromIntent: correction.detectedIntent,
          toIntent: correction.correctIntent,
          confidence: 0
        };
      }

      adjustments[pattern].corrections++;
      adjustments[pattern].confidence = Math.min(
        0.9, 
        adjustments[pattern].corrections * 0.1
      );
    });

    return adjustments;
  }

  /**
   * Get system-wide correction patterns
   */
  getSystemCorrectionPatterns() {
    const patterns = {};

    this.correctionPatterns.forEach((data, pattern) => {
      if (data.occurrences >= 3) { // Only patterns seen 3+ times
        patterns[pattern] = {
          fromIntent: data.mostCommonFrom,
          toIntent: data.mostCommonTo,
          confidence: Math.min(0.8, data.occurrences * 0.05),
          occurrences: data.occurrences
        };
      }
    });

    return patterns;
  }

  /**
   * Suggest intent based on learned patterns
   */
  suggestIntentCorrection(userId, message, currentIntent, currentConfidence) {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check user-specific patterns first
    const userAdjustments = this.getUserIntentAdjustments(userId);
    const pattern = this.extractPattern(normalizedMessage);
    
    if (userAdjustments[pattern] && userAdjustments[pattern].confidence > 0.3) {
      return {
        suggested: true,
        intent: userAdjustments[pattern].toIntent,
        confidence: userAdjustments[pattern].confidence,
        reason: 'user_pattern',
        pattern: pattern
      };
    }

    // Check system-wide patterns
    const systemPatterns = this.getSystemCorrectionPatterns();
    if (systemPatterns[pattern]) {
      return {
        suggested: true,
        intent: systemPatterns[pattern].toIntent,
        confidence: systemPatterns[pattern].confidence * 0.8, // Discount for system vs user
        reason: 'system_pattern',
        pattern: pattern
      };
    }

    // Check for similar messages in user history
    const similar = this.findSimilarMessages(userId, normalizedMessage);
    if (similar.length > 0 && similar[0].similarity > 0.7) {
      return {
        suggested: true,
        intent: similar[0].correctIntent,
        confidence: similar[0].similarity * 0.7,
        reason: 'similar_message',
        similarMessage: similar[0].originalMessage
      };
    }

    return { suggested: false };
  }

  /**
   * Generate learning insights for AI system improvement
   */
  generateLearningInsights() {
    const insights = {
      totalCorrections: 0,
      commonMisclassifications: {},
      userSpecificIssues: {},
      systemImprovement: {
        accuracy: this.calculateSystemAccuracy(),
        topIssues: [],
        recommendations: []
      }
    };

    // Analyze all feedback
    this.feedbackHistory.forEach((userFeedback, userId) => {
      insights.totalCorrections += userFeedback.length;

      userFeedback.forEach(feedback => {
        const key = `${feedback.detectedIntent} -> ${feedback.correctIntent}`;
        
        if (!insights.commonMisclassifications[key]) {
          insights.commonMisclassifications[key] = 0;
        }
        insights.commonMisclassifications[key]++;
      });

      // User-specific analysis
      if (userFeedback.length >= 3) {
        insights.userSpecificIssues[userId] = this.analyzeUserFeedback(userFeedback);
      }
    });

    // Generate recommendations
    insights.systemImprovement.recommendations = this.generateRecommendations(insights);

    return insights;
  }

  /**
   * Export feedback data for model retraining
   */
  exportTrainingData() {
    const trainingData = [];

    this.feedbackHistory.forEach((userFeedback, userId) => {
      userFeedback.forEach(feedback => {
        trainingData.push({
          text: feedback.originalMessage,
          label: feedback.correctIntent,
          metadata: {
            userId,
            originalPrediction: feedback.detectedIntent,
            confidence: feedback.originalConfidence,
            timestamp: feedback.timestamp,
            keywords: feedback.hasKeywords
          }
        });
      });
    });

    return trainingData;
  }

  /**
   * Helper methods
   */

  extractKeywords(message) {
    const taskKeywords = ['tehtävä', 'task', 'luo', 'anna', 'delegoi'];
    const performanceKeywords = ['edistyminen', 'tilastot', 'suoritus'];
    const superpowerKeywords = ['superpower', 'hyvä', 'osaaminen'];

    return {
      task: taskKeywords.filter(kw => message.toLowerCase().includes(kw)),
      performance: performanceKeywords.filter(kw => message.toLowerCase().includes(kw)),
      superpower: superpowerKeywords.filter(kw => message.toLowerCase().includes(kw))
    };
  }

  extractPattern(message) {
    // Simple pattern extraction - could be enhanced with NLP
    const normalized = message.toLowerCase().trim();
    
    // Extract common patterns
    if (normalized.includes('anna tehtävä')) return 'anna_tehtava_pattern';
    if (normalized.includes('luo tehtävä')) return 'luo_tehtava_pattern';
    if (normalized.includes('missä') && normalized.includes('hyvä')) return 'missa_hyva_pattern';
    if (normalized.includes('superpowers')) return 'superpowers_pattern';
    if (normalized.includes('edistyminen')) return 'edistyminen_pattern';
    
    // Fallback to first 3 words
    const words = normalized.split(' ').slice(0, 3).join(' ');
    return `pattern_${words.replace(/[^\w\s]/g, '')}`; 
  }

  updateCorrectionPatterns(correction) {
    const pattern = this.extractPattern(correction.originalMessage);
    
    if (!this.correctionPatterns.has(pattern)) {
      this.correctionPatterns.set(pattern, {
        occurrences: 0,
        corrections: {},
        mostCommonFrom: correction.detectedIntent,
        mostCommonTo: correction.correctIntent
      });
    }

    const patternData = this.correctionPatterns.get(pattern);
    patternData.occurrences++;
    
    const correctionKey = `${correction.detectedIntent}->${correction.correctIntent}`;
    patternData.corrections[correctionKey] = (patternData.corrections[correctionKey] || 0) + 1;

    // Update most common correction
    const mostCommon = Object.entries(patternData.corrections)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostCommon) {
      const [from, to] = mostCommon[0].split('->');
      patternData.mostCommonFrom = from;
      patternData.mostCommonTo = to;
    }
  }

  updateUserBehaviorProfile(userId, correction) {
    if (!this.userBehaviorProfiles.has(userId)) {
      this.userBehaviorProfiles.set(userId, {
        totalCorrections: 0,
        intentPreferences: {},
        messagingPatterns: {},
        accuracy: 1.0
      });
    }

    const profile = this.userBehaviorProfiles.get(userId);
    profile.totalCorrections++;
    
    // Track accuracy
    profile.accuracy = Math.max(0.1, profile.accuracy - 0.05);

    // Track intent preferences
    if (!profile.intentPreferences[correction.correctIntent]) {
      profile.intentPreferences[correction.correctIntent] = 0;
    }
    profile.intentPreferences[correction.correctIntent]++;
  }

  findSimilarMessages(userId, message) {
    const userFeedback = this.feedbackHistory.get(userId) || [];
    
    return userFeedback
      .map(feedback => ({
        ...feedback,
        similarity: this.calculateSimilarity(message, feedback.originalMessage)
      }))
      .filter(item => item.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  calculateSimilarity(msg1, msg2) {
    // Simple Jaccard similarity
    const words1 = new Set(msg1.toLowerCase().split(' '));
    const words2 = new Set(msg2.toLowerCase().split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  calculateSystemAccuracy() {
    let totalMessages = 0;
    let corrections = 0;

    this.feedbackHistory.forEach(userFeedback => {
      totalMessages += userFeedback.length * 2; // Assume 1 correction per message indicates 1 wrong + 1 right
      corrections += userFeedback.length;
    });

    return totalMessages === 0 ? 1.0 : Math.max(0, 1 - (corrections / totalMessages));
  }

  analyzeUserFeedback(userFeedback) {
    const analysis = {
      mostCommonMistake: null,
      accuracy: 1.0 - (userFeedback.length * 0.1),
      patterns: {}
    };

    // Find most common mistake
    const mistakes = {};
    userFeedback.forEach(feedback => {
      const mistake = `${feedback.detectedIntent}->${feedback.correctIntent}`;
      mistakes[mistake] = (mistakes[mistake] || 0) + 1;
    });

    const mostCommon = Object.entries(mistakes).sort(([,a], [,b]) => b - a)[0];
    if (mostCommon) {
      analysis.mostCommonMistake = mostCommon[0];
    }

    return analysis;
  }

  generateRecommendations(insights) {
    const recommendations = [];

    // Check for common misclassifications
    Object.entries(insights.commonMisclassifications).forEach(([mistake, count]) => {
      if (count >= 5) {
        recommendations.push({
          type: 'pattern_improvement',
          issue: mistake,
          priority: 'high',
          suggestion: `Improve classification patterns for: ${mistake} (${count} occurrences)`
        });
      }
    });

    // System accuracy recommendations
    if (insights.systemImprovement.accuracy < 0.8) {
      recommendations.push({
        type: 'accuracy_improvement',
        priority: 'critical',
        suggestion: 'System accuracy below 80% - consider model retraining or pattern updates'
      });
    }

    return recommendations;
  }

  generateCorrectionId(userId, message) {
    return `${userId}_${Date.now()}_${message.substring(0, 10).replace(/[^\w]/g, '')}`;
  }

  loadFeedbackHistory() {
    try {
      const stored = localStorage.getItem('diamondmanager_feedback_learning');
      if (stored) {
        const data = JSON.parse(stored);
        return new Map(data);
      }
    } catch (error) {
      console.warn('Failed to load feedback history:', error);
    }
    return new Map();
  }

  saveFeedbackHistory() {
    try {
      localStorage.setItem(
        'diamondmanager_feedback_learning',
        JSON.stringify([...this.feedbackHistory])
      );
    } catch (error) {
      console.warn('Failed to save feedback history:', error);
    }
  }

  // Cleanup old feedback (keep only last 100 per user)
  cleanupOldFeedback() {
    this.feedbackHistory.forEach((userFeedback, userId) => {
      if (userFeedback.length > 100) {
        userFeedback.splice(0, userFeedback.length - 100);
      }
    });
    
    this.saveFeedbackHistory();
  }
}

export default FeedbackLearningService;