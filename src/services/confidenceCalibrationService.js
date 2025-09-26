/**
 * Confidence Calibration and Uncertainty Handling Service
 * Improves confidence score accuracy and handles uncertainty in AI responses
 */

class ConfidenceCalibrationService {
  constructor() {
    this.calibrationData = this.loadCalibrationData();
    this.uncertaintyThresholds = {
      low_confidence: 0.3,
      medium_confidence: 0.7,
      high_confidence: 0.9
    };
    
    // Historical accuracy tracking
    this.accuracyHistory = this.loadAccuracyHistory();
    
    // Calibration bins for confidence adjustment
    this.calibrationBins = this.initializeCalibrationBins();
  }

  /**
   * Calibrate confidence score based on historical accuracy
   */
  calibrateConfidence(originalConfidence, intentType, method, userId = null) {
    // Get base calibration for this intent type and method
    const baseCalibration = this.getBaseCalibration(intentType, method);
    
    // Apply user-specific adjustments if available
    const userAdjustment = userId ? this.getUserSpecificAdjustment(userId, intentType) : 0;
    
    // Find appropriate calibration bin
    const binIndex = this.findCalibrationBin(originalConfidence);
    const binCalibration = this.calibrationBins[binIndex];
    
    // Calculate calibrated confidence
    let calibratedConfidence = originalConfidence;
    
    // Apply base calibration
    calibratedConfidence *= baseCalibration.multiplier;
    
    // Apply bin-specific adjustment
    if (binCalibration.count > 10) { // Only if we have enough data
      const accuracyRatio = binCalibration.correct / binCalibration.total;
      const expectedAccuracy = originalConfidence;
      const calibrationFactor = accuracyRatio / expectedAccuracy;
      calibratedConfidence *= Math.min(1.5, Math.max(0.5, calibrationFactor));
    }
    
    // Apply user-specific adjustment
    calibratedConfidence += userAdjustment;
    
    // Ensure confidence stays in valid range
    calibratedConfidence = Math.max(0.01, Math.min(0.99, calibratedConfidence));
    
    return {
      originalConfidence,
      calibratedConfidence,
      calibrationFactors: {
        base: baseCalibration.multiplier,
        bin: binCalibration.count > 10 ? binCalibration.correct / binCalibration.total / originalConfidence : 1.0,
        user: userAdjustment
      },
      reliability: this.calculateReliability(binCalibration, baseCalibration)
    };
  }

  /**
   * Handle uncertainty in AI responses
   */
  handleUncertainty(calibratedResult, context = {}) {
    const { calibratedConfidence } = calibratedResult;
    const uncertaintyLevel = this.classifyUncertainty(calibratedConfidence);
    
    const uncertaintyResponse = {
      level: uncertaintyLevel,
      confidence: calibratedConfidence,
      actions: [],
      warnings: [],
      suggestions: []
    };

    switch (uncertaintyLevel) {
      case 'low':
        uncertaintyResponse.actions = this.generateHighConfidenceActions(context);
        break;
        
      case 'medium':
        uncertaintyResponse.actions = this.generateMediumConfidenceActions(context);
        uncertaintyResponse.warnings = this.generateMediumConfidenceWarnings(calibratedConfidence);
        break;
        
      case 'high':
        uncertaintyResponse.actions = this.generateLowConfidenceActions(context);
        uncertaintyResponse.warnings = this.generateHighUncertaintyWarnings(calibratedConfidence);
        uncertaintyResponse.suggestions = this.generateClarificationSuggestions(context);
        break;
    }

    return uncertaintyResponse;
  }

  /**
   * Record prediction outcome for future calibration
   */
  recordOutcome(userId, originalConfidence, calibratedConfidence, intentType, method, wasCorrect, actualIntent = null) {
    const outcome = {
      userId,
      originalConfidence,
      calibratedConfidence,
      intentType,
      method,
      wasCorrect,
      actualIntent,
      timestamp: Date.now()
    };

    // Update accuracy history
    if (!this.accuracyHistory.has(userId)) {
      this.accuracyHistory.set(userId, []);
    }
    
    this.accuracyHistory.get(userId).push(outcome);

    // Update calibration bins
    const binIndex = this.findCalibrationBin(originalConfidence);
    this.calibrationBins[binIndex].total++;
    if (wasCorrect) {
      this.calibrationBins[binIndex].correct++;
    }

    // Update method-specific calibration data
    const methodKey = `${intentType}_${method}`;
    if (!this.calibrationData.has(methodKey)) {
      this.calibrationData.set(methodKey, { total: 0, correct: 0, confidenceSum: 0 });
    }
    
    const methodData = this.calibrationData.get(methodKey);
    methodData.total++;
    methodData.confidenceSum += originalConfidence;
    if (wasCorrect) {
      methodData.correct++;
    }

    // Cleanup old data
    this.cleanupOldData(userId);
    
    // Save to storage
    this.saveCalibrationData();
    this.saveAccuracyHistory();
    
    console.log('📊 Recorded confidence calibration outcome:', {
      user: userId,
      confidence: `${originalConfidence} → ${calibratedConfidence}`,
      correct: wasCorrect,
      intent: `${intentType} (${method})`
    });
  }

  /**
   * Get confidence explanation for user
   */
  explainConfidence(calibratedResult, intentType) {
    const { originalConfidence, calibratedConfidence, calibrationFactors, reliability } = calibratedResult;
    
    let explanation = `🎯 **Luottamustaso: ${Math.round(calibratedConfidence * 100)}%**\n\n`;
    
    if (calibratedConfidence >= 0.8) {
      explanation += '✅ **Korkea varmuus** - AI on hyvin varma tulkinnastaan.\n';
    } else if (calibratedConfidence >= 0.5) {
      explanation += '⚡ **Kohtalainen varmuus** - AI on melko varma, mutta voi tarkentaa.\n';
    } else {
      explanation += '❓ **Matala varmuus** - AI ei ole varma tulkinnastaan.\n';
    }
    
    if (Math.abs(originalConfidence - calibratedConfidence) > 0.1) {
      explanation += `\n🔧 **Kalibrointi:** Alkuperäinen ${Math.round(originalConfidence * 100)}% → Kalibroitu ${Math.round(calibratedConfidence * 100)}%\n`;
      explanation += 'Perustuu aiempiin kokemuksiin vastaavista viesteistä.\n';
    }
    
    if (reliability < 0.7) {
      explanation += '\n⚠️ **Huom:** Vähän historiadataa tämän tyyppisistä viesteistä. Luottamustaso voi olla epätarkka.\n';
    }
    
    return explanation;
  }

  /**
   * Generate uncertainty-aware response suggestions
   */
  generateUncertaintySuggestions(calibratedResult, context) {
    const suggestions = [];
    const { calibratedConfidence } = calibratedResult;
    
    if (calibratedConfidence < 0.5) {
      suggestions.push({
        type: 'clarification',
        title: 'Tarkenna pyyntöäsi',
        description: 'AI ei ole varma mitä haluat. Voisitko selventää?',
        action: 'request_clarification'
      });
      
      suggestions.push({
        type: 'alternative',
        title: 'Näytä vaihtoehdot',
        description: 'Näytä mitä AI voisi tehdä tämän viestin perusteella',
        action: 'show_alternatives'
      });
    }
    
    if (calibratedConfidence < 0.7 && context.selectedTask) {
      suggestions.push({
        type: 'context',
        title: 'Liittyykö valittuun tehtävään?',
        description: `Liittyykö viestisi tehtävään "${context.selectedTask.title}"?`,
        action: 'confirm_task_context'
      });
    }
    
    return suggestions;
  }

  /**
   * Helper methods
   */

  classifyUncertainty(confidence) {
    if (confidence >= this.uncertaintyThresholds.high_confidence) return 'low';
    if (confidence >= this.uncertaintyThresholds.medium_confidence) return 'medium';
    return 'high';
  }

  getBaseCalibration(intentType, method) {
    const methodKey = `${intentType}_${method}`;
    const methodData = this.calibrationData.get(methodKey);
    
    if (!methodData || methodData.total < 5) {
      // Default calibration for new methods
      return { multiplier: 1.0, reliability: 0.3 };
    }
    
    const accuracy = methodData.correct / methodData.total;
    const avgConfidence = methodData.confidenceSum / methodData.total;
    
    // Calculate calibration multiplier
    const multiplier = accuracy / avgConfidence;
    const reliability = Math.min(1.0, methodData.total / 50); // Full reliability after 50 samples
    
    return { multiplier, reliability };
  }

  getUserSpecificAdjustment(userId, intentType) {
    const userHistory = this.accuracyHistory.get(userId) || [];
    const relevantHistory = userHistory.filter(h => h.intentType === intentType).slice(-20); // Last 20
    
    if (relevantHistory.length < 3) return 0; // Need at least 3 samples
    
    const avgAccuracy = relevantHistory.reduce((sum, h) => sum + (h.wasCorrect ? 1 : 0), 0) / relevantHistory.length;
    const avgConfidence = relevantHistory.reduce((sum, h) => sum + h.originalConfidence, 0) / relevantHistory.length;
    
    // Adjust confidence based on user's historical accuracy vs confidence
    const adjustment = (avgAccuracy - avgConfidence) * 0.2; // Max 20% adjustment
    
    return Math.max(-0.2, Math.min(0.2, adjustment));
  }

  findCalibrationBin(confidence) {
    // Divide confidence space into 10 bins
    return Math.min(9, Math.floor(confidence * 10));
  }

  calculateReliability(binCalibration, baseCalibration) {
    const binReliability = binCalibration.count > 10 ? Math.min(1.0, binCalibration.count / 50) : 0.1;
    return (binReliability + baseCalibration.reliability) / 2;
  }

  generateHighConfidenceActions(context) {
    return [
      {
        emoji: '⚡',
        label: 'Jatka suoraan',
        action: 'proceed_confidently',
        description: 'AI on varma tulkinnastaan'
      }
    ];
  }

  generateMediumConfidenceActions(context) {
    return [
      {
        emoji: '✅',
        label: 'Jatka',
        action: 'proceed_with_caution',
        description: 'Jatka varovasti'
      },
      {
        emoji: '🔍',
        label: 'Tarkenna',
        action: 'request_clarification',
        description: 'Pyydä tarkennusta'
      }
    ];
  }

  generateLowConfidenceActions(context) {
    return [
      {
        emoji: '❓',
        label: 'Tarkenna pyyntöä',
        action: 'request_clarification',
        description: 'AI tarvitsee lisätietoja'
      },
      {
        emoji: '📋',
        label: 'Näytä vaihtoehdot',
        action: 'show_alternatives',
        description: 'Näytä mahdolliset tulkinnat'
      }
    ];
  }

  generateMediumConfidenceWarnings(confidence) {
    return [
      `AI on ${Math.round(confidence * 100)}% varma tulkinnastaan. Tarkenna tarvittaessa.`
    ];
  }

  generateHighUncertaintyWarnings(confidence) {
    return [
      `AI on vain ${Math.round(confidence * 100)}% varma tulkinnastaan.`,
      'Suositus: Tarkenna pyyntöäsi parempien tulosten saamiseksi.'
    ];
  }

  generateClarificationSuggestions(context) {
    const suggestions = [
      'Voisitko olla tarkempi siitä, mitä haluat?',
      'Tarkoitatko tehtävän luomista vai jotain muuta?'
    ];
    
    if (context.selectedTask) {
      suggestions.push(`Liittyykö pyyntösi tehtävään "${context.selectedTask.title}"?`);
    }
    
    return suggestions;
  }

  initializeCalibrationBins() {
    // Initialize 10 confidence bins (0-0.1, 0.1-0.2, ..., 0.9-1.0)
    return Array.from({ length: 10 }, () => ({
      total: 0,
      correct: 0,
      count: 0
    }));
  }

  cleanupOldData(userId) {
    // Keep only last 200 entries per user
    const userHistory = this.accuracyHistory.get(userId);
    if (userHistory && userHistory.length > 200) {
      userHistory.splice(0, userHistory.length - 200);
    }
  }

  // Storage methods
  loadCalibrationData() {
    try {
      const stored = localStorage.getItem('diamondmanager_confidence_calibration');
      if (stored) {
        return new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load calibration data:', error);
    }
    return new Map();
  }

  saveCalibrationData() {
    try {
      localStorage.setItem('diamondmanager_confidence_calibration', JSON.stringify([...this.calibrationData]));
    } catch (error) {
      console.warn('Failed to save calibration data:', error);
    }
  }

  loadAccuracyHistory() {
    try {
      const stored = localStorage.getItem('diamondmanager_accuracy_history');
      if (stored) {
        return new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load accuracy history:', error);
    }
    return new Map();
  }

  saveAccuracyHistory() {
    try {
      localStorage.setItem('diamondmanager_accuracy_history', JSON.stringify([...this.accuracyHistory]));
    } catch (error) {
      console.warn('Failed to save accuracy history:', error);
    }
  }
}

export default ConfidenceCalibrationService;