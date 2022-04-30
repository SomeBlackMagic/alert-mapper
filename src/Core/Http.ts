import Koa, {Context} from 'koa';
import * as Router from 'koa-router';
import combineRouters from 'koa-combine-routers';
import bodyParser from 'koa-bodyparser';
import * as client from 'prom-client';
import {Registry} from 'prom-client';
import * as http from 'http';
import {Core} from '@Core/App';
import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';

export class Http {

    private config: HttpServerConfigInterface;
    private bus: EventBusInterface<SimpleEventBus>;
    private http: http.Server;
    private koa: Koa;
    private routers: any[] = [];
    private shuttingDown: boolean;
    private metricRegistry: Registry;

    public constructor(config: HttpServerConfigInterface, bus?: EventBusInterface<SimpleEventBus>) {
        this.config = config;
        this.bus = bus ?? Core.app().bus();
    }

    public init(): Http {
        this.koa = new Koa();
        this.http = http.createServer(this.koa.callback());

        this.koa.use((ctx, next) => {
            if (this.shuttingDown) {
                ctx.status = 503;
                ctx.set('Connection', 'close');
                ctx.body = 'Server is in the process of shutting down';
            } else {
                return next();
            }
        });

        this.koa.use(bodyParser({
            enableTypes: ['json', 'form', 'text'],
            onerror: function (err, ctx) {
                ctx.throw('body parse error', 422);
            }
        }));

        const requestId = require('koa-requestid');
        this.koa.use(requestId());

        if (this.config.metrics.enabled === true) {
            this.registerMetric();
        }

        return this;
    }

    private registerMetric(): void {
        this.metricRegistry = new client.Registry();
        if (this.config.metrics.collectDefaultMetrics) {
            client.collectDefaultMetrics({register: this.metricRegistry, prefix: this.config.metrics.prefix});
        }
        this.bus.on(HttpEvents.REGISTER_METRIC, async (metricItem) => {
                this.metricRegistry.registerMetric(metricItem);
        });
        let router = require('koa-router')();
        let routes = router.get('/metrics', async (ctx: Context) => {
            ctx.headers['content-type'] = this.metricRegistry.contentType;
            ctx.body = await this.metricRegistry.metrics();
        });
        this.registerRoutes(routes);
    }

    public registerRoutes(router: Router): void {
        this.routers.push(router);
    }

    public start(): Promise<Http> {
        return new Promise<Http | any>((resolve, reject) => {
            this.koa.use(combineRouters(this.routers)());
            this.koa.use(async (ctx, next) => {
                try {
                    await next();
                } catch (err) {
                    reject(err);
                }
            });
            this.http.listen(this.config.port, () => {
                Core.info('Listening on:', [this.config.host, this.config.port], 'ApiServer');
                resolve(this);
            });
        });
    }

    public stop(): void {
        if (this.shuttingDown) {
            Core.info('Api server in already in progress graceful shutdown', null, 'ApiServer');
            // We already know we're shutting down, don't continue this function
            return;
        } else {
            this.shuttingDown = true;
        }
    }
}


export class HttpEvents {
    public static readonly REGISTER_METRIC = 'Core.Http.REGISTER_METRIC';
    public static readonly UPDATE_METRIC = 'Core.Http.UPDATE_METRIC';
}

export interface HttpServerConfigInterface {
    host: string;
    port: number;
    timeout: number;
    metrics: {
        enabled: boolean;
        collectDefaultMetrics: boolean
        prefix: string;
    };
}
