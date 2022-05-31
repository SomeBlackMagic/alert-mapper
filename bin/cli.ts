#!/app/node_modules/.bin/ts-node

// Caporal provides you with a program instance
import { Argument, BaseCliCommand } from '@Core/BaseCliCommand';
import * as caporal from '@caporal/core';
import { ConfigFactory } from '@Config/app-config';
import { Core } from '@Core/App';
import { SentryTestCommand } from 'src/ConsoleCommands/SentryTestCommand';
Core.loadEnv();

const configBase = ConfigFactory.getBase();
const configCore = ConfigFactory.getCore();
const configServices = ConfigFactory.getServices();

Core.bootstrap(configBase, configCore);

(async () => {

    let jobs = [
        new SentryTestCommand(),
    ];

    jobs.forEach((item: BaseCliCommand<any>) => {
        const job = caporal.program.command(item.getName(), item.getDescription());
        item.getArguments().forEach((argument: Argument) => {
            job.argument(argument.name, argument.description);
        });

        job
            // .option('-e, --extra-ingredients <ingredients>', 'Extra ingredients')
            .action(item.run.bind(item));
    });

    let exitCode = await caporal.program.run();
    if (typeof exitCode === 'number' && exitCode !== 0) {
        process.exitCode = exitCode;
    }
    // @ts-ignore
    await process.flushLogs();
})();
