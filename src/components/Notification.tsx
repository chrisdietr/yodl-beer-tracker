import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

// Notification interface
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

// Context type
interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastNotificationId = useRef(0);

  const showNotification = (
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = `notification-${++lastNotificationId.current}`;
    const newNotification = { id, message, type };
    
    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  // Add welcome notification when component mounts
  useEffect(() => {
    setTimeout(() => {
      showNotification("Welcome to Bitcoin Pizza Day Beer Tracker! 🍻", "success");
    }, 2000);
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ showNotification, notifications, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Notification Container component
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-6 right-6 z-50">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className="bg-white rounded-2xl shadow-2xl p-6 mb-6 transform transition-all duration-300 flex items-center border-l-8 border-beer-amber max-w-lg text-lg"
          style={{ opacity: 1, transform: 'translateX(0)' }}
        >
          <div className="flex items-center text-beer-amber mr-5 text-3xl">
            <span className="mr-1">✨</span>
            <i className="ri-beer-fill"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-barrel-dark text-xl mb-1">New beer update!</h4>
            <p className="text-base text-barrel-light">{notification.message}</p>
          </div>
          <button 
            onClick={() => removeNotification(notification.id)}
            className="ml-6 text-barrel-light hover:text-barrel-dark text-2xl"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
