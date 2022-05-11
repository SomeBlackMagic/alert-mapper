import {BaseModule, BaseModuleConfig} from '@Core/BaseModule';
import {GlobalAlertInterface} from '@Interfaces/GlobalAlertInterface';
import client from 'prom-client';
import {Http, HttpEvents} from '@Core/Http';
import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {LoggerInterface} from '@elementary-lab/standards/src/LoggerInterface';
import {Telegraf} from 'telegraf';
import {Core} from '@Core/App';

export class TelegramModule extends BaseModule<TelegramModule> {
    private config: TelegramConfigInterface;
    private eventBus: EventBusInterface<SimpleEventBus>;
    private logger: LoggerInterface;
    private botInstance: Telegraf;

    private metrics: Map<string, client.Gauge<string>> = new Map<string, client.Gauge<string>>([]);

    public constructor(
        config: TelegramConfigInterface,
        telegraf?: Telegraf,
        eventBus?: EventBusInterface<any>,
        logger?: LoggerInterface
    ) {
        super();
        this.config = config;
        // this.botInstance = telegraf ?? new Telegraf(this.config.token);
        this.logger = logger ?? Core.app().logger();
        this.eventBus = eventBus ?? Core.app().bus();
    }

    public init(): Promise<boolean | TelegramModule> {
        this.registerMetrics();
        return Promise.resolve(undefined);
    }

    public run(): Promise<boolean | TelegramModule> {
        return Promise.resolve(undefined);
    }

    private registerMetrics(): void {
        // this.metrics.set('output_processed', new client.Gauge({
        //     name: 'output_processed',
        //     help: 'Count processed',
        //     labelNames: ['driver', 'status'],
        // }));

        this.metrics.forEach((value) => {
            this.eventBus.emit(HttpEvents.REGISTER_METRIC, value);
        });
    }

    public async applyNewAlertEvent(event: GlobalAlertInterface): Promise<boolean> {
        this.logger.info('Send alert into alerta', event, 'Output -> Telegram');
        this.metrics.get('output_processed').inc({driver: 'telegram', status: 'request'});
        return Promise.resolve(true);

    }
}


export interface TelegramConfigInterface extends BaseModuleConfig {
    allowCalls: boolean;
    token: string;
    chatId: string;
    textMsgTemplatePath: string;
}
