import { EventBusInterface } from "@elementary-lab/standards/src/EventBusInterface";
import { SimpleEventBus } from "@elementary-lab/events/src/SimpleEventBus";
import { LoggerInterface } from "@elementary-lab/standards/src/LoggerInterface";
import { Core } from "@Core/App";
import Router from "koa-router";
import { BaseModule, BaseModuleConfig } from "@Core/BaseModule";
import {Http} from '@Core/Http';
import { Context } from "koa";

export class AlertManagerModule extends BaseModule<AlertManagerModule>{
    private config: AlertManagerConfigInterface;
    private bus: EventBusInterface<SimpleEventBus>;
    private logger: LoggerInterface;
    private http: Http;

    public constructor(config: AlertManagerConfigInterface, bus?: EventBusInterface<SimpleEventBus>, logger?: LoggerInterface) {
        super();
        this.config = config;
        this.bus = bus ?? Core.app().bus();
        this.logger = logger ?? Core.app().logger();
        this.http = Core.app().getService<Http>('http');
    }

    public init(): Promise<AlertManagerModule> {
        this.http.registerRoutes(this.getHttpRoutes());
        return Promise.resolve(this);
    }

    public run(): Promise<AlertManagerModule> {

        return Promise.resolve(this);
    }

    public getHttpRoutes(): Router {
        let router = new Router({prefix: '/input/alert-manager'});
        router
            .all('/webhook', this.webhook.bind(this));

        return router;
    }

    /**
     *
     * @param {Application.Context} ctx
     * @returns {Promise<void>}
     * @private
     */
    private async webhook(ctx: Context) {
        // Add validation
        console.log('----------------------------------------')
        console.log(JSON.stringify(ctx.request.body))
        console.log('----------------------------------------')
        ctx.status = 200;
        ctx.body = 'OK';
    }
}

export interface AlertManagerConfigInterface extends BaseModuleConfig {
    instanceUrl: string
    auth: {
        enabled: boolean
        user: string
        pass: string
    }
}
