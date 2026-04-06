let loggingEnabled = false;
let depth = 0;

export const Logger = {
  enableLogging(): void  { loggingEnabled = true; },
  disableLogging(): void { loggingEnabled = false; },

  logStart(message: string): void {
    if (!loggingEnabled) return;
    console.log("  ".repeat(depth) + "└─ START: " + message);
    depth++;
  },

  log(message: string): void {
    if (!loggingEnabled) return;
    console.log("  ".repeat(depth) + "├─ " + message);
  },

  logEnd(message: string): void {
    if (!loggingEnabled) return;
    if (depth > 0) depth--;
    console.log("  ".repeat(depth) + "└─ END: " + message);
  },
};
