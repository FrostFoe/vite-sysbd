/**
 * Centralized Logging Service
 * Handles all application logging (development & production)
 */

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: unknown;
  userId?: number;
  endpoint?: string;
}

class LoggingService {
  private static isDevelopment = import.meta.env.DEV;
  private static maxLogs = 100;
  private static logs: LogEntry[] = [];

  /**
   * Log info level message
   */
  static info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  /**
   * Log warning level message
   */
  static warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  /**
   * Log error level message
   */
  static error(message: string, data?: unknown) {
    this.log("error", message, data);
  }

  /**
   * Log debug level message (dev only)
   */
  static debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      this.log("debug", message, data);
    }
  }

  /**
   * Internal log method
   */
  private static log(
    level: "info" | "warn" | "error" | "debug",
    message: string,
    data?: unknown,
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Store log in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (this.isDevelopment) {
      const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
      const method = console[consoleMethod as keyof typeof console] as (...args: unknown[]) => void;
      method(
        `[${level.toUpperCase()}] ${message}`,
        ...(data && typeof data === "object" && Object.keys(data as object).length > 0 ? [JSON.stringify(data)] : [])
      );
    }

    // Send error to backend in production
    if (level === "error" && !this.isDevelopment) {
      this.sendErrorToBackend(entry);
    }
  }

  /**
   * Send error logs to backend for persistent storage
   */
  private static async sendErrorToBackend(entry: LogEntry) {
    try {
      await fetch("/api/log_error.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (e) {
      // Fail silently to avoid logging loops
    }
  }

  /**
   * Get all stored logs
   */
  static getLogs(level?: string): LogEntry[] {
    return level ? this.logs.filter((log) => log.level === level) : this.logs;
  }

  /**
   * Clear stored logs
   */
  static clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs for debugging
   */
  static exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `logs-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }
}

export default LoggingService;
export const logger = LoggingService;
