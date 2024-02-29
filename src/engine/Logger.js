export class Logger {
    static depth = 0;
    static isEnabled = true;

    static enableLogging() {
        Logger.isEnabled = true;
    }

    static disableLogging() {
        Logger.isEnabled = false;
    }

    static logStart(message) {
        if (!Logger.isEnabled) return;
        console.log(Logger.generatePrefix() + "┌─ " + message);
        Logger.depth++;
    }

    static log(message) {
        if (!Logger.isEnabled) return;
        console.log(Logger.generatePrefix() + "├─ " + message);
    }

    static logEnd(message) {
        if (!Logger.isEnabled) return;
        Logger.depth--;
        console.log(Logger.generatePrefix() + "└─ " + message);
    }

    static generatePrefix() {
        return "│  ".repeat(Logger.depth);
    }
}