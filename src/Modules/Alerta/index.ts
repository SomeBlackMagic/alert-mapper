import { BaseModule, BaseModuleConfig } from '@Core/BaseModule';
import { EventBusInterface } from '@elementary-lab/standards/src/EventBusInterface';
import { SimpleEventBus } from '@elementary-lab/events/src/SimpleEventBus';
import { LoggerInterface } from '@elementary-lab/standards/src/LoggerInterface';
import { Core } from '@Core/App';
import { AlertaAlertsRepository } from '@elementary-lab/alerta/src/Repository/AlertaAlertsRepository';
import {
    AlertStatus,
    CreateAlertRequestInterface,
    SeverityLevels
} from '@elementary-lab/alerta/src/Domain/Interfaces/Alerts';
import {
    GlobalAlertEnvironment,
    GlobalAlertInterface,
    GlobalSeverityLevels, GlobalStatus
} from 'src/Interfaces/GlobalAlertInterface';
import {ProbeReadyEvents, ProbeReadyServiceStatus} from '@Core/Probe';
import {ProbeLivenessEvents, ProbeLivenessServiceStatus} from '@Core/Probe/ProbeLiveness';
import client from 'prom-client';
import {HttpEvents} from '@Core/Http';

export class AlertaModule extends BaseModule<AlertaModule> {
    private config: AlertaConfigInterface;
    private eventBus: EventBusInterface<SimpleEventBus>;
    private logger: LoggerInterface;
    private alertaRepository: AlertaAlertsRepository;
    private serviceReady: boolean = false;

    private metrics: Map<string, client.Gauge<string>> = new Map<string, client.Gauge<string>>([]);

    private environmentMap: Map<GlobalAlertEnvironment, AlertaEnvironment> = new Map<GlobalAlertEnvironment, AlertaEnvironment>([
        [GlobalAlertEnvironment.production, AlertaEnvironment.production],
        [GlobalAlertEnvironment.development, AlertaEnvironment.development],
        [GlobalAlertEnvironment.testing, AlertaEnvironment.testing],
        [GlobalAlertEnvironment.staging, AlertaEnvironment.staging],
    ]);

    private severityMap: Map<GlobalSeverityLevels, SeverityLevels> = new Map<GlobalSeverityLevels, SeverityLevels>([
        [GlobalSeverityLevels.security, SeverityLevels.security],
        [GlobalSeverityLevels.critical, SeverityLevels.critical],
        [GlobalSeverityLevels.major, SeverityLevels.major],
        [GlobalSeverityLevels.minor, SeverityLevels.minor],
        [GlobalSeverityLevels.warning, SeverityLevels.warning],
        [GlobalSeverityLevels.informational, SeverityLevels.informational],
        [GlobalSeverityLevels.debug, SeverityLevels.debug],
        [GlobalSeverityLevels.trace, SeverityLevels.trace],
        [GlobalSeverityLevels.indeterminate, SeverityLevels.indeterminate],
        [GlobalSeverityLevels.cleared, SeverityLevels.cleared],
        [GlobalSeverityLevels.normal, SeverityLevels.normal],
        [GlobalSeverityLevels.ok, SeverityLevels.ok],
        [GlobalSeverityLevels.unknown, SeverityLevels.unknown],
    ]);

    private statusMap: Map<GlobalStatus, AlertStatus> = new Map<GlobalStatus, AlertStatus>([
        [GlobalStatus.closed, AlertStatus.closed],
        [GlobalStatus.open, AlertStatus.open],
        [GlobalStatus.ack, AlertStatus.ack],
        [GlobalStatus.assign, AlertStatus.assign],
    ]);

    public constructor(config: AlertaConfigInterface, alertaRepository?: AlertaAlertsRepository, eventBus?: EventBusInterface<SimpleEventBus>, logger?: LoggerInterface) {
        super();
        this.config = config;
        this.alertaRepository = alertaRepository ?? new AlertaAlertsRepository(this.config.url, this.config.token);
        this.eventBus = eventBus ?? Core.app().bus();
        this.logger = logger ?? Core.app().logger();
    }

    public async init(): Promise<AlertaModule> {
        this.eventBus.emit(ProbeReadyEvents.REGISTER_SERVICE, 'AlertaModule');
        this.eventBus.emit(ProbeLivenessEvents.REGISTER_SERVICE, 'AlertaModule');
        this.registerMetrics();
        return Promise.resolve(this);

    }

    public run(): Promise<AlertaModule> {
        setInterval(() => {
            this.logger.debug('heartbeat', '', 'AlertaModule');
            this.alertaRepository.ping()
                .then(() => {
                    this.logger.debug('heartbeat ok', '', 'AlertaModule');
                    if (this.serviceReady === false) {
                        let livenessProbe: ProbeLivenessServiceStatus = {
                            serviceId: 'AlertaModule',
                            isReady: true,
                            state: 'ready to process events'
                        };
                        this.eventBus.emit(ProbeLivenessEvents.UPDATE_SERVICE, livenessProbe);
                        this.serviceReady = true;
                    }
                })
                .catch(() => {
                    this.logger.debug('heartbeat error', '', 'AlertaModule');
                    if (this.serviceReady === true) {
                        let livenessProbe: ProbeLivenessServiceStatus = {
                            serviceId: 'AlertaModule',
                            isReady: false,
                            state: 'ping is fail'
                        };
                        this.eventBus.emit(ProbeLivenessEvents.UPDATE_SERVICE, livenessProbe);
                        this.serviceReady = false;
                    }
                });
        }, 5000);
        return new Promise((resolve, reject) => {
            this.alertaRepository.ping()
                .then(() => {
                    let readyProbeDone: ProbeReadyServiceStatus = {
                        serviceId: 'AlertaModule',
                        isReady: true,
                        state: 'Ready to process events'
                    };
                    this.eventBus.emit(ProbeReadyEvents.UPDATE_SERVICE, readyProbeDone);
                    let livenessProbe: ProbeLivenessServiceStatus = {
                        serviceId: 'AlertaModule',
                        isReady: true,
                        state: 'ready to process events'
                    };
                    this.eventBus.emit(ProbeLivenessEvents.UPDATE_SERVICE, livenessProbe);
                    this.serviceReady = true;
                    resolve(this);
                })
                .catch((err) => {
                    this.logger.error('Alerta service not available', err, 'Output -> Alerta');
                    reject(new Error('Alerta service not available'));
                });
        });
    }

    private registerMetrics(): void {
        this.metrics.set('output_processed', new client.Gauge({
            name: 'output_processed',
            help: 'Count processed',
            labelNames: ['driver', 'status'],
        }));

        this.metrics.forEach((value) => {
            this.eventBus.emit(HttpEvents.REGISTER_METRIC, value);
        });
    }

    public async applyNewAlertEvent(event: GlobalAlertInterface): Promise<boolean> {
        let alert: CreateAlertRequestInterface = this.mapGlobalAlertToAlerta(event);
        this.logger.info('Send alert into alerta', alert, 'Output -> Alerta');
        this.metrics.get('output_processed').inc({driver: 'alerta', status: 'request'});
        return await this.alertaRepository.create(alert)
            .then((result) => {
                this.logger.info('Alert was send to alerta: ' + event.externalEventId, result, 'Output -> Alerta');
                this.metrics.get('output_processed').inc({driver: 'alerta', status: 'success'});
                return true;
            })
            .catch((error) => {
                Core.error('Can not send alert: ' + event.externalEventId, {exception: error}, 'Output -> Alerta');
                this.metrics.get('output_processed').inc({driver: 'alerta', status: 'fail'});
                return false;

            });
    }

    private mapGlobalAlertToAlerta(alert: GlobalAlertInterface): CreateAlertRequestInterface {
        return {
            environment: this.environmentMap.get(alert.environment),
            event: alert.event,
            resource: alert.resource + ':' + alert.externalEventId,
            service: [],
            group: alert.from,
            text: alert.summary,
            severity: this.severityMap.get(alert.severity),
            status: this.statusMap.get(alert.status),
            attributes: alert.labels,
            value: alert.description,
            rawData: JSON.stringify(alert.raw),

        };
    }


}

export interface AlertaConfigInterface extends BaseModuleConfig {
    url: string;
    token: string;
    externalFields?: {
        group?: string
        origin?: string
        type?: string
        tags?: []
    };
}

enum AlertaEnvironment {
    production = 'prod',
    staging = 'stage',
    testing = 'test',
    development = 'dev'
}
