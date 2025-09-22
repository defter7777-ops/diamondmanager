/**
 * Profile Service for DiamondManager - User Superpowers & Skills
 * Manages individual team member strengths, skills, and preferences
 */

class ProfileService {
  constructor() {
    this.storageKey = 'diamondmanager_user_profiles';
  }

  /**
   * Get user profile with superpowers
   */
  getUserProfile(userId) {
    const profiles = this.getAllProfiles();
    return profiles[userId] || null;
  }

  /**
   * Save or update user profile with superpowers
   */
  saveUserProfile(userId, profileData) {
    const profiles = this.getAllProfiles();
    
    profiles[userId] = {
      ...profiles[userId],
      ...profileData,
      lastUpdated: new Date().toISOString(),
      userId
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(profiles));
    console.log('✅ Profile saved for user:', userId);
    return profiles[userId];
  }

  /**
   * Check if user has completed superpower onboarding
   */
  hasSuperpowerProfile(userId) {
    const profile = this.getUserProfile(userId);
    return profile && profile.superpowers && profile.superpowers.length > 0;
  }

  /**
   * Get all team member profiles
   */
  getAllProfiles() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading profiles:', error);
      return {};
    }
  }

  /**
   * Generate superpower onboarding questions
   */
  getSuperpowerQuestions() {
    return {
      welcome: `🌟 **Tervetuloa DiamondManageriin!** 

Ennen kuin aloitamme, kerro minulle superpowereistasi! Tämä auttaa minua:
• 🎯 Ehdottamaan sinulle sopivia tehtäviä
• 🤝 Yhdistämään sinut oikeiden tiimin jäsenten kanssa
• 💡 Antamaan parempia neuvoja ja tukea

**Kerro minulle 3-5 asiaa, joissa olet todella hyvä:**`,
      
      examples: [
        "Esim: 'Olen hyvä UX-suunnittelussa, visuaalisessa designissa ja käyttäjätutkimuksessa'",
        "Esim: 'Hallitsen backend-kehityksen, API-integraatiot ja tietokannat'", 
        "Esim: 'Osaan myyntiä, asiakassuhteita ja neuvottelua'",
        "Esim: 'Olen hyvä strategisessa suunnittelussa, projektijohtamisessa ja tiimin koordinoinnissa'"
      ],

      followUp: `💪 **Kiitos! Muutama lisäkysymys:**

1. **Mikä on työtyylisi?** (Esim: 'Keskityn aamuisin, pidän syvästä työstä')
2. **Millaisissa projekteissa viihdyt?** (Esim: 'Luovat haasteet, tekninen ongelmanratkaisu') 
3. **Miten haluat että tiimi hyödyntää osaamistasi?** (Esim: 'Konsultointi, mentorointi, hands-on tekeminen')`,

      completion: `🎉 **Mahtava! Profiilisi on nyt valmis!**

Nyt osaan:
• Ehdottaa sinulle sopivia tehtäviä
• Yhdistää sinut oikeiden tiimin jäsenten kanssa projekteihin
• Antaa henkilökohtaisia neuvoja ja tukea

**Voit päivittää superpowereitasi milloin tahansa sanomalla:**
• "Päivitä superpowerini" 
• "Lisää uusi taito: [taito]"
• "Muuta työtyylini"`
    };
  }

  /**
   * Parse superpowers from user message
   */
  parseSuperpowersFromMessage(message) {
    const text = message.toLowerCase();
    
    // Common Finnish patterns for describing skills
    const patterns = [
      /olen hyvä (.+)/g,
      /osaan (.+)/g,
      /hallitsen (.+)/g,
      /erikoisalani on (.+)/g,
      /vahvuuteni on (.+)/g,
      /superpowerini ovat? (.+)/g
    ];

    const superpowers = [];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Split by common separators and clean up
        const skills = match[1]
          .split(/[,;]|ja\s+|\s+sekä\s+/)
          .map(skill => skill.trim())
          .filter(skill => skill.length > 2);
        
        superpowers.push(...skills);
      }
    });

    // If no patterns matched, try to extract skills from bullet points or lists
    if (superpowers.length === 0) {
      const lines = message.split(/\n|•|-/).filter(line => line.trim().length > 3);
      lines.forEach(line => {
        const cleaned = line.trim().replace(/^\d+\.?\s*/, '');
        if (cleaned.length > 5) {
          superpowers.push(cleaned);
        }
      });
    }

    return superpowers.slice(0, 8); // Max 8 superpowers
  }

  /**
   * Generate team collaboration suggestions based on superpowers
   */
  generateTeamSuggestions(userId, taskDescription) {
    const profiles = this.getAllProfiles();
    const currentUser = this.getUserProfile(userId);
    
    if (!currentUser || !currentUser.superpowers) return null;

    const suggestions = [];
    const taskLower = taskDescription.toLowerCase();

    // Match skills to task requirements
    Object.entries(profiles).forEach(([memberId, profile]) => {
      if (memberId === userId || !profile.superpowers) return;

      const relevantSkills = profile.superpowers.filter(skill => {
        const skillLower = skill.toLowerCase();
        return taskLower.includes(skillLower) || 
               skillLower.split(' ').some(word => taskLower.includes(word));
      });

      if (relevantSkills.length > 0) {
        suggestions.push({
          userId: memberId,
          name: profile.name || profile.firstName || memberId,
          relevantSkills,
          matchScore: relevantSkills.length
        });
      }
    });

    return suggestions.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Get team superpowers overview
   */
  getTeamSuperpowersOverview() {
    const profiles = this.getAllProfiles();
    const overview = {};

    Object.entries(profiles).forEach(([userId, profile]) => {
      if (profile.superpowers && profile.superpowers.length > 0) {
        overview[profile.name || profile.firstName || userId] = {
          superpowers: profile.superpowers,
          workingStyle: profile.workingStyle || 'Ei määritelty',
          lastUpdated: profile.lastUpdated
        };
      }
    });

    return overview;
  }

  /**
   * Check if it's time to ask for superpower updates
   */
  shouldAskForSuperpowerUpdate(userId) {
    const profile = this.getUserProfile(userId);
    if (!profile || !profile.lastUpdated) return false;

    const lastUpdate = new Date(profile.lastUpdated);
    const weeksSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 7);
    
    // Ask for updates every 4 weeks
    return weeksSinceUpdate > 4;
  }
}

// Export singleton instance
const profileService = new ProfileService();
export default profileService;