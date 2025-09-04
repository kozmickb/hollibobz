interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  [key: string]: any;
}

export class Logger {
  private static sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remove common secret patterns
      return value
        .replace(/password[=:]\s*[^\s,]+/gi, 'password=***')
        .replace(/token[=:]\s*[^\s,]+/gi, 'token=***')
        .replace(/key[=:]\s*[^\s,]+/gi, 'key=***')
        .replace(/secret[=:]\s*[^\s,]+/gi, 'secret=***');
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [k, v] of Object.entries(value)) {
        sanitized[k] = this.sanitizeValue(v);
      }
      return sanitized;
    }
    return value;
  }

  private static log(level: string, message: string, meta: any = {}, requestId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.sanitizeValue(meta)
    };

    if (requestId) {
      entry.requestId = requestId;
    }

    console.log(JSON.stringify(entry));
  }

  static info(message: string, meta: any = {}, requestId?: string) {
    this.log('info', message, meta, requestId);
  }

  static warn(message: string, meta: any = {}, requestId?: string) {
    this.log('warn', message, meta, requestId);
  }

  static error(message: string, meta: any = {}, requestId?: string) {
    this.log('error', message, meta, requestId);
  }

  static debug(message: string, meta: any = {}, requestId?: string) {
    this.log('debug', message, meta, requestId);
  }
}
