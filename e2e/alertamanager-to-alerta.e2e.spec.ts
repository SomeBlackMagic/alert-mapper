import * as fs from 'fs';
import { Core } from '@Core/App';
import {AlertManagerConfigInterface, AlertManagerModule} from '@Modules/AlertManager';
import { ConfigFactory } from '@Config/app-config';
import { Http } from '@Core/Http';
import { AlertmanagerAlertsDataInterface } from '@Modules/AlertManager/Interfaces';
import { AlertaModule } from '@Modules/Alerta';
import { BaseModule } from '@Core/BaseModule';
import {NewAlertHandler} from '../src/Commands/NewAlertHandler';
import {TacticianCommandBus} from '@Core/Tactician/CommandBus';

describe('e2e -> AlertManager to Alerta', async () => {
    beforeEach(() => {

        process.env.APP_ENV = 'test';
        Core.loadEnv();

        const configBase = ConfigFactory.getBase();
        const configCore = ConfigFactory.getCore();

        Core.bootstrap(configBase, configCore);
        Core.app().registerService('http', new Http(configCore.http).init());


    });
    it('checking default options', async () => { // the single test
        let data: AlertmanagerAlertsDataInterface = JSON.parse(fs.readFileSync(__dirname + '/AlertmanagerDataSnapshot.json').toString());
        const configServices = ConfigFactory.getServices();
        let alertManagerConfig: AlertManagerConfigInterface = {
            enabled: true,
            instanceUrl: '',
            fields: {
                environment: 'test',
                resource: 'resource'
            },
            auth: {
                enabled: false,
                user: 'false',
                pass: 'false',
            }
        };
        let inputs = [
            new AlertManagerModule(alertManagerConfig),
        ];
        Core.app().registerService('inputs', inputs);

        let outputs = [
            new AlertaModule(configServices.outputs.alerta)
        ];
        Core.app().registerService('outputs', outputs);


        let commandsList = {
            NewAlertHandler: new NewAlertHandler()
        };

        Core.app().registerService('commandBus', new TacticianCommandBus(commandsList));

        Core.info('Init services');
        await Promise.all([...inputs, ...outputs].map((item: BaseModule<any>) => {return item.init(); })).catch((error) => {
            Core.error('Can not init App:');
            throw error;
        });

        // @ts-ignore
        let result = await inputs[0].processWebHook('', data);
        console.log('Errored items:');
        console.log(result);
    });

});

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
