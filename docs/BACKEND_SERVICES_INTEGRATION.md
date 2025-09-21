# 🔗 Backend Services Integration Guide

**DiamondManager Cloud-Based Architecture**  
**All services are production-ready and operational on Railway**

## 🌐 Service Architecture Overview

DiamondManager operates as a **frontend-only React application** that integrates with existing, proven Diamond Makers microservices. All backend services are cloud-hosted, documented, and operational 24/7.

**No local backend development** - All testing and development uses live production services.

## 🚀 Production Service Endpoints

### 1. **Authentication Service** ✅ OPERATIONAL
```
Base URL: https://newapp-backend-production.up.railway.app
Health Check: https://newapp-backend-production.up.railway.app/health
API Version: v1
Status: ✅ Production Ready & Tested
```

#### DiamondManager Authentication:
```javascript
// Team Member Login
POST https://newapp-backend-production.up.railway.app/api/v1/auth/login
Headers: {
  'Content-Type': 'application/json',
  'x-app-id': 'diamondmanager'  // Critical for proper app context
}
Body: {
  "email": "tommi@diamondmakers.com",
  "password": "user_password"
}

// Response Format:
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "tommi@diamondmakers.com",
    "firstName": "Tommi",
    "lastName": "Admin", 
    "role": "admin",
    "appId": "diamondmanager"
  }
}
```

#### Token Verification:
```javascript
POST https://newapp-backend-production.up.railway.app/api/v1/auth/verify-token
Headers: {
  'Content-Type': 'application/json',
  'x-app-id': 'diamondmanager'
}
Body: {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. **User Service** ✅ OPERATIONAL
```
Base URL: https://user-service-production-840d.up.railway.app
Health Check: https://user-service-production-840d.up.railway.app/health
API Version: v1
Status: ✅ Production Ready & Tested
```

#### User Profile Management:
```javascript
// Get User Profile
GET https://user-service-production-840d.up.railway.app/api/v1/users/profile
Headers: {
  'Authorization': 'Bearer JWT_TOKEN',
  'Content-Type': 'application/json'
}

// Update Profile
PATCH https://user-service-production-840d.up.railway.app/api/v1/users/profile
Headers: {
  'Authorization': 'Bearer JWT_TOKEN',
  'Content-Type': 'application/json'
}
Body: {
  "firstName": "Updated Name",
  "profilePicture": "https://example.com/image.jpg"
}

// **EXTEND FOR DIAMONDMANAGER**: Goals endpoints (to be implemented)
POST https://user-service-production-840d.up.railway.app/api/v1/users/goals
GET https://user-service-production-840d.up.railway.app/api/v1/users/goals
PUT https://user-service-production-840d.up.railway.app/api/v1/users/goals/:goalId
DELETE https://user-service-production-840d.up.railway.app/api/v1/users/goals/:goalId
```

### 3. **Team Service** ✅ OPERATIONAL
```
Base URL: https://team-service-production.up.railway.app
Health Check: https://team-service-production.up.railway.app/health
API Version: v1  
Status: ✅ Production Ready & Tested
```

#### Team Management:
```javascript
// Get Teams (Diamond Makers team)
GET https://team-service-production.up.railway.app/api/v1/teams
Headers: {
  'Authorization': 'Bearer JWT_TOKEN',
  'Content-Type': 'application/json'
}

// Get Team Details
GET https://team-service-production.up.railway.app/api/v1/teams/:teamId
Headers: {
  'Authorization': 'Bearer JWT_TOKEN',
  'Content-Type': 'application/json'
}

// Team Members
GET https://team-service-production.up.railway.app/api/v1/teams/:teamId/members
Headers: {
  'Authorization': 'Bearer JWT_TOKEN',
  'Content-Type': 'application/json'
}

// **EXTEND FOR DIAMONDMANAGER**: Project management endpoints (to be implemented)
POST https://team-service-production.up.railway.app/api/v1/teams/:teamId/projects
GET https://team-service-production.up.railway.app/api/v1/teams/:teamId/projects  
PUT https://team-service-production.up.railway.app/api/v1/teams/:teamId/projects/:projectId
```

### 4. **Feedback Service** ✅ OPERATIONAL
```
Base URL: https://feedback-service-production-555d.up.railway.app
Health Check: https://feedback-service-production-555d.up.railway.app/health
API Version: v1
Status: ✅ Production Ready & Tested
```

#### Feedback Management:
```javascript
// Submit Feedback
POST https://feedback-service-production-555d.up.railway.app/api/v1/feedback
Headers: {
  'Authorization': 'Bearer JWT_TOKEN',
  'Content-Type': 'application/json'
}
Body: {
  "type": "peer_review",
  "targetUser": "mikko@diamondmakers.com",
  "category": "technical_skills",
  "rating": 4.5,
  "content": "Excellent work on the authentication system",
  "visibility": "private"
}

// Get Feedback (sent by user)
GET https://feedback-service-production-555d.up.railway.app/api/v1/feedback/sent
Headers: {
  'Authorization': 'Bearer JWT_TOKEN'
}

// Get Feedback (received by user)  
GET https://feedback-service-production-555d.up.railway.app/api/v1/feedback/received
Headers: {
  'Authorization': 'Bearer JWT_TOKEN'
}

// **EXTEND FOR DIAMONDMANAGER**: AI coaching integration (to be implemented)
POST https://feedback-service-production-555d.up.railway.app/api/v1/feedback/ai-coaching
GET https://feedback-service-production-555d.up.railway.app/api/v1/feedback/analytics
```

### 5. **Diamond Coach Service** 🆕 TO BE BUILT
```
Base URL: https://diamond-coach-service.up.railway.app
Health Check: https://diamond-coach-service.up.railway.app/health
API Version: v1
Status: 🚧 Phase 3 Development
```

#### AI Coaching Endpoints (Planned):
```javascript
// Start Coaching Session
POST https://diamond-coach-service.up.railway.app/api/v1/coaching/sessions
Headers: {
  'Authorization': 'Bearer JWT_TOKEN',
  'Content-Type': 'application/json'
}
Body: {
  "sessionType": "goal_review",
  "context": "struggling with task prioritization"
}

// Send Message to AI Coach
POST https://diamond-coach-service.up.railway.app/api/v1/coaching/sessions/:sessionId/messages
Body: {
  "message": "I'm having trouble staying focused on my goals"
}

// Get Coaching History
GET https://diamond-coach-service.up.railway.app/api/v1/coaching/sessions
```

## 🎯 DiamondManager Team Members

### **Configured Team Accounts** (users_diamondmanager collection):
```javascript
DIAMOND_MAKERS_TEAM = {
  admin: {
    email: "tommi@diamondmakers.com",
    name: "Tommi",
    role: "admin",
    access: ["all_features", "innovation_hub", "team_management"]
  },
  manager: {
    email: "janne@diamondmakers.com", 
    name: "Janne",
    role: "manager",
    access: ["team_coordination", "client_projects", "limited_innovation"]
  },
  developers: [
    {
      email: "mikko@diamondmakers.com",
      name: "Mikko", 
      role: "employee",
      access: ["development_tasks", "peer_collaboration"]
    },
    {
      email: "juhani@diamondmakers.com",
      name: "Juhani",
      role: "employee", 
      access: ["development_tasks", "peer_collaboration"]
    }
  ]
}
```

## 🧪 Service Testing & Validation

### **Health Check Commands** (WSL2 + Windows):
```bash
# Test all services are operational
curl.exe -I https://newapp-backend-production.up.railway.app/health
curl.exe -I https://user-service-production-840d.up.railway.app/health
curl.exe -I https://team-service-production.up.railway.app/health  
curl.exe -I https://feedback-service-production-555d.up.railway.app/health
```

### **Authentication Testing**:
```bash
# Test DiamondManager login
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-app-id: diamondmanager" \
  -d '{"email":"tommi@diamondmakers.com","password":"actual_password"}'

# Expected Response: HTTP 200 with JWT token and user details
```

### **Service Integration Testing**:
```bash
# Test user service with valid token
curl.exe -X GET "https://user-service-production-840d.up.railway.app/api/v1/users/profile" \
  -H "Authorization: Bearer VALID_JWT_TOKEN"

# Test team service with valid token  
curl.exe -X GET "https://team-service-production.up.railway.app/api/v1/teams" \
  -H "Authorization: Bearer VALID_JWT_TOKEN"
```

## 📚 Existing Service Documentation References

### **EXISTING COMPREHENSIVE API DOCUMENTATION** ✅
- **Complete API Guide**: `../newapp/DOCUMENTATION/API/COMPREHENSIVE_API_DOCUMENTATION_FOR_FRONTEND.md`
- **Frontend Integration Examples**: `../newapp/DOCUMENTATION/API/FRONTEND_INTEGRATION_EXAMPLES.md`
- **Railway Services Reference**: `../newapp/DOCUMENTATION/COMPLETE_RAILWAY_SERVICES_API_REFERENCE.md`
- **Janne's Design Guide**: `../newapp/frontend/JANNE_TYOOHJE.md` (Visual design reference)

### **Service Architecture (Already Documented):**
- **JWT Delegation Pattern**: All 5 services operational with centralized token validation
- **Multi-App Setup**: DiamondManager app context (`x-app-id: diamondmanager`) configured
- **Database Collections**: users_diamondmanager collection ready and tested
- **CORS Configuration**: All services properly configured for frontend integration

### **Documented Test Credentials (Production Working):**
- **Admin User**: `tommi@kurkipotku.com` / `asdf1234` ✅ Tested & Working
- **Regular User**: `tommi1984@protonmail.com` / `asdf1234` ✅ Tested & Working
- **Service Status**: 100% Success Rate on all 5 Railway services
- **Last Verified**: All services operational as of comprehensive testing

### **Additional Documentation:**
- **Multi-App Implementation**: `../newapp/auth-service/docs/MULTI_APP_IMPLEMENTATION.md`
- **Testing Coverage**: `../newapp/auth-service/docs/TESTING_COVERAGE_REPORT.md`
- **CORS Resolution**: `../newapp/auth-service/docs/CORS_RESOLUTION_FINDINGS.md`

## 🔐 Security & Access

### **Service Security Features:**
- ✅ **JWT Delegation Pattern**: Centralized token authority
- ✅ **Role-Based Access Control**: Admin, manager, employee roles
- ✅ **Company Email Restriction**: @diamondmakers.com enforcement
- ✅ **App Context Isolation**: DiamondManager data separate from other apps
- ✅ **HTTPS Encryption**: All service communication encrypted

### **Authentication Flow:**
1. User logs in via DiamondManager frontend
2. Frontend sends credentials to auth-service with `x-app-id: diamondmanager`
3. Auth-service validates and returns JWT with DiamondManager context
4. Frontend uses JWT for all subsequent API calls to other services
5. Services validate JWT via auth-service delegation pattern

## ⚡ Development Integration

### **React Service Integration Pattern:**
```javascript
// /src/services/authService.js
const API_BASE = 'https://newapp-backend-production.up.railway.app/api/v1';

export const authService = {
  async login(email, password) {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    }, {
      headers: {
        'x-app-id': 'diamondmanager'  // Critical for proper app context
      }
    });
    return response.data;
  },

  async verifyToken(token) {
    const response = await axios.post(`${API_BASE}/auth/verify-token`, {
      token
    }, {
      headers: {
        'x-app-id': 'diamondmanager'
      }
    });
    return response.data;
  }
};
```

### **API Response Handling:**
```javascript
// Standard error handling for all services
const handleAPIError = (error) => {
  if (error.response?.status === 401) {
    // Token expired or invalid - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Insufficient permissions
    toast.error('Access denied');
  } else {
    // General error
    toast.error('Service unavailable. Please try again.');
  }
};
```

## 🚀 Deployment & Environment

### **Production Configuration:**
- **All services on Railway**: Independent, scalable microservices
- **24/7 Availability**: Production-grade uptime and monitoring  
- **Automatic Scaling**: Railway handles traffic scaling
- **Health Monitoring**: Continuous health checks and alerting

### **Environment Variables for DiamondManager:**
```javascript
// Production Railway environment variables
REACT_APP_AUTH_SERVICE_URL=https://newapp-backend-production.up.railway.app
REACT_APP_USER_SERVICE_URL=https://user-service-production-840d.up.railway.app
REACT_APP_TEAM_SERVICE_URL=https://team-service-production.up.railway.app  
REACT_APP_FEEDBACK_SERVICE_URL=https://feedback-service-production-555d.up.railway.app
```

**No local services** - All development and testing uses live production endpoints with proper authentication and error handling.

---

**Status**: ✅ **All Backend Services Operational**  
**Integration**: Ready for DiamondManager React frontend development  
**Testing**: Real-time testing against production services  
**Documentation**: Complete service integration guide available