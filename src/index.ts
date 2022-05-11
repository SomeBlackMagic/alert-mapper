'use strict';

import { Core } from '@Core/App';
import { ConfigFactory } from '@Config/app-config';
import { Http } from '@Core/Http';
import { Probe } from '@Core/Probe';
import { BaseModule } from '@Core/BaseModule';
import { AlertManagerModule } from '@Modules/AlertManager';
import { AlertaModule } from '@Modules/Alerta';
import {NewAlertHandler} from './Commands/NewAlertHandler';
import {TacticianCommandBus} from '@Core/Tactician/CommandBus';
import {TelegramModule} from '@Modules/Telegram';


Core.loadEnv();

const configBase = ConfigFactory.getBase();
const configCore = ConfigFactory.getCore();
const configServices = ConfigFactory.getServices();

Core.bootstrap(configBase, configCore);

// -------------------Core modules-------------------

Core.app().registerService('http', new Http(configCore.http).init());
Core.app().registerService('probe', new Probe());

Core.app().getService<Probe>('probe').init();
// -------------------external modules-------------------

let inputs = [
    new AlertManagerModule(configServices.inputs.alertmanager),
];
Core.app().registerService('inputs', inputs);

let outputs = [
    new AlertaModule(configServices.outputs.alerta),
    new TelegramModule(configServices.outputs.telegram)
];
Core.app().registerService('outputs', outputs);


let commandsList = {
    NewAlertHandler: new NewAlertHandler()
};

Core.app().registerService('commandBus', new TacticianCommandBus(commandsList));

(async () => {
    Core.info('Init services');
    await Promise.all([...inputs, ...outputs].map((item: BaseModule<any>) => {return item.init(); })).catch((error) => {
        Core.error('Can not init App:');
        throw error;
    });
    Core.info('System initialized');
    await Core.app().getService<Probe>('probe').run();
    await Core.app().getService<Http>('http').start();
    Core.info('Run services');
    await Promise.all([...inputs, ...outputs].map((item: BaseModule<any>) => {return item.run(); })).catch((error) => {
        Core.error('Can not start App', error);
        process.exit(1);
    });

})();



Core.app().setExitHandler((data: {code:string}) => {
    Core.info('PCNTL signal received. Closing connection server.', [data.code]);
    (async () => {
        await Promise.all([...inputs, ...outputs].map((item: BaseModule<any>) => {return item.stop(); })).catch((error) => {
            Core.error('Can not stop services', error);
            process.exit(1);
        });
        Core.info('System gracefully stopped');
        process.exit(0);
    })();
});
Core.app().subscribeOnProcessExit();
