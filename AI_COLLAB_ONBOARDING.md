# 🤖 DiamondManager AI COLLABORATION ONBOARDING v1.0

**START HERE FIRST** - This is the single source of truth for AI collaborators joining DiamondManager development.

## 📋 Quick Navigation for AI Assistants
- [🎯 DiamondManager Project Goals](#diamondmanager-project-goals) ← **START HERE for context**
- [👥 Diamond Makers Team](#diamond-makers-team) ← **Know the team**
- [🏗️ Architecture Overview](#architecture-overview) ← **Understand the system**
- [🔐 Backend Integration](#backend-service-integration) ← **Critical for development**
- [🚨 Current Issues & Errors](#common-error-patterns--solutions) ← **For troubleshooting**
- [🎨 Design System](#design-system-reference) ← **Visual consistency**

## 🎯 DiamondManager Project Goals

### **Primary Mission**
Create an internal team collaboration platform for Diamond Makers that becomes a production-ready SaaS product.

### **Team Members (Authentication Ready)**
- **Tommi** (`tommi@diamondmakers.com`) - Founder, admin role
- **Janne** (`janne@diamondmakers.com`) - Co-founder, manager role  
- **Mikko** (`mikko@diamondmakers.com`) - Developer, employee role
- **Juhani** (`juhani@diamondmakers.com`) - Developer, employee role

### **Core Features to Build**
1. **Goal Management**: Personal and company goals (private/public)
2. **Task Documentation**: AI-assisted task management and documentation
3. **Peer Feedback**: AI-enhanced feedback system between team members
4. **Achievement Reports**: Progress tracking and analytics
5. **Meeting Coordination**: AI-suggested scheduling and meeting management
6. **Innovation Tracking**: Confidential project management (strictly secret)
7. **Diamond Coach AI**: AI sparring partner for tasks and goals

### **Success Criteria**
- [ ] All 4 team members actively using the platform
- [ ] Improved goal achievement rates with AI coaching
- [ ] Enhanced team communication and collaboration
- [ ] Production-ready SaaS platform for client deployment

## 👥 Diamond Makers Team

### **Team Structure**
```javascript
DIAMOND_MAKERS_TEAM = {
  founders: ["Tommi", "Janne"],
  developers: ["Mikko", "Juhani"],
  totalMembers: 4,
  workingStyle: "AI-assisted development with structured task management",
  communication: "Slack + DiamondManager platform",
  goals: "Individual + team + company level goal tracking"
}
```

### **Access Levels**
- **Admin**: Tommi - Full system access, innovation projects
- **Manager**: Janne - Team coordination, client projects, some innovation access
- **Employee**: Mikko, Juhani - Development tasks, peer collaboration, limited innovation access

## 🏗️ Architecture Overview

### **Frontend-Only Strategy** ✅
DiamondManager is a **React frontend** that connects to existing Diamond Makers backend microservices.

```
DiamondManager Frontend (React) 
    ↓ API calls
Existing Backend Services:
├── auth-service (team authentication)
├── user-service (profiles + goals) 
├── team-service (team management)
├── feedback-service (peer feedback)
└── diamond-coach-service (AI assistant) [TO BE BUILT]
```

### **Database Collections**
```javascript
// Existing (Ready to use)
users_diamondmanager  // Team member authentication ✅
teams                 // Diamond Makers team structure ✅  
feedback             // Basic peer feedback ✅

// New (DiamondManager specific)
diamondmanager_goals        // Personal/team goals
diamondmanager_tasks        // Task management
diamondmanager_achievements // Progress tracking  
diamondmanager_innovations  // Confidential projects
diamondmanager_coaching     // AI coaching sessions
```

## 🔐 Backend Service Integration

### **Authentication Service** ✅ Ready
```javascript
// Login endpoint for team members
POST https://newapp-backend-production.up.railway.app/api/v1/auth/login
Headers: { 'x-app-id': 'diamondmanager' }
Body: { email: 'tommi@diamondmakers.com', password: 'password' }

// Returns JWT token with DiamondManager app context
Response: {
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { id, email, role, appId: 'diamondmanager' }
}
```

### **User Service** - Extend for Goals
```javascript
// Get user profile
GET https://user-service-production-840d.up.railway.app/api/v1/users/profile
Headers: { Authorization: 'Bearer JWT_TOKEN' }

// EXTEND: Add goals endpoint
POST /api/v1/users/goals
{
  title: "Complete DiamondManager MVP",
  category: "company", 
  visibility: "public",
  targetDate: "2025-10-21",
  description: "Launch working DiamondManager platform"
}
```

### **Team Service** - Ready for Diamond Makers Team
```javascript
// Get Diamond Makers team
GET https://team-service-production.up.railway.app/api/v1/teams
Headers: { Authorization: 'Bearer JWT_TOKEN' }

// Team structure will include all 4 members with proper roles
```

### **Feedback Service** - Extend for AI Coaching
```javascript
// Submit peer feedback
POST https://feedback-service-production-555d.up.railway.app/api/v1/feedback
{
  type: "peer_review",
  targetUser: "mikko@diamondmakers.com",
  content: "Excellent work on the authentication refactor",
  category: "technical_skills",
  aiCoachingSuggestions: true
}
```

## 🎨 Design System Reference

### **Graphics Reference: DiamondCach**
- Leverage existing Diamond Makers visual identity
- Use DiamondCach design elements and color scheme
- Maintain consistent branding across Diamond Makers ecosystem

### **Component References**
```javascript
// Reuse from existing Diamond Makers projects:
LOGIN_COMPONENTS = "Auth forms, styling, validation from DiamondCach"
NAVIGATION = "Header, sidebar, menu components"  
FORMS = "Goal setting, task creation, feedback forms"
CHARTS = "Achievement reports, progress visualization"
MODALS = "Confirmations, AI coaching dialogs"
```

### **Color Palette & Styling**
- **Primary**: Diamond Makers brand colors
- **Framework**: TailwindCSS for consistency
- **Icons**: Heroicons for modern UI elements
- **Animations**: Framer Motion for smooth interactions

## 🚨 Common Error Patterns & Solutions

### **Backend Integration Issues**
```bash
# CORRECT: Use curl.exe in WSL2 for API testing
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-app-id: diamondmanager" \
  -d '{"email":"tommi@diamondmakers.com","password":"test123"}'

# WRONG: Direct curl may fail in WSL2
curl -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login"
```

### **Railway Deployment**
```bash
# CORRECT: Use PowerShell wrapper for Railway
powershell.exe -Command "railway status"
powershell.exe -Command "railway up"

# WRONG: Direct railway commands fail in WSL2  
railway status
```

### **CORS Issues**
- All backend services already configured for CORS ✅
- Frontend domain needs to be added to CORS origins when deploying
- Use proper authentication headers in all API calls

## ⚡ Quick Start Commands

```bash
# Create and setup DiamondManager project
cd /mnt/c/diamondmanager

# Install dependencies
npm install

# Start development server  
npm start

# Test backend integration
curl.exe -X GET "https://newapp-backend-production.up.railway.app/health"

# Deploy to Railway
powershell.exe -Command "railway up"
```

## 🧪 Development Testing

### **Test Users (Ready to Use)**
```javascript
TEST_USERS = {
  admin: { email: 'tommi@diamondmakers.com', password: 'asdf1234' },
  manager: { email: 'janne@diamondmakers.com', password: 'TBD' },
  developer1: { email: 'mikko@diamondmakers.com', password: 'TBD' },
  developer2: { email: 'juhani@diamondmakers.com', password: 'TBD' }
}
```

### **Backend Service Health Checks** (All Cloud-Based)
```bash
# IMPORTANT: All backend services are cloud-based on Railway - NO local services
# Verify all 5 production services are operational (documented and tested)
curl.exe https://newapp-backend-production.up.railway.app/health
curl.exe https://user-service-production-840d.up.railway.app/health  
curl.exe https://team-service-production.up.railway.app/health
curl.exe https://challenge-service-production.up.railway.app/health
curl.exe https://feedback-service-production-555d.up.railway.app/health

# Reference existing comprehensive API documentation:
# ../newapp/DOCUMENTATION/API/COMPREHENSIVE_API_DOCUMENTATION_FOR_FRONTEND.md
```

## 📚 When You Need More Information

### **Backend Service Documentation**
- `../newapp/auth-service/docs/` - Authentication system docs
- `../newapp/auth-service/docs/MULTI_APP_IMPLEMENTATION.md` - Multi-app setup
- `../newapp/auth-service/docs/TESTING_COVERAGE_REPORT.md` - Service testing

### **Project Structure Reference**
- `README.md` - Project overview and setup
- `TASK.md` - Current development tasks
- `docs/FEATURE_SPECS.md` - Detailed feature requirements
- `docs/API_INTEGRATION.md` - Backend integration guide

### **Development References**
- React.js best practices and hooks patterns
- TailwindCSS component styling
- Axios for API communication with proper error handling
- React Query for API state management

## 🔧 AI Assistant Debugging Toolkit

### **Environment Commands**
```bash
# Check Node.js version (should be 18+)
node --version  

# Check if Railway CLI accessible
powershell.exe -Command "railway --version"

# Test backend service connectivity
curl.exe -I https://newapp-backend-production.up.railway.app/health
```

### **Development Commands**
```bash
# Frontend development
npm start              # Start dev server
npm test              # Run tests
npm run build         # Production build
npm run lint          # Code linting

# API testing
npm run test:api      # Test backend integration
npm run test:auth     # Test authentication flow
```

### **Deployment Commands**  
```bash
# Railway deployment
powershell.exe -Command "railway status"
powershell.exe -Command "railway logs"
powershell.exe -Command "railway up"
```

---

## 🎯 DiamondManager Development Phases

### **Phase 1: Core Team Setup (Week 1)**
- [x] Project structure and documentation ✅
- [ ] React frontend foundation
- [ ] Team member authentication integration
- [ ] Basic user profiles and team structure
- [ ] Simple goal setting interface

### **Phase 2: Enhanced Features (Week 2-3)**  
- [ ] AI-assisted task documentation
- [ ] Peer feedback system with coaching suggestions
- [ ] Achievement reporting and progress tracking
- [ ] Meeting scheduling and coordination

### **Phase 3: AI Integration (Week 3-4)**
- [ ] Diamond Coach AI assistant backend service
- [ ] AI coaching conversations and suggestions
- [ ] Smart scheduling optimization
- [ ] Advanced analytics and insights

### **Phase 4: Innovation & Polish (Week 4+)**
- [ ] Confidential innovation project tracking
- [ ] Advanced reporting and team analytics
- [ ] SaaS preparation and multi-client architecture
- [ ] Production deployment and monitoring

---

**Last Updated**: September 21, 2025  
**Status**: 🚧 Phase 1 - Foundation Development  
**Next Milestone**: Basic React frontend with authentication integration  
**Architecture**: Frontend-only leveraging existing backend microservices ✅