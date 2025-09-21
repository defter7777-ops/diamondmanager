# 💎 DiamondManager - Team Collaboration Platform

**Diamond Makers Internal Team Collaboration Platform**  
**Future SaaS Product for Client Teams**

## 🎯 Vision
Transform how Diamond Makers team collaborates internally, then scale as a SaaS product for client teams worldwide.

## 👥 Team Members
- **Tommi** - Founder & Lead Developer  
- **Janne** - Co-founder & Strategy
- **Mikko** - Developer & Technical Implementation
- **Juhani** - Developer & System Architecture

## 🏗️ Architecture

### Frontend (This Repository)
- **React.js** with modern hooks and context
- **TailwindCSS** for consistent styling  
- **Component-based architecture** for reusability
- **Service layer** for backend integration

### Backend (Existing Microservices)
- **auth-service**: Team member authentication (`users_diamondmanager`)
- **user-service**: Personal profiles and goal management
- **team-service**: Diamond Makers team structure and projects
- **feedback-service**: Peer feedback and AI-enhanced coaching
- **diamond-coach-service**: AI assistant (to be built)

### Database Strategy
- **MongoDB Atlas** (shared with existing services)
- **DiamondManager Collections**: 
  - `users_diamondmanager` (existing)
  - `diamondmanager_goals`
  - `diamondmanager_tasks` 
  - `diamondmanager_innovations`

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Development server
npm start

# Build for production
npm run build

# Deploy to Railway
railway up
```

## 🚀 Deployment

**Production URL**: `https://diamondmanager-frontend.up.railway.app`  
**Backend Services**: Existing Diamond Makers microservice infrastructure

## 📋 Features

### Phase 1: Core Team Features
- [x] Team member authentication
- [ ] Personal goal management (private/public)
- [ ] Basic task documentation
- [ ] Peer feedback system

### Phase 2: Enhanced Collaboration  
- [ ] AI-powered task assistance
- [ ] Team goal coordination
- [ ] Achievement reporting
- [ ] Meeting scheduling suggestions

### Phase 3: Innovation & AI
- [ ] Diamond Coach AI assistant
- [ ] Confidential innovation tracking
- [ ] Advanced analytics and reports
- [ ] Smart scheduling optimization

### Phase 4: SaaS Preparation
- [ ] Multi-client architecture
- [ ] Advanced admin controls
- [ ] Billing and subscription management
- [ ] White-label customization

## 🎨 Design System

**Reference**: Diamond Makers visual identity and existing frontend components  
**Graphics**: Leverage DiamondCach design elements  
**Login/Pages**: Adapt existing authentication and layout patterns

## 🔧 Development Setup

```bash
# Environment variables
cp .env.example .env

# Required environment variables:
REACT_APP_AUTH_SERVICE_URL=https://newapp-backend-production.up.railway.app
REACT_APP_USER_SERVICE_URL=https://user-service-production-840d.up.railway.app  
REACT_APP_TEAM_SERVICE_URL=https://team-service-production.up.railway.app
REACT_APP_FEEDBACK_SERVICE_URL=https://feedback-service-production-555d.up.railway.app
```

## 📚 Documentation

- `docs/API_INTEGRATION.md` - Backend service integration
- `docs/FEATURE_SPECS.md` - Detailed feature specifications  
- `docs/DEPLOYMENT_GUIDE.md` - Railway deployment instructions
- `AI_COLLAB_ONBOARDING.md` - AI assistant collaboration guide
- `TASK.md` - Project task management

## 🎯 Success Metrics

**Internal Success**:
- All 4 team members actively using the platform
- Improved goal achievement rates with AI coaching
- Enhanced team communication and task completion

**SaaS Success**: 
- Platform ready for external client deployment
- Proven ROI and productivity improvements
- Scalable architecture for multi-tenant use

---

**Status**: 🚧 In Development  
**Timeline**: 4 weeks to production-ready SaaS  
**Architecture**: Frontend-only leveraging existing backend microservices ✅