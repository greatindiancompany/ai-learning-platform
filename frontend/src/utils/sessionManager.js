// ============================================================================
// SESSION MANAGER
// ============================================================================
// Manages student sessions for memory system tracking
// ============================================================================

import axios from 'axios';
import API_URL from './api';
import { getToken } from './auth';

/**
 * Create a new student session
 * @returns {string|null} Session token or null if failed
 */
export async function createSession() {
  const token = getToken();
  if (!token) {
    console.log('No auth token - skipping session creation');
    return null;
  }

  // Check if session already exists
  const existingToken = sessionStorage.getItem('session_token');
  if (existingToken) {
    console.log('Session already exists:', existingToken);
    return existingToken;
  }

  try {
    const response = await axios.post(
      `${API_URL}/sessions/create`,
      {
        device_type: detectDeviceType(),
        browser: detectBrowser(),
        screen_width: window.screen.width,
        screen_height: window.screen.height
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const sessionToken = response.data.session_token;
    sessionStorage.setItem('session_token', sessionToken);
    console.log('✅ Session created:', sessionToken);
    return sessionToken;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

/**
 * End the current session
 */
export async function endSession() {
  const sessionToken = sessionStorage.getItem('session_token');
  if (!sessionToken) return;

  const token = getToken();
  if (!token) return;

  try {
    await axios.post(
      `${API_URL}/sessions/end`,
      { session_token: sessionToken },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    sessionStorage.removeItem('session_token');
    console.log('✅ Session ended');
  } catch (error) {
    console.error('Error ending session:', error);
  }
}

/**
 * Update session activity (heartbeat)
 */
export async function updateSessionActivity() {
  const sessionToken = sessionStorage.getItem('session_token');
  if (!sessionToken) return;

  const token = getToken();
  if (!token) return;

  try {
    await axios.patch(
      `${API_URL}/sessions/activity`,
      { session_token: sessionToken },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Track tool usage
 * @param {string} toolName - Name of the tool used
 */
export async function trackToolUsage(toolName) {
  const sessionToken = sessionStorage.getItem('session_token');
  if (!sessionToken) return;

  const token = getToken();
  if (!token) return;

  try {
    await axios.post(
      `${API_URL}/sessions/tool-used`,
      {
        session_token: sessionToken,
        tool_name: toolName
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(`✅ Tracked tool usage: ${toolName}`);
  } catch (error) {
    console.error('Error tracking tool usage:', error);
  }
}

/**
 * Get current session token
 * @returns {string|null}
 */
export function getSessionToken() {
  return sessionStorage.getItem('session_token');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function detectDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}
