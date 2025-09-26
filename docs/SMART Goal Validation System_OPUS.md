SMART Goal Validation System - Implementation Guide
File: /docs/SMART_GOAL_VALIDATION_SYSTEM.md
Purpose: Research-backed goal validation with calendar integration
KISS Principle: Simple validation, clear feedback, automatic calendar scheduling

🎯 Core Function: Validate Goals Against Research
SMART Criteria Implementation (Locke & Latham Research)
javascript// /src/services/smartGoalValidator.js
const SMARTGoalValidator = {
  validateGoal: (goalText, userContext, companyGoals) => {
    const validation = {
      specific: checkSpecific(goalText),
      measurable: checkMeasurable(goalText), 
      achievable: checkAchievable(goalText, userContext),
      relevant: checkRelevant(goalText, companyGoals),
      timeBound: checkTimeBound(goalText)
    };

    const score = Object.values(validation).filter(v => v.passed).length;
    const isReady = score >= 4; // Must pass 4/5 criteria

    return {
      score: score / 5,
      validation,
      isReady,
      calendarSuggestion: isReady ? generateCalendarSuggestion(goalText) : null,
      improvements: getImprovementSuggestions(validation)
    };
  }
};

// Specific: Clear and concrete
function checkSpecific(text) {
  const hasAction = /\b(tee|luo|korjaa|kehitä|suunnittele|toteuta)\b/i.test(text);
  const hasTarget = text.length > 15;
  const passed = hasAction && hasTarget;
  
  return {
    passed,
    feedback: passed ? '✅ Tavoite on konkreettinen' : '❌ Tee tavoitteesta tarkempi - mitä tarkalleen tehdään?',
    suggestion: 'Lisää verbi (tee, luo, korjaa) ja kerro tarkemmin mitä'
  };
}

// Measurable: Can track progress
function checkMeasurable(text) {
  const hasNumber = /\d+/.test(text);
  const hasMetric = /\b(prosentti|€|kpl|tuntia|päivä|viikko|valmis)\b/i.test(text);
  const passed = hasNumber || hasMetric;
  
  return {
    passed,
    feedback: passed ? '✅ Edistymisen voi mitata' : '❌ Miten tiedät milloin olet valmis?',
    suggestion: 'Lisää numero tai mittari (€500, 5 kpl, 100% valmis)'
  };
}

// Achievable: Realistic given resources
function checkAchievable(text, userContext) {
  const timeWords = text.match(/(\d+)\s*(tunti|päivä|viikko)/i);
  if (!timeWords) return { passed: true, feedback: '⚠️ Lisää aikataulu-arvio', suggestion: 'Arvioi kuinka kauan tämä kestää' };
  
  const estimatedHours = convertToHours(timeWords[1], timeWords[2]);
  const availableHours = userContext.weeklyAvailableHours || 40;
  const passed = estimatedHours <= availableHours * 1.2; // 20% buffer
  
  return {
    passed,
    feedback: passed ? '✅ Realistinen aikatauluun nähden' : '❌ Liian kunnianhimoinen käytettävissä olevaan aikaan nähden',
    suggestion: passed ? null : `Jaa pienempiin osiin tai varaa ${Math.ceil(estimatedHours)}h aikaa`
  };
}

// Relevant: Aligns with company goals
function checkRelevant(text, companyGoals) {
  const relevantKeywords = ['kurkipotku', 'diamondmanager', 'asiakas', 'tulo', 'myynti', 'tekniikka'];
  const hasRelevance = relevantKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  return {
    passed: hasRelevance,
    feedback: hasRelevance ? '✅ Liittyy yrityksen tavoitteisiin' : '❌ Miten tämä auttaa €1M tavoitteessa?',
    suggestion: 'Selitä yhteys Kurkipotku/DiamondManager kehitykseen tai asiakastyöhön'
  };
}

// Time-bound: Has clear deadline
function checkTimeBound(text) {
  const hasDeadline = /\b(mennessä|deadline|viikossa|päivässä|\d+\.\d+\.|\d+\/\d+)\b/i.test(text);
  const passed = hasDeadline;
  
  return {
    passed,
    feedback: passed ? '✅ Selkeä deadline' : '❌ Milloin tämän pitää olla valmis?',
    suggestion: 'Aseta tarkka päivämäärä tai aikaväli (esim. "perjantaihin mennessä")'
  };
}
Calendar Integration (KISS Approach)
javascript// /src/services/calendarIntegration.js
const CalendarIntegration = {
  // Automatically suggest calendar events for SMART goals
  generateCalendarSuggestion: (goalText, validation) => {
    const timeEstimate = extractTimeEstimate(goalText);
    const deadline = extractDeadline(goalText);
    const priority = calculatePriority(goalText);
    
    return {
      title: `🎯 ${goalText.substring(0, 50)}...`,
      description: `
        SMART-tavoite:
        ${goalText}
        
        Strateginen arvo: ${priority}/10
        Arvioitu kesto: ${timeEstimate}
        
        Luotu DiamondManager AI:lla
      `,
      duration: timeEstimate,
      deadline: deadline,
      suggestedTimeSlots: findOptimalTimeSlots(timeEstimate, deadline),
      reminderSettings: {
        beforeStart: ['1 day', '2 hours'],
        beforeDeadline: ['2 days', '1 day']
      }
    };
  },

  // Find best time slots based on user patterns
  findOptimalTimeSlots: (duration, deadline) => {
    const userPeakHours = getUserPeakHours(); // [9, 10, 11] for morning person
    const availableSlots = getAvailableSlots(deadline);
    
    // KISS: Simple scoring based on peak hours
    const scoredSlots = availableSlots.map(slot => ({
      ...slot,
      score: calculateTimeSlotScore(slot, userPeakHours, duration)
    }));
    
    return scoredSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3 suggestions
      .map(slot => ({
        start: slot.start,
        end: slot.end, 
        reason: getTimeSlotReason(slot, userPeakHours),
        confidence: Math.round(slot.score * 100)
      }));
  }
};

// Helper functions (KISS implementations)
function extractTimeEstimate(text) {
  const match = text.match(/(\d+)\s*(tunti|päivä|viikko)/i);
  if (!match) return '2 hours'; // Default estimate
  
  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit.includes('tunti')) return `${amount} hours`;
  if (unit.includes('päivä')) return `${amount * 6} hours`; // 6 productive hours/day
  if (unit.includes('viikko')) return `${amount * 30} hours`; // 30 hours/week
  
  return '2 hours';
}

function extractDeadline(text) {
  // KISS: Look for common Finnish deadline patterns
  const patterns = [
    /(\d+)\.(\d+)\.(\d+)/,  // 15.12.2024
    /(\d+)\/(\d+)/,         // 15/12
    /(maanantai|tiistai|keskiviikko|torstai|perjantai|lauantai|sunnuntai)/i,
    /(tänään|huomenna|ylihuomenna)/i,
    /(\d+)\s*(päivä|viikko)\s*kuluttua/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseDeadlineFromMatch(match);
  }
  
  // Default: one week from now
  const oneWeek = new Date();
  oneWeek.setDate(oneWeek.getDate() + 7);
  return oneWeek;
}

function calculatePriority(text) {
  // KISS: Keyword-based priority scoring
  const highPriorityWords = ['kriittinen', 'kiireellinen', 'deadline', 'asiakas'];
  const strategicWords = ['kurkipotku', 'tulo', 'myynti', 'kasvu'];
  
  let score = 5; // Base priority
  
  highPriorityWords.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 2;
  });
  
  strategicWords.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 1;
  });
  
  return Math.min(score, 10);
}
User Interface Components
jsx// /src/components/SMARTGoalInput.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';

const SMARTGoalInput = ({ onGoalCreated }) => {
  const [goalText, setGoalText] = useState('');
  const [validation, setValidation] = useState(null);
  const [showCalendarSuggestion, setShowCalendarSuggestion] = useState(false);

  useEffect(() => {
    if (goalText.length > 10) {
      const result = SMARTGoalValidator.validateGoal(goalText, userContext, companyGoals);
      setValidation(result);
    }
  }, [goalText]);

  return (
    <div className="smart-goal-input">
      <div className="input-section">
        <label className="block text-sm font-medium mb-2">
          Luo SMART-tavoite (tutkimukseen perustuva validointi)
        </label>
        
        <textarea
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          placeholder="Esim: Toteuta DiamondManager authentication-järjestelmä 15 tunnissa perjantaihin mennessä"
          className="w-full p-3 border rounded-lg focus:border-blue-500"
          rows="3"
        />
      </div>

      {validation && (
        <div className="validation-feedback mt-4">
          <div className="validation-score mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SMART-pisteet:</span>
              <span className={`font-bold ${validation.score >= 0.8 ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.round(validation.score * 100)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${validation.score >= 0.8 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${validation.score * 100}%` }}
              />
            </div>
          </div>

          <div className="validation-criteria space-y-2">
            {Object.entries(validation.validation).map(([criterion, result]) => (
              <div key={criterion} className="flex items-center space-x-2 text-sm">
                {result.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="capitalize font-medium">{criterion}:</span>
                <span className={result.passed ? 'text-green-700' : 'text-red-700'}>
                  {result.feedback}
                </span>
              </div>
            ))}
          </div>

          {!validation.isReady && (
            <div className="improvement-suggestions mt-3 p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Parannusehdotukset:</h4>
              <ul className="space-y-1">
                {validation.improvements.map((improvement, idx) => (
                  <li key={idx} className="text-sm text-orange-700">
                    • {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.isReady && validation.calendarSuggestion && (
            <div className="calendar-suggestion mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Kalenteriehdotus</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Kesto: {validation.calendarSuggestion.duration}</span>
                </div>
                
                <div className="text-blue-700">
                  <strong>Parhaat ajat:</strong>
                  <ul className="mt-1 space-y-1">
                    {validation.calendarSuggestion.suggestedTimeSlots.map((slot, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{slot.start} - {slot.end}</span>
                        <span className="text-xs">({slot.reason})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => addToCalendar(validation.calendarSuggestion)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                📅 Lisää kalenteriin
              </button>
            </div>
          )}

          <div className="action-buttons mt-4 flex space-x-3">
            <button
              onClick={() => onGoalCreated(goalText, validation)}
              disabled={!validation.isReady}
              className={`px-4 py-2 rounded-lg font-medium ${
                validation.isReady
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {validation.isReady ? '✅ Luo tavoite' : '⏳ Paranna ensin'}
            </button>
            
            {validation.score >= 0.6 && !validation.isReady && (
              <button
                onClick={() => onGoalCreated(goalText, validation, { force: true })}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                🚀 Luo silti (ei-optimaalinen)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SMARTGoalInput;
Database Schema (KISS)
javascript// /src/models/SMARTGoal.js
const SMARTGoalSchema = new mongoose.Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  
  // Goal content
  title: { type: String, required: true, maxLength: 200 },
  description: { type: String, maxLength: 1000 },
  
  // SMART validation results
  smartScore: { type: Number, min: 0, max: 1, required: true },
  smartCriteria: {
    specific: { passed: Boolean, feedback: String },
    measurable: { passed: Boolean, feedback: String },
    achievable: { passed: Boolean, feedback: String },
    relevant: { passed: Boolean, feedback: String },
    timeBound: { passed: Boolean, feedback: String }
  },
  
  // Scheduling
  estimatedHours: { type: Number, default: 2 },
  deadline: { type: Date, required: true },
  scheduledTimeSlots: [{
    start: Date,
    end: Date,
    calendarEventId: String,
    status: { type: String, enum: ['planned', 'confirmed', 'completed'], default: 'planned' }
  }],
  
  // Progress tracking
  status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'], default: 'active' },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  
  // Research tracking
  createdViaResearch: { type: Boolean, default: true },
  researchMethodsApplied: [String], // ['SMART', 'calendar-optimization', 'peak-hours']
  
  timestamps: true
});

// Automatic calendar integration
SMARTGoalSchema.post('save', async function(goal) {
  if (goal.isNew && goal.scheduledTimeSlots.length > 0) {
    await CalendarIntegration.createCalendarEvents(goal);
  }
});

module.exports = mongoose.model('SMARTGoal', SMARTGoalSchema);
API Endpoints (KISS)
javascript// /src/routes/smartGoals.js
const express = require('express');
const router = express.Router();

// POST /api/v1/smart-goals/validate
router.post('/validate', async (req, res) => {
  try {
    const { goalText } = req.body;
    const userContext = await getUserContext(req.user.id);
    const companyGoals = await getCompanyGoals();
    
    const validation = SMARTGoalValidator.validateGoal(goalText, userContext, companyGoals);
    
    res.json({
      success: true,
      validation,
      calendarSuggestion: validation.isReady ? 
        CalendarIntegration.generateCalendarSuggestion(goalText, validation) : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/smart-goals
router.post('/', async (req, res) => {
  try {
    const { goalText, validation, calendarSlots, force = false } = req.body;
    
    if (!validation.isReady && !force) {
      return res.status(400).json({ 
        success: false, 
        error: 'Goal must pass SMART validation or use force=true' 
      });
    }
    
    const goal = new SMARTGoal({
      userId: req.user.id,
      title: goalText,
      smartScore: validation.score,
      smartCriteria: validation.validation,
      deadline: validation.calendarSuggestion?.deadline || new Date(Date.now() + 7*24*60*60*1000),
      scheduledTimeSlots: calendarSlots || [],
      researchMethodsApplied: ['SMART', 'calendar-optimization']
    });
    
    await goal.save();
    
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

🎯 Implementation Checklist
Phase 1: Core SMART Validation (Week 1)

 Implement SMARTGoalValidator service
 Create validation UI component
 Add database schema
 Test with sample goals

Phase 2: Calendar Integration (Week 2)

 Build CalendarIntegration service
 Add time slot optimization
 Connect to calendar APIs (Google/Outlook)
 Test automatic scheduling

Phase 3: User Experience (Week 3)

 Polish UI feedback
 Add improvement suggestions
 Implement goal tracking
 User testing and refinement