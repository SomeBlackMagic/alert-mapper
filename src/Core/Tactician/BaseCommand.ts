
const {
    Command,
} = require('simple-command-bus');

export abstract class BaseCommand extends Command {
    abstract _uuid: string;
    abstract getUuid(): string;
}
