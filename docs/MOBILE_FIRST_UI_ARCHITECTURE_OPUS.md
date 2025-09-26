# Mobile-First UI Architecture & 2025 Design Standards
**File:** `/docs/MOBILE_FIRST_UI_ARCHITECTURE.md`  
**Purpose:** Complete mobile optimization for DiamondManager with 2025 UI standards  
**KISS Principle:** Touch-first design, gesture navigation, thumb-friendly interactions  

---

## 🎯 **Core Mobile Requirements**

### **2025 Mobile Standards Compliance**
```css
/* Modern CSS Architecture */
.diamondmanager-mobile {
  /* Touch Optimization */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  
  /* iOS Safe Areas */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  
  /* Font Size Prevention (iOS Zoom) */
  font-size: max(16px, 1rem);
  
  /* Modern Container Queries */
  container-type: inline-size;
  
  /* Hardware Acceleration */
  transform: translateZ(0);
  will-change: transform;
}
```

### **Touch Target Specifications**
- **Minimum Size:** 44px × 44px (iOS Human Interface Guidelines)
- **Recommended Size:** 48dp × 48dp (Material Design)
- **Spacing:** 8px minimum between targets
- **Hit Area:** Extends beyond visual boundaries

---

## 📱 **Component Architecture**

### **1. Mobile Header Component**
```jsx
// /src/components/mobile/MobileHeader.jsx
const MobileHeader = ({ activeTab, selectedTask, onTabChange }) => (
  <header className="mobile-header">
    {/* Compact Logo */}
    <div className="header-brand">
      <img src="/diamond_manager_logo.png" className="w-8 h-8" />
      <span className="text-sm font-medium">DiamondManager</span>
    </div>
    
    {/* Tab Pills - Horizontal Scroll */}
    <ScrollableTabBar 
      tabs={['💎 DM', '👤 Omat', '🎯 Goals']}
      active={activeTab}
      onChange={onTabChange}
    />
    
    {/* Selected Task Indicator */}
    {selectedTask && (
      <TaskIndicator 
        task={selectedTask}
        onClear={() => setSelectedTask(null)}
      />
    )}
  </header>
);
```

### **2. Touch-Optimized Task Cards**
```jsx
// /src/components/mobile/TouchTaskCard.jsx
const TouchTaskCard = ({ task, onSelect, onComplete, onEdit }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <motion.div
      className="touch-task-card"
      whileTap={{ scale: 0.98 }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {/* Large Touch Target */}
      <div className="task-content min-h-[60px] p-4">
        <div className="task-header">
          <span className="priority-badge">{task.priority}</span>
          <h3 className="task-title text-base font-medium">{task.title}</h3>
        </div>
        
        {/* Progress Bar - Visual Feedback */}
        <ProgressBar value={task.completion} className="mt-2" />
        
        {/* Swipe Actions Hint */}
        <div className="swipe-hint">
          <span>← 完成</span>
          <span>編集 →</span>
        </div>
      </div>
    </motion.div>
  );
};
```

### **3. Gesture Navigation System**
```jsx
// /src/hooks/useGestureNavigation.js
export const useGestureNavigation = (tabs, currentTab, onTabChange) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentTab < tabs.length - 1) {
      onTabChange(currentTab + 1);
      triggerHapticFeedback('light');
    }
    
    if (isRightSwipe && currentTab > 0) {
      onTabChange(currentTab - 1);
      triggerHapticFeedback('light');
    }
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};
```

### **4. Bottom Sheet Task Panel**
```jsx
// /src/components/mobile/BottomSheetTaskPanel.jsx
const BottomSheetTaskPanel = ({ isOpen, tasks, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bottom-sheet"
      >
        {/* Pull Handle */}
        <div className="pull-handle" />
        
        {/* Content */}
        <div className="sheet-content">
          <h2 className="sheet-title">Aktiiviset Tehtävät</h2>
          
          {/* Virtualized Task List */}
          <VirtualizedTaskList 
            tasks={tasks}
            itemHeight={80}
            className="task-list"
          />
          
          {/* Quick Actions */}
          <div className="quick-actions">
            <TouchButton 
              icon="➕" 
              label="Luo tehtävä"
              onPress={() => openTaskCreator()}
            />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
```

---

## 🎮 **Gesture & Interaction Patterns**

### **1. Swipe Actions**
```jsx
// Task card swipe gestures
const SwipeableTaskCard = ({ task }) => {
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      completeTask(task.id);
      triggerHapticFeedback('success');
    },
    onSwipedLeft: () => {
      openTaskEditor(task.id);
      triggerHapticFeedback('light');
    },
    threshold: 50,
    delta: 10
  });
  
  return (
    <div {...swipeHandlers} className="swipeable-card">
      {/* Task content */}
    </div>
  );
};
```

### **2. Long Press Context Menu**
```jsx
const useLongPress = (callback, ms = 500) => {
  const [startLongPress, setStartLongPress] = useState(false);
  
  useEffect(() => {
    let timerId;
    if (startLongPress) {
      timerId = setTimeout(() => {
        callback();
        triggerHapticFeedback('medium');
      }, ms);
    } else {
      clearTimeout(timerId);
    }
    return () => clearTimeout(timerId);
  }, [startLongPress, callback, ms]);
  
  return {
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
    onTouchMove: () => setStartLongPress(false),
  };
};
```

### **3. Voice Input Integration**
```jsx
// /src/hooks/useVoiceInput.js
export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  const startListening = () => {
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'fi-FI';
    recognition.interimResults = true;
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      triggerHapticFeedback('light');
    };
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      triggerHapticFeedback('light');
    };
    
    recognition.start();
  };
  
  return { isListening, transcript, startListening };
};
```

---

## 🎯 **Performance Optimizations**

### **1. Virtual Scrolling for Large Lists**
```jsx
// /src/components/mobile/VirtualizedTaskList.jsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedTaskList = ({ tasks, itemHeight = 80 }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TouchTaskCard task={tasks[index]} />
    </div>
  );
  
  return (
    <List
      height={window.innerHeight * 0.6}
      itemCount={tasks.length}
      itemSize={itemHeight}
      overscanCount={5}
      className="virtual-task-list"
    >
      {Row}
    </List>
  );
};
```

### **2. Lazy Loading & Code Splitting**
```jsx
// Lazy load heavy components
const MobileTaskEditor = lazy(() => import('./mobile/MobileTaskEditor'));
const VoiceInputModal = lazy(() => import('./mobile/VoiceInputModal'));

// Preload on interaction
const preloadTaskEditor = () => {
  import('./mobile/MobileTaskEditor');
};
```

### **3. Offline Support**
```javascript
// /src/services/offlineTaskManager.js
class OfflineTaskManager {
  constructor() {
    this.cache = new Map();
    this.pendingUpdates = [];
  }
  
  cacheTask(task) {
    this.cache.set(task.id, task);
    localStorage.setItem('cachedTasks', JSON.stringify([...this.cache.values()]));
  }
  
  getCachedTasks() {
    const cached = localStorage.getItem('cachedTasks');
    return cached ? JSON.parse(cached) : [];
  }
  
  queueUpdate(taskId, updates) {
    this.pendingUpdates.push({ taskId, updates, timestamp: Date.now() });
    this.syncWhenOnline();
  }
  
  async syncWhenOnline() {
    if (navigator.onLine && this.pendingUpdates.length > 0) {
      for (const update of this.pendingUpdates) {
        await taskService.updateTask(update.taskId, update.updates);
      }
      this.pendingUpdates = [];
    }
  }
}
```

---

## 🎨 **Design System Components**

### **1. Touch Button System**
```jsx
// /src/components/mobile/TouchButton.jsx
const TouchButton = ({ 
  variant = 'primary', 
  size = 'medium',
  icon,
  label,
  onPress,
  disabled = false 
}) => {
  const baseClasses = `
    touch-button
    min-h-[44px] min-w-[44px]
    flex items-center justify-center
    rounded-lg font-medium
    transition-all duration-150
    active:scale-95
    disabled:opacity-50 disabled:scale-100
  `;
  
  const variants = {
    primary: 'bg-blue-500 text-white active:bg-blue-600',
    secondary: 'bg-gray-700 text-gray-100 active:bg-gray-600',
    ghost: 'bg-transparent text-blue-400 active:bg-blue-500/10'
  };
  
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };
  
  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      onTouchStart={() => triggerHapticFeedback('light')}
      onPress={onPress}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </motion.button>
  );
};
```

### **2. Mobile Typography Scale**
```css
/* /src/styles/mobile-typography.css */
.mobile-text {
  /* Prevent iOS zoom on input focus */
  font-size: max(16px, 1rem);
}

.mobile-heading-1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; }
.mobile-heading-2 { font-size: clamp(1.25rem, 4vw, 1.5rem); font-weight: 600; }
.mobile-heading-3 { font-size: clamp(1.125rem, 3.5vw, 1.25rem); font-weight: 500; }
.mobile-body { font-size: clamp(1rem, 3vw, 1.125rem); line-height: 1.5; }
.mobile-caption { font-size: clamp(0.875rem, 2.5vw, 1rem); color: rgba(255,255,255,0.7); }
```

### **3. Haptic Feedback System**
```javascript
// /src/utils/hapticFeedback.js
export const triggerHapticFeedback = (type = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50],
      selection: [5]
    };
    
    navigator.vibrate(patterns[type] || patterns.light);
  }
  
  // iOS Haptic Feedback (if available)
  if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
    // Implementation for iOS haptic feedback
  }
};
```

---

## 📊 **Mobile Analytics & Metrics**

### **1. Touch Interaction Tracking**
```javascript
// /src/analytics/mobileMetrics.js
class MobileMetrics {
  trackGesture(gestureType, target, success) {
    this.sendEvent('mobile_gesture', {
      type: gestureType, // 'swipe', 'tap', 'long_press', 'pinch'
      target: target,
      success: success,
      timestamp: Date.now()
    });
  }
  
  trackTaskInteraction(action, taskId, method) {
    this.sendEvent('mobile_task_interaction', {
      action: action, // 'create', 'complete', 'edit', 'reorder'
      taskId: taskId,
      method: method, // 'touch', 'voice', 'gesture'
      timestamp: Date.now()
    });
  }
  
  trackPerformance(metric, value) {
    this.sendEvent('mobile_performance', {
      metric: metric, // 'render_time', 'gesture_response', 'scroll_fps'
      value: value,
      device: this.getDeviceInfo()
    });
  }
}
```

### **2. Responsive Breakpoint System**
```css
/* /src/styles/mobile-breakpoints.css */
@media (max-width: 480px) {
  .mobile-only { display: block; }
  .desktop-only { display: none; }
  
  /* Ultra-compact mobile layout */
  .mobile-header { padding: 0.5rem; }
  .mobile-content { padding: 0.75rem; }
  .mobile-task-card { min-height: 60px; }
}

@media (min-width: 481px) and (max-width: 768px) {
  /* Tablet optimizations */
  .mobile-task-card { min-height: 70px; }
  .mobile-content { padding: 1rem; }
}

@media (min-width: 769px) {
  .mobile-only { display: none; }
  .desktop-only { display: block; }
}
```

---

## 🚀 **Implementation Priority**

### **Phase 1: Core Touch Optimization (Week 1)**
1. ✅ Implement TouchButton system
2. ✅ Add gesture navigation (swipe between tabs)
3. ✅ Create mobile-optimized task cards
4. ✅ Add haptic feedback

### **Phase 2: Advanced Interactions (Week 2)**
1. ✅ Bottom sheet task panel
2. ✅ Swipe actions for task completion
3. ✅ Long press context menus
4. ✅ Voice input for task creation

### **Phase 3: Performance & Polish (Week 3)**
1. ✅ Virtual scrolling implementation
2. ✅ Offline task management
3. ✅ Mobile analytics tracking
4. ✅ Advanced gesture recognition

---

## 🎯 **Success Criteria**

- **Touch Target Compliance**: 100% of interactive elements ≥44px
- **Gesture Response Time**: <100ms for touch feedback
- **Mobile Performance**: 60fps scrolling, <200ms task actions
- **Accessibility**: Full VoiceOver/TalkBack support
- **Battery Efficiency**: Minimal background processing

**Expected Result:** DiamondManager becomes the most responsive and intuitive mobile task management experience, following 2025 design standards with natural touch interactions and optimal performance on all mobile devices.