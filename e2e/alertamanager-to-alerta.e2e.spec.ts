import * as fs from "fs";
import { expect } from 'chai';
import { Core } from "@Core/App";
import { AlertManagerConfigInterface, AlertManagerModule } from "@Modules/AlertManager";
import { TraceableEventBus } from "tests/Common/TraceableEventBus";
import { ConfigFactory } from "@Config/app-config";
import { Http } from "@Core/Http";
import { AlertmanagerAlertsDataInterface } from "@Modules/AlertManager/Interfaces";
import { loadEnvFile } from "@Helpers/functions";
import { AlertaModule } from "@Modules/Alerta";
import { BaseModule } from "@Core/BaseModule";

describe('e2e -> AlertManager to Alerta', async () => {
    beforeEach(() => {
        const env = loadEnvFile(process.cwd() + '/.env.test');
        if (env === false) {
            process.exit(1);
        }

        const configBase = ConfigFactory.getBase();
        const configCore = ConfigFactory.getCore();

        Core.bootstrap(configBase, configCore);
        Core.app().registerService('http', new Http(configCore.http).init());


    });
    it('checking default options', async () => { // the single test
        let data: AlertmanagerAlertsDataInterface = JSON.parse(fs.readFileSync(__dirname+'/AlertmanagerDataSnapshot.json').toString());
        const configServices = ConfigFactory.getServices();
        let modules = [
            new AlertManagerModule(configServices.inputs.alertmanager),
            new AlertaModule(configServices.outputs.alerta)
        ];

        Core.info('Init services');
        await Promise.all(modules.map((item: BaseModule<any>) => {return item.init(); })).catch((error) => {
            Core.error('Can not init App:');
            throw error;
        });

        // @ts-ignore
        modules[0].processWebHook('', data);
        await timeout(3000)
    });

});

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
