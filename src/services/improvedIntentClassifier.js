/**
 * Improved Intent Classification System
 * Replaces brittle regex-only approach with hybrid classification
 */

import FeedbackLearningService from './feedbackLearningService';
import ConfidenceCalibrationService from './confidenceCalibrationService';

class ImprovedIntentClassifier {
  constructor() {
    // Intent confidence thresholds based on ChatGPT analysis
    this.confidenceThresholds = {
      explicit_task: 0.85,  // High confidence for direct commands
      implicit_task: 0.65,  // Medium confidence for suggestions  
      performance_query: 0.70, // Medium-high for performance questions
      casual_chat: 0.50     // Low confidence for general conversation
    };
    
    // Initialize feedback learning service
    this.feedbackLearningService = new FeedbackLearningService();
    
    // Initialize confidence calibration service
    this.confidenceCalibrationService = new ConfidenceCalibrationService();
    
    // Pattern-based fallback (improved from original)
    this.taskPatterns = {
      explicit_finnish: [
        /(?:luo|lisää|anna|delegoi)\s+tehtävä[än]?\s+(\w+)(?:\s*\([^)]*\))?\s*[:.]?\s*(.+)/i,
        /tehtävä\s+(\w+)(?:lle|aan)?\s*[:.]?\s*(.+)/i,
        /(?:anna|give)\s+task\s+(?:to\s+)?(\w+)\s*[:.]?\s*(.+)/i
      ],
      management_finnish: [
        /(?:muokkaa|päivitä|edit)\s+tehtävä[än]?\s+(\w+|\d+)\s*[:.]?\s*(.+)/i,
        /(?:merkitse|complete|finish)\s+tehtävä[än]?\s+(\w+|\d+)\s+(?:valmiiksi|done|completed)/i,
        /(?:poista|delete|remove)\s+tehtävä[än]?\s+(\w+|\d+)/i
      ],
      implicit_finnish: [
        /pitää\s+(tehdä|hoitaa|saada)\s+(.+)/i,
        /täytyy\s+(tehdä|korjata|päivittää)\s+(.+)/i,
        /olisi\s+(hyvä|syytä)\s+(tehdä|toteuttaa|lisätä)\s+(.+)/i,
        /voitaisiinko\s+(tehdä|lisätä|toteuttaa)\s+(.+)/i
      ]
    };
    
    this.performancePatterns = [
      /(?:miten|how).+(?:menee|going|doing)/i,
      /(?:edistyminen|progress|tilastot|stats|suoritus|performance)/i,
      /(?:raportti|report|analyysi|analysis|tulokset|results)/i,
      /(?:tavoitteet|goals|saavutukset|achievements)/i
    ];
    
    // Initialize user feedback learning (now handled by feedbackLearningService)
    this.feedbackHistory = new Map(); // Deprecated in favor of feedbackLearningService
  }
  
  /**
   * Main classification method - hybrid approach
   */
  async classifyIntent(message, userId, context = {}) {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check for learned corrections first
    const learningAdjustment = this.feedbackLearningService.suggestIntentCorrection(
      userId, message, null, 0
    );
    
    if (learningAdjustment.suggested && learningAdjustment.confidence > 0.7) {
      console.log('🎓 Using learned correction:', learningAdjustment);
      return {
        type: learningAdjustment.intent,
        confidence: learningAdjustment.confidence,
        method: `learning_${learningAdjustment.reason}`,
        message: message,
        learningSource: learningAdjustment
      };
    }
    
    // Run multiple classification approaches in parallel
    const classifications = await Promise.all([
      this.patternBasedClassification(message, context),
      this.contextAwareClassification(message, context),
      this.keywordDensityClassification(normalizedMessage),
      this.userHistoryClassification(message, userId)
    ]);
    
    // Ensemble decision with confidence weighting
    let finalIntent = this.ensembleClassification(classifications, message);
    
    // Apply learning adjustment if available and reasonable
    if (learningAdjustment.suggested && learningAdjustment.confidence > 0.4) {
      finalIntent = this.blendWithLearning(finalIntent, learningAdjustment);
    }
    
    // Apply confidence calibration
    const calibratedResult = this.confidenceCalibrationService.calibrateConfidence(
      finalIntent.confidence,
      finalIntent.type,
      finalIntent.method || 'hybrid',
      userId
    );
    
    finalIntent.confidence = calibratedResult.calibratedConfidence;
    finalIntent.calibration = calibratedResult;
    
    // Add uncertainty handling
    const uncertaintyResponse = this.confidenceCalibrationService.handleUncertainty(
      calibratedResult, 
      context
    );
    finalIntent.uncertainty = uncertaintyResponse;
    
    // Handle explicit user overrides (e.g., "show me superpowers")
    const override = this.checkForExplicitOverrides(message);
    if (override) {
      return { ...override, originalIntent: finalIntent };
    }
    
    // Multi-intent detection
    if (this.hasMultipleIntents(message, finalIntent)) {
      return this.handleMultiIntent(message, finalIntent);
    }
    
    return finalIntent;
  }
  
  /**
   * Pattern-based classification (improved from original)
   */
  patternBasedClassification(message, context) {
    const results = {
      explicit_task: 0,
      management_task: 0, 
      implicit_task: 0,
      performance_query: 0,
      casual_chat: 0.1 // Base probability for casual chat
    };
    
    // Check explicit task patterns
    for (const pattern of this.taskPatterns.explicit_finnish) {
      if (pattern.test(message)) {
        results.explicit_task = 0.9;
        return { type: 'explicit_task', confidence: 0.9, method: 'pattern', pattern: pattern.source };
      }
    }
    
    // Check management patterns  
    for (const pattern of this.taskPatterns.management_finnish) {
      if (pattern.test(message)) {
        results.management_task = 0.85;
        return { type: 'management_task', confidence: 0.85, method: 'pattern' };
      }
    }
    
    // Check implicit task patterns
    for (const pattern of this.taskPatterns.implicit_finnish) {
      if (pattern.test(message)) {
        results.implicit_task = 0.7;
        return { type: 'implicit_task', confidence: 0.7, method: 'pattern' };
      }
    }
    
    // Check performance query patterns
    for (const pattern of this.performancePatterns) {
      if (pattern.test(message)) {
        results.performance_query = 0.75;
        return { type: 'performance_query', confidence: 0.75, method: 'pattern' };
      }
    }
    
    return { type: 'casual_chat', confidence: 0.1, method: 'pattern_fallback' };
  }
  
  /**
   * Context-aware classification
   */
  contextAwareClassification(message, context) {
    let confidence = 0.5;
    let type = 'casual_chat';
    
    // Context boosts
    if (context.selectedTask) {
      // User has a task selected - likely task-related intent
      if (message.includes('tehtävä') || message.includes('task')) {
        confidence += 0.2;
        type = 'explicit_task';
      }
    }
    
    if (context.activeTab === 'omat' && message.includes('edistyminen')) {
      confidence += 0.3;
      type = 'performance_query';
    }
    
    if (context.recentTaskCreation && message.includes('muokkaa')) {
      confidence += 0.25;
      type = 'management_task';
    }
    
    return { type, confidence, method: 'context' };
  }
  
  /**
   * Keyword density classification
   */
  keywordDensityClassification(normalizedMessage) {
    const keywords = {
      task_keywords: ['tehtävä', 'task', 'luo', 'create', 'anna', 'give', 'delegoi', 'assign'],
      performance_keywords: ['edistyminen', 'progress', 'tilastot', 'stats', 'raportti', 'report'],
      management_keywords: ['muokkaa', 'edit', 'päivitä', 'update', 'merkitse', 'complete'],
      goal_keywords: ['tavoite', 'goal', 'saavutus', 'achievement', '1m', 'miljoonaa']
    };
    
    const wordCount = normalizedMessage.split(' ').length;
    let maxDensity = 0;
    let dominantType = 'casual_chat';
    
    Object.entries(keywords).forEach(([category, words]) => {
      const matches = words.filter(word => normalizedMessage.includes(word)).length;
      const density = matches / wordCount;
      
      if (density > maxDensity) {
        maxDensity = density;
        dominantType = category.replace('_keywords', '_query');
      }
    });
    
    const confidence = Math.min(0.8, maxDensity * 3); // Cap at 0.8
    
    return { 
      type: dominantType === 'task_query' ? 'explicit_task' : dominantType, 
      confidence, 
      method: 'keyword_density' 
    };
  }
  
  /**
   * User history-based classification  
   */
  userHistoryClassification(message, userId) {
    // Use feedback learning service for user history analysis
    const learningAdjustment = this.feedbackLearningService.suggestIntentCorrection(
      userId, message, null, 0
    );
    
    if (learningAdjustment.suggested) {
      return {
        type: learningAdjustment.intent,
        confidence: learningAdjustment.confidence,
        method: `user_history_${learningAdjustment.reason}`,
        learningData: learningAdjustment
      };
    }
    
    return { type: 'casual_chat', confidence: 0.3, method: 'no_history' };
  }
  
  /**
   * Ensemble classification - weighted decision
   */
  ensembleClassification(classifications, originalMessage) {
    const weights = {
      pattern: 0.4,      // High weight for pattern matching
      context: 0.3,      // Medium weight for context
      keyword_density: 0.2, // Lower weight for keyword density
      user_history: 0.1  // Lowest weight for history
    };
    
    const intentScores = {};
    
    classifications.forEach(classification => {
      const weight = weights[classification.method] || 0.1;
      const score = classification.confidence * weight;
      
      if (!intentScores[classification.type]) {
        intentScores[classification.type] = 0;
      }
      intentScores[classification.type] += score;
    });
    
    // Find highest scoring intent
    const bestIntent = Object.entries(intentScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    const [type, confidence] = bestIntent;
    
    return {
      type,
      confidence,
      allScores: intentScores,
      classifications: classifications,
      message: originalMessage,
      method: 'ensemble' // Mark as ensemble method for calibration
    };
  }
  
  /**
   * Check for explicit user overrides
   */
  checkForExplicitOverrides(message) {
    const overridePatterns = [
      { pattern: /show.*superpowers?/i, type: 'superpower_query', confidence: 0.95 },
      { pattern: /näytä.*superpower/i, type: 'superpower_query', confidence: 0.95 },
      { pattern: /mikä.*superpower/i, type: 'superpower_query', confidence: 0.95 },
      { pattern: /just.*chat/i, type: 'casual_chat', confidence: 0.95 },
      { pattern: /ei.*tehtävä/i, type: 'casual_chat', confidence: 0.9 }
    ];
    
    for (const { pattern, type, confidence } of overridePatterns) {
      if (pattern.test(message)) {
        return { type, confidence, override: true };
      }
    }
    
    return null;
  }
  
  /**
   * Handle multi-intent scenarios
   */
  handleMultiIntent(message, primaryIntent) {
    const multiIntentPatterns = [
      {
        pattern: /(?:anna tehtävä.+)(?:ja|and)(?:.+superpower)/i,
        intents: ['explicit_task', 'superpower_query']
      },
      {
        pattern: /(?:näytä tilastot.+)(?:ja|and)(?:.+tehtävä)/i, 
        intents: ['performance_query', 'explicit_task']
      }
    ];
    
    for (const { pattern, intents } of multiIntentPatterns) {
      if (pattern.test(message)) {
        return {
          type: 'multi_intent',
          intents: intents,
          primaryIntent: primaryIntent.type,
          confidence: primaryIntent.confidence * 0.8, // Slight discount for complexity
          message: message
        };
      }
    }
    
    return primaryIntent;
  }
  
  /**
   * Record user feedback for learning and confidence calibration
   */
  recordUserFeedback(userId, originalMessage, detectedIntent, correctIntent, originalConfidence) {
    // Record for feedback learning
    const correction = this.feedbackLearningService.recordCorrection(
      userId, originalMessage, detectedIntent, correctIntent, originalConfidence
    );
    
    // Record for confidence calibration
    const wasCorrect = detectedIntent === correctIntent;
    this.confidenceCalibrationService.recordOutcome(
      userId,
      originalConfidence,
      originalConfidence, // We'll get calibrated confidence when we have it
      detectedIntent,
      'hybrid',
      wasCorrect,
      correctIntent
    );
    
    return correction;
  }
  
  /**
   * Record outcome for confidence calibration (separate from user feedback)
   */
  recordConfidenceOutcome(userId, intentResult, wasCorrect, actualIntent = null) {
    if (intentResult.calibration) {
      this.confidenceCalibrationService.recordOutcome(
        userId,
        intentResult.calibration.originalConfidence,
        intentResult.calibration.calibratedConfidence,
        intentResult.type,
        intentResult.method || 'hybrid',
        wasCorrect,
        actualIntent
      );
    }
  }
  
  /**
   * Explain confidence level to user
   */
  explainConfidence(intentResult) {
    if (intentResult.calibration) {
      return this.confidenceCalibrationService.explainConfidence(
        intentResult.calibration,
        intentResult.type
      );
    }
    
    return `Luottamustaso: ${Math.round(intentResult.confidence * 100)}%`;
  }
  
  /**
   * Get uncertainty-aware suggestions
   */
  getUncertaintySuggestions(intentResult, context) {
    if (intentResult.calibration) {
      return this.confidenceCalibrationService.generateUncertaintySuggestions(
        intentResult.calibration,
        context
      );
    }
    
    return [];
  }
  
  /**
   * Blend ensemble result with learning suggestions
   */
  blendWithLearning(ensembleResult, learningAdjustment) {
    // If learning suggestion is strong and ensemble is weak, use learning
    if (learningAdjustment.confidence > 0.6 && ensembleResult.confidence < 0.5) {
      return {
        type: learningAdjustment.intent,
        confidence: learningAdjustment.confidence * 0.9, // Slight discount for learning
        method: 'learning_override',
        originalEnsemble: ensembleResult,
        learningSource: learningAdjustment,
        message: ensembleResult.message
      };
    }
    
    // If both are reasonable, blend them
    if (learningAdjustment.confidence > 0.4 && ensembleResult.confidence > 0.3) {
      const blendedConfidence = (
        ensembleResult.confidence * 0.7 + 
        learningAdjustment.confidence * 0.3
      );
      
      // Use learning intent if it's different and confidence supports it
      const finalIntent = learningAdjustment.intent !== ensembleResult.type && 
                         learningAdjustment.confidence > ensembleResult.confidence * 1.2
                         ? learningAdjustment.intent
                         : ensembleResult.type;
      
      return {
        type: finalIntent,
        confidence: blendedConfidence,
        method: 'learning_blended',
        originalEnsemble: ensembleResult,
        learningSource: learningAdjustment,
        message: ensembleResult.message
      };
    }
    
    // Default to ensemble result
    return ensembleResult;
  }
  
  /**
   * Helper methods
   */
  calculateSimilarity(msg1, msg2) {
    // Simple Jaccard similarity
    const words1 = new Set(msg1.toLowerCase().split(' '));
    const words2 = new Set(msg2.toLowerCase().split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  getMostCommonType(feedbackArray) {
    const counts = {};
    feedbackArray.forEach(item => {
      counts[item.correctIntent] = (counts[item.correctIntent] || 0) + 1;
    });
    
    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0];
  }
  
  hasMultipleIntents(message, intent) {
    return message.length > 50 && // Long messages more likely to have multiple intents
           (message.includes(' ja ') || message.includes(' and ')) &&
           intent.confidence > 0.6;
  }
  
  /**
   * Get learning insights for system improvement
   */
  getLearningInsights() {
    return this.feedbackLearningService.generateLearningInsights();
  }
  
  /**
   * Export training data for model improvements
   */
  exportTrainingData() {
    return {
      feedbackData: this.feedbackLearningService.exportTrainingData(),
      confidenceData: this.exportConfidenceCalibrationData()
    };
  }
  
  /**
   * Export confidence calibration data
   */
  exportConfidenceCalibrationData() {
    // This would export calibration statistics for analysis
    return {
      calibrationBins: this.confidenceCalibrationService.calibrationBins,
      methodAccuracy: [...this.confidenceCalibrationService.calibrationData.entries()],
      timestamp: Date.now()
    };
  }
  
  // Deprecated methods - functionality moved to feedbackLearningService
  loadFeedbackHistory() {
    console.warn('loadFeedbackHistory deprecated - use feedbackLearningService');
    return new Map();
  }
  
  saveFeedbackHistory() {
    console.warn('saveFeedbackHistory deprecated - use feedbackLearningService');
  }
}

export default ImprovedIntentClassifier;