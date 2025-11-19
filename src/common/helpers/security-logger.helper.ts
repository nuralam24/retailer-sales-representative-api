import * as colors from 'colors';

/**
 * Security Event Logger
 * Logs security-related events for monitoring and auditing
 */
export class SecurityLogger {
  private static getTimestamp(): string {
    const now = new Date();
    const bdtTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    return bdtTime.toISOString().replace('T', ' ').slice(0, 19);
  }

  /**
   * Log SQL Injection attempt
   */
  static logSqlInjection(ip: string, endpoint: string, payload: string): void {
    console.error(
      `[${this.getTimestamp()}] [SECURITY-ALERT] ${colors.red('SQL Injection Attempt')}`,
      `\n  IP: ${ip}`,
      `\n  Endpoint: ${endpoint}`,
      `\n  Payload: ${payload.substring(0, 100)}...`
    );
  }

  /**
   * Log XSS attempt
   */
  static logXssAttempt(ip: string, endpoint: string, payload: string): void {
    console.error(
      `[${this.getTimestamp()}] [SECURITY-ALERT] ${colors.red('XSS Attempt')}`,
      `\n  IP: ${ip}`,
      `\n  Endpoint: ${endpoint}`,
      `\n  Payload: ${payload.substring(0, 100)}...`
    );
  }

  /**
   * Log Rate Limit Exceeded
   */
  static logRateLimitExceeded(ip: string, endpoint: string): void {
    console.warn(
      `[${this.getTimestamp()}] [SECURITY-WARN] ${colors.yellow('Rate Limit Exceeded')}`,
      `\n  IP: ${ip}`,
      `\n  Endpoint: ${endpoint}`
    );
  }

  /**
   * Log Failed Authentication
   */
  static logAuthFailure(ip: string, username: string, reason: string): void {
    console.warn(
      `[${this.getTimestamp()}] [SECURITY-WARN] ${colors.yellow('Auth Failure')}`,
      `\n  IP: ${ip}`,
      `\n  Username: ${username}`,
      `\n  Reason: ${reason}`
    );
  }

  /**
   * Log Suspicious Activity
   */
  static logSuspiciousActivity(ip: string, description: string, data?: any): void {
    console.warn(
      `[${this.getTimestamp()}] [SECURITY-WARN] ${colors.yellow('Suspicious Activity')}`,
      `\n  IP: ${ip}`,
      `\n  Description: ${description}`,
      data ? `\n  Data: ${JSON.stringify(data, null, 2)}` : ''
    );
  }

  /**
   * Log Security Event (General)
   */
  static logSecurityEvent(type: string, message: string, metadata?: any): void {
    console.log(
      `[${this.getTimestamp()}] [SECURITY] ${colors.cyan(type)}`,
      `\n  Message: ${message}`,
      metadata ? `\n  Metadata: ${JSON.stringify(metadata, null, 2)}` : ''
    );
  }

  /**
   * Log Unauthorized Access Attempt
   */
  static logUnauthorizedAccess(ip: string, endpoint: string, token?: string): void {
    console.error(
      `[${this.getTimestamp()}] [SECURITY-ALERT] ${colors.red('Unauthorized Access')}`,
      `\n  IP: ${ip}`,
      `\n  Endpoint: ${endpoint}`,
      token ? `\n  Token: ${token.substring(0, 20)}...` : '\n  Token: None'
    );
  }
}

