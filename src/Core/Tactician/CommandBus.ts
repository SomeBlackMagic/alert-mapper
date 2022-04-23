import { BaseCommand } from '@Core/Tactician/BaseCommand';
import {Core} from '@Core/App';

const {
    CommandBus,
    CommandHandlerMiddleware,
    ClassNameExtractor,
    InMemoryLocator,
    HandleInflector,
    LoggerMiddleware
} = require('simple-command-bus');

export class TacticianCommandBus {
    private commandBus;

    public constructor(handlers: object) {
        // Handler middleware
        let commandHandlerMiddleware = new CommandHandlerMiddleware(
            new ClassNameExtractor(),
            new InMemoryLocator(handlers),
            new HandleInflector(),
        );

        this.commandBus = new CommandBus([
            new LoggerMiddleware({
                log: (text, command: BaseCommand, returnValue) => {
                    Core.app().logger().debug(text + '-> ' + command.constructor.name, [command.getUuid(), returnValue], 'CommandBus' );
                }

            }),
            commandHandlerMiddleware
        ]);
    }

    public handle<T>(command: BaseCommand): T {
        return this.commandBus.handle(command);
    }
}



// const createAccountCommand = new RequestMetricCommand('John');
// var result = commandBus.handle(createAccountCommand);
// result.then(() => {
//
// })
