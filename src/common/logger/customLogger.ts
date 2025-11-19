import { LoggerService, Injectable } from '@nestjs/common';
import * as colors from 'colors';
import { env } from '../config/env.config';

@Injectable()
export class CustomLogger implements LoggerService {
  private showLogs: boolean;

  constructor() {
    this.showLogs = Boolean(env.SHOW_NEST_LOGS);
  }

  private getFormattedTimestamp(): string {
    const now = new Date();
    // Convert to BDT (UTC +6)
    const bdtTime = new Date(now.getTime() + 6 * 60 * 60 * 1000); // Adding 6 hours for BDT
    return bdtTime.toISOString().replace('T', ' ').slice(0, 19); // Format it as 'YYYY-MM-DD HH:mm:ss'
  }

  log(message: string) {
    const timestamp = this.getFormattedTimestamp();
    
    // Important messages - সবসময় দেখাবে
    if (message.includes('Nest application successfully started')) {
      console.log(`[${timestamp}] [SERVER]: ${colors.green('✓ Application successfully started!')}`);
      return;
    }
    
    if (message.includes('Starting Nest application')) {
      console.log(`[${timestamp}] [INFO]: ${colors.blue('→ Starting Nest application...')}`);
      return;
    }
    
    // বাকি logs শুধু SHOW_NEST_LOGS=true হলে দেখাবে
    if (!this.showLogs) return;
    
    console.log(`[${timestamp}] [LOG]: ${message}`);
  }

  error(message: string, trace?: string) {
    const timestamp = this.getFormattedTimestamp();
    console.error(`[${timestamp}] [ERROR]: ${colors.red(message)}`);
    if (trace) {
      console.error(`[${timestamp}] [TRACE]: ${trace}`);
    }
  }

  warn(message: string) {
    if (!this.showLogs) return;
    const timestamp = this.getFormattedTimestamp();
    console.warn(`[${timestamp}] [WARN]: ${colors.yellow(message)}`);
  }

  debug(message: string) {
    if (!this.showLogs) return;
    const timestamp = this.getFormattedTimestamp();
    console.debug(`[${timestamp}] [DEBUG]: ${colors.cyan(message)}`);
  }

  verbose(message: string) {
    if (!this.showLogs) return;
    const timestamp = this.getFormattedTimestamp();
    console.log(`[${timestamp}] [VERBOSE]: ${colors.magenta(message)}`);
  }
}

