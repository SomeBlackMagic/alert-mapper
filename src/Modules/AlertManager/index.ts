import {LoggerInterface} from '@elementary-lab/standards/src/LoggerInterface';
import {Core} from '@Core/App';
import Router from 'koa-router';
import {BaseModule, BaseModuleConfig} from '@Core/BaseModule';
import {Http, HttpEvents} from '@Core/Http';
import {Context} from 'koa';
import {AlertmanagerAlertInterface, AlertmanagerAlertsDataInterface} from '@Modules/AlertManager/Interfaces';

import {
    GlobalAlertEnvironment,
    GlobalAlertInterface,
    GlobalSeverityLevels,
    GlobalStatus
} from '@Interfaces/GlobalAlertInterface';
import {TacticianCommandBus} from '@Core/Tactician/CommandBus';
import {NewAlertCommand} from '../../Commands/NewAlertCommand';
import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import client from 'prom-client';


export class AlertManagerModule extends BaseModule<AlertManagerModule> {
    private config: AlertManagerConfigInterface;
    private eventBus: EventBusInterface<any>;
    private commandBus: TacticianCommandBus;
    private logger: LoggerInterface;
    private http: Http;

    private metrics: Map<string, any> = new Map<string, any>([]);

    private environmentMap: Map<string, GlobalAlertEnvironment> = new Map<string, GlobalAlertEnvironment>([
        ['prod', GlobalAlertEnvironment.production],
        ['stage', GlobalAlertEnvironment.staging],
        ['test', GlobalAlertEnvironment.testing],
        ['dev', GlobalAlertEnvironment.development],
    ]);

    private severityMap: Map<string, GlobalSeverityLevels> = new Map<string, GlobalSeverityLevels>([
        ['info', GlobalSeverityLevels.informational],
        ['critical', GlobalSeverityLevels.critical],
        ['warning', GlobalSeverityLevels.warning],
        ['unknown', GlobalSeverityLevels.unknown],
    ]);

    private statusMap: Map<string, GlobalStatus> = new Map<string, GlobalStatus>([
        ['firing', GlobalStatus.open],
        ['resolved', GlobalStatus.closed],
    ]);


    public constructor(
        config: AlertManagerConfigInterface,
        eventBus?: EventBusInterface<any>,
        logger?: LoggerInterface
    ) {
        super();
        this.config = config;
        this.logger = logger ?? Core.app().logger();
        this.http = Core.app().getService<Http>('http');
        this.eventBus = eventBus ?? Core.app().bus();
    }

    public init(): Promise<AlertManagerModule> {
        this.registerMetrics();
        this.registerRoutes();
        this.commandBus = Core.app().getService<TacticianCommandBus>('commandBus');
        return Promise.resolve(this);
    }

    public run(): Promise<AlertManagerModule> {

        return Promise.resolve(this);
    }

    private registerRoutes(): void {
        let router = new Router({prefix: '/input/alert-manager'});
        router
            .post('/webhook', this.webhook.bind(this));

        this.http.registerRoutes(router);
    }

    private registerMetrics() {
        this.metrics.set('input_processed', new client.Gauge({
            name: 'input_processed',
            help: 'Count processed',
            labelNames: ['driver', 'status'],
        }));

        this.metrics.forEach((value) => {
            this.eventBus.emit(HttpEvents.REGISTER_METRIC, value);
        });
    }


    /**
     *
     * @param {Application.Context} ctx
     * @returns {Promise<void>}
     * @private
     */
    private async webhook(ctx: Context) {
        // TODO Add validation
        this.metrics.get('input_processed').inc({driver: 'AlertManager', status: 'request'});
        this.logger.info('Request data:', ctx.request.body, 'Input -> AlertManager');
        try {
            let result = await this.processWebHook(ctx.state.id, ctx.request.body);
            if (result.length > 0) {
                this.metrics.get('input_processed').inc({driver: 'AlertManager', status: 'failed'});
                ctx.status = 500;
                ctx.body = {
                    msg: 'Can not process some items',
                    data: result
                };
            } else {
                this.metrics.get('input_processed').inc({driver: 'AlertManager', status: 'success'});
                ctx.status = 200;
                ctx.body = 'OK';
            }
        } catch (e) {
            this.metrics.get('input_processed').inc({driver: 'AlertManager', status: 'failed'});
            ctx.status = 500;
            ctx.body = {
                msg: 'Can not parse body',
                data: e.stack
            };
            this.logger.error('Can not parse body', e, 'Input -> AlertManager');
        }
        // TODO Add check status

    }

    public async processWebHook(eventId: string, alert: AlertmanagerAlertsDataInterface) {
        let globalAlertsList: GlobalAlertInterface[] = [];
        this.logger.debug('Remaping', alert.alerts.length, 'Input -> AlertManager');
        alert.alerts.map((item) => {
            globalAlertsList.push(this.mapAlertaAlertsToGlobalAlert(item));
        });

        this.logger.debug('Sending to CommandBus', alert.alerts.length, 'Input -> AlertManager');
        let failedProcessing = [];
        let f = globalAlertsList.map(async (item) => {
            return {
                externalEventId: item.externalEventId,
                status: await this.commandBus.handle<Promise<any>>(new NewAlertCommand(item.externalEventId, item))
            };
        });
        let results = await Promise.all(f);
        results.map((item) => {
            if (item.status === false) {
                failedProcessing.push(item.externalEventId);
            }
        });
        return failedProcessing;
    }

    public mapAlertaAlertsToGlobalAlert(alert: AlertmanagerAlertInterface): GlobalAlertInterface {
        let severity = 'unknown';
        if (alert.labels.severity !== null) {
            severity = alert.labels.severity;
        }

        let event = '';
        if (alert.labels.alertname !== null) {
            event = alert.labels.alertname;
        }

        return {
            from: 'AlertManager',
            resource: this.parseResource({}), // TODO Add parse request
            environment: this.environmentMap.get(this.config.fields.environment),
            severity: this.severityMap.get(severity),
            status: this.statusMap.get(alert.status),
            externalEventId: alert.fingerprint,
            event: event,
            summary: alert.annotations.summary,
            description: alert.annotations.description,
            labels: alert.labels,
            raw: {
                startsAt: alert.startsAt,
                endsAt: alert.endsAt,
                generatorURL: alert.generatorURL,
                runbook_url: alert.annotations.runbook_url
            }
        };
    }

    private parseResource(requestBody: any): string {
        if (requestBody.resource !== undefined) {
            return requestBody.resource;
        }
        if (this.config.fields.resource !== null) {
            return this.config.fields.resource;
        }

        return 'unknown';
    }
}

export interface AlertManagerConfigInterface extends BaseModuleConfig {
    instanceUrl: string;
    auth: {
        enabled: boolean
        user: string
        pass: string
    };
    fields: {
        environment: string
        resource: string
    };
}
