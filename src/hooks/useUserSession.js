import axios from 'utils/axios';
import { useEffect, useRef } from 'react';

export function useSmartSessionTracker(user) {
  const sessionId = useRef(null);
  const lastActive = useRef(Date.now());
  const idleTimeout = useRef(null);
  const heartbeatInterval = useRef(null);

  useEffect(() => {
    if (!user?.user_id || !user?.company_id) return;

    // Helper: Start new session
    const startSession = async () => {
      const res = await axios.post('/employee/session', {
        user_id: user.user_id,
        company_id: user.company_id,
        business_unit_id: user.business_unit_id,
        session_start: new Date().toISOString()
      });
      sessionId.current = res.data.session_id;
      localStorage.setItem('activeSessionId', sessionId.current);
      lastActive.current = Date.now();
    };

    // Helper: Send heartbeat and active seconds
    const sendHeartbeat = async () => {
      if (!sessionId.current) return;
      const now = Date.now();
      const increment = Math.floor((now - lastActive.current) / 1000);
      await axios.put(`/session/heartbeat/${sessionId.current}`, {
        timestamp: new Date().toISOString(),
        increment_seconds: increment
      });
      lastActive.current = now;
    };

    // Helper: Mark idle
    const setIdle = async () => {
      if (!sessionId.current) return;
      await axios.put(`/employee/session/idle/${sessionId.current}`, {
        timestamp: new Date().toISOString(),
        idle_seconds: 600 // e.g. 10 minutes
      });
    };

    // Helper: End session
    const endSession = async () => {
      if (sessionId.current) {
        await axios.put(`/employee/session/end/${sessionId.current}`, {
          session_end: new Date().toISOString()
        });
        localStorage.removeItem('activeSessionId');
        sessionId.current = null;
      }
    };

    // Activity event triggers: mouse, keyboard, focus (any real action)
    const activityListener = () => {
      lastActive.current = Date.now();
      clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(setIdle, 10 * 60 * 1000); // 10 minutes idle
      sendHeartbeat(); // Send heartbeat on activity
    };

    // Start session on mount/login
    startSession();

    // Heartbeat every 5 minutes as fallback even if no manual activity
    heartbeatInterval.current = setInterval(sendHeartbeat, 5 * 60 * 1000);

    // Attach activity listeners for smart detection
    window.addEventListener('mousemove', activityListener);
    window.addEventListener('keydown', activityListener);
    window.addEventListener('focus', activityListener);

    // End session on tab close/refresh/logout
    window.addEventListener('beforeunload', endSession);

    // Detect page refresh and resume session if exists (within 2 min)
    const existingSessionId = localStorage.getItem('activeSessionId');
    if (existingSessionId) sessionId.current = existingSessionId;

    // Cleanup
    return () => {
      clearTimeout(idleTimeout.current);
      clearInterval(heartbeatInterval.current);
      window.removeEventListener('mousemove', activityListener);
      window.removeEventListener('keydown', activityListener);
      window.removeEventListener('focus', activityListener);
      window.removeEventListener('beforeunload', endSession);
      endSession();
    };
  }, [user?.user_id, user?.company_id, user?.business_unit_id]);
}
