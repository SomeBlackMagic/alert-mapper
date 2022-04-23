import * as fs from 'fs';
import { expect } from 'chai';
import { Core } from '@Core/App';
import { AlertManagerConfigInterface, AlertManagerModule } from '@Modules/AlertManager';
import { TraceableEventBus } from 'tests/Common/TraceableEventBus';
import { ConfigFactory } from '@Config/app-config';
import { Http } from '@Core/Http';
import { AlertmanagerAlertsDataInterface } from '@Modules/AlertManager/Interfaces';
import { loadEnvFile } from '@Helpers/functions';
import {TraceableCommandBus} from '@tests/Common/TraceableCommandBus';

describe('Input -> AlertManager', async () => {
    beforeEach(() => {
        const env = loadEnvFile(process.cwd() + '/.env.test');
        if (env === false) {
            process.exit(1);
        }

        const configBase = ConfigFactory.getBase();
        const configCore = ConfigFactory.getCore();
        const configServices = ConfigFactory.getServices();

        Core.bootstrap(configBase, configCore);
        Core.app().registerService('http', new Http(configCore.http).init());
    });
    it('checking default options', async () => { // the single test
        let data: AlertmanagerAlertsDataInterface = JSON.parse(fs.readFileSync(__dirname + '/hook.json').toString());
        let config: AlertManagerConfigInterface = {
            instanceUrl: 'http://localhost',
            enabled: true,
            auth: {
                enabled: true,
                user: 'test',
                pass: 'test'
            },
            fields: {
                environment: 'test',
                resource: 'resource-1'
            }
        };
        let commandBus = new TraceableCommandBus({});
        let module = new AlertManagerModule(config, commandBus);

        await module.processWebHook('', data);
        let events = commandBus.getEmittedCommands();


        let eventObj = events[0].args[0].alert;

        expect(eventObj).to.deep.include({
            'externalEventId': '4915aa5640b54b51',
            'environment': 'test',
            'event': 'KubePodCrashLooping',
            'summary': 'Pod is crash looping.',
            'description': 'Pod test-namespace/app-prefix-test-app-consume-async-69dc7df89f-d6dnf (test-app-app) is restarting 0.55 times / 10 minutes.',
            'labels': {
                'alertname': 'KubePodCrashLooping',
                'container': 'test-app-app',
                'endpoint': 'http',
                'instance': '10.233.67.248:8080',
                'job': 'kube-state-metrics',
                'namespace': 'test-namespace',
                'pod': 'app-prefix-test-app-consume-async-69dc7df89f-d6dnf',
                'prometheus': 'cattle-monitoring-system/rancher-monitoring-prometheus',
                'service': 'rancher-monitoring-kube-state-metrics',
                'severity': 'warning'
            },
            'raw': {
                'endsAt': '0001-01-01T00:00:00Z',
                'generatorURL': 'https://rancher.server.com/k8s/clusters/local/api/v1/namespaces/cattle-monitoring-system/services/http:rancher-monitoring-prometheus:9090/proxy/graph?g0.expr=rate%28kube_pod_container_status_restarts_total%7Bjob%3D%22kube-state-metrics%22%2Cnamespace%3D~%22.%2A%22%7D%5B10m%5D%29+%2A+60+%2A+5+%3E+0&g0.tab=1',
                'runbook_url': 'https://github.com/kubernetes-monitoring/kubernetes-mixin/tree/master/runbook.md#alert-name-kubepodcrashlooping',
                'startsAt': '2021-11-21T08:56:59.605Z'
            }
        });
    });

});
