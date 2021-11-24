import { BaseModule, BaseModuleConfig } from "@Core/BaseModule";
import { EventBusInterface } from "@elementary-lab/standards/src/EventBusInterface";
import { SimpleEventBus } from "@elementary-lab/events/src/SimpleEventBus";
import { LoggerInterface } from "@elementary-lab/standards/src/LoggerInterface";
import { Core } from "@Core/App";
import { NewAlertEvent } from "src/Events/NewAlertEvent";
import { AlertaAlertsRepository } from "@elementary-lab/alerta/src/Repository/AlertaAlertsRepository";
import {
    AlertStatus,
    CreateAlertRequestInterface,
    SeverityLevels
} from "@elementary-lab/alerta/src/Domain/Interfaces/Alerts";
import {
    GlobalAlertEnvironment,
    GlobalAlertInterface,
    GlobalSeverityLevels, GlobalStatus
} from "src/Interfaces/GlobalAlertInterface";

export class AlertaModule extends BaseModule<AlertaModule> {
    private config: AlertaConfigInterface;
    private bus: EventBusInterface<SimpleEventBus>;
    private logger: LoggerInterface;
    private alertaRepository: AlertaAlertsRepository;

    private environmentMap: Map<GlobalAlertEnvironment, AlertaEnvironment>  = new Map<GlobalAlertEnvironment, AlertaEnvironment>([
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




    public constructor(config: AlertaConfigInterface, alertaRepository?: AlertaAlertsRepository, bus?: EventBusInterface<SimpleEventBus>, logger?: LoggerInterface) {
        super();
        this.config = config;
        this.alertaRepository = alertaRepository ?? new AlertaAlertsRepository(this.config.url, this.config.token)
        this.bus = bus ?? Core.app().bus();
        this.logger = logger ?? Core.app().logger();
    }

    public init(): Promise<AlertaModule> {
        this.bus.on(NewAlertEvent.id, this.applyNewAlertEvent.bind(this));

        return Promise.resolve(this);
    }

    public run(): Promise<AlertaModule> {

        return Promise.resolve(this);
    }


    public async applyNewAlertEvent(event: NewAlertEvent) {
        let alert: CreateAlertRequestInterface  = this.mapGlobalAlertToAlerta(event.alert);
        let res = await this.alertaRepository.create(alert)
            .catch((error) => {
                this.logger.error("Can not send alert", error);
                console.error(error)
            })
        console.log(res);

    }

    private mapGlobalAlertToAlerta(alert: GlobalAlertInterface): CreateAlertRequestInterface {

        return {
            resource: "alertmanager",
            event: alert.event,
            text: alert.summary,
            environment: this.environmentMap.get(alert.environment),
            severity: this.severityMap.get(alert.severity),
            status: this.statusMap.get(alert.status),
            attributes: alert.labels,
            value: alert.description,
            rawData: JSON.stringify(alert.raw),

            // TODO implement
            // group: "app",
            // origin: "origin",
            // service: [],
            // type: "",
            // tags: [],

        }
    }


}

export interface AlertaConfigInterface extends BaseModuleConfig {
    url: string
    token: string
    externalFields?: {
        group?: string
        origin?: string
        type?: string
        tags?: []
    }
}

enum AlertaEnvironment {
    production = 'prod',
    staging = 'stage',
    testing = 'test',
    development = 'dev'
}
