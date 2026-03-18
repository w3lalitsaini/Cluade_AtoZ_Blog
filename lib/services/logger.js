import Log from "@/models/Log";
import connectDB from "@/lib/db";

/**
 * Production-Level Logger Service
 * Handles logging to console in development and MongoDB in production.
 */

const isProd = process.env.NODE_ENV === 'production';

/**
 * Generic log function
 */
async function writeLog(level, source, message, metadata = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`;

  // 1. Console Logging (Always)
  if (level === 'error') {
    console.error(logEntry, metadata);
  } else if (level === 'warn') {
    console.warn(logEntry, metadata);
  } else {
    console.log(logEntry);
  }

  // 2. Database Logging (Production focus, or if forced)
  try {
    await connectDB();
    await Log.create({
      level,
      source,
      message,
      metadata,
      timestamp: new Date()
    });
  } catch (err) {
    console.warn('[Logger] Failed to save log to DB:', err.message);
  }
}

export const logInfo = (source, message, metadata = {}) => 
  writeLog('info', source, message, metadata);

export const logError = (source, message, error = {}) => {
  const metadata = error instanceof Error 
    ? { stack: error.stack, message: error.message }
    : error;
  return writeLog('error', source, message, metadata);
};

export const logWarn = (source, message, metadata = {}) => 
  writeLog('warn', source, message, metadata);

/**
 * Specialized logger for Agentic steps
 */
export const logAgentStep = (agentName, step, keyword, details = {}) => {
  const message = `Step: ${step} | Keyword: ${keyword}`;
  return writeLog('debug', agentName, message, details);
};
