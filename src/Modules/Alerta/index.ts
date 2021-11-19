import { BaseModule, BaseModuleConfig } from "@Core/BaseModule";
import { EventBusInterface } from "@elementary-lab/standards/src/EventBusInterface";
import { SimpleEventBus } from "@elementary-lab/events/src/SimpleEventBus";
import { LoggerInterface } from "@elementary-lab/standards/src/LoggerInterface";
import { Core } from "@Core/App";
import Router from 'koa-router';
import { Context } from 'koa';

export class AlertaModule extends BaseModule<AlertaModule> {
    private config: AlertaConfigInterface;
    private bus: EventBusInterface<SimpleEventBus>;
    private logger: LoggerInterface;

    public constructor(config: AlertaConfigInterface, bus?: EventBusInterface<SimpleEventBus>, logger?: LoggerInterface) {
        super();
        this.config = config;
        this.bus = bus ?? Core.app().bus();
        this.logger = logger ?? Core.app().logger();
    }

    public init(): Promise<AlertaModule> {
        return Promise.resolve(this);
    }

    public run(): Promise<AlertaModule> {

        return Promise.resolve(this);
    }

}

export interface AlertaConfigInterface extends BaseModuleConfig {
    url: string
    token: string
}
