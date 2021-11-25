#!/app/node_modules/.bin/ts-node
// file: hello-world.js (make the file executable using `chmod +x hello.js`)


// Caporal provides you with a program instance
import { Argument, BaseJob } from '@Core/BaseJob';
import * as caporal from '@caporal/core';
import { loadEnvFile } from '@Helpers/functions';
import { ConfigFactory } from '@Config/app-config';
import { Core } from '@Core/App';
import { BaseModule } from '@Core/BaseModule';
import { ListenCommand } from "src/Commands/ListenCommand";

const env = loadEnvFile(process.cwd() + '/.env.local');
if (env === false) {
    process.exit(1);
}

const configBase = ConfigFactory.getBase();
const configCore = ConfigFactory.getCore();
const configServices = ConfigFactory.getServices();

Core.bootstrap(configBase, configCore);

(async () => {

    let jobs = [
        new ListenCommand(),
    ];

    jobs.map((item: BaseJob<any>) => {
        const job = caporal.program.command(item.getName(), item.getDescription());
        item.getArguments().map((argument: Argument) => {
            job.argument(argument.name, argument.description);
        });

        job
            // .option('-e, --extra-ingredients <ingredients>', 'Extra ingredients')
            .action(item.run.bind(item));

    });

    let exitCode = await caporal.program.run();
    if (typeof exitCode === "number") {
        process.exit(exitCode);
    }
    process.exit(0);
})();




