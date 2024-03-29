import { env, envBoolean, envEnum, envNumber } from '@Helpers/functions';
import {ConsoleTarget} from '@elementary-lab/logger/src/Targets/ConsoleTarget';
import {SentryTarget} from '@elementary-lab/logger/src/Targets/SentryTarget';
import {LogLevel} from '@elementary-lab/logger/src/Types';
import {AppInfo, CoreConfigInterface} from '@Core/App';
import { AlertManagerConfigInterface } from '@Modules/AlertManager';
import { AlertaConfigInterface } from '@Modules/Alerta';
import {TelegramConfigInterface} from '@Modules/Telegram';

export class ConfigFactory {

    public static getBase(): AppInfo {
        return {
            id: 'AlertMapper',
            version: env('APP_VERSION'),
            environment: env('APP_ENV'),
        };
    }


    public static getCore(): CoreConfigInterface {
        return {
            log: {
                flushBySignals: [],
                flushByCountInterval: 10,
                flushByTimeInterval: 1000,
                traceLevel: 3,
                targets: [
                    new ConsoleTarget({
                        enabled: true,
                        levels: [ LogLevel.INFO, LogLevel.ERROR, LogLevel.NOTICE, LogLevel.DEBUG, LogLevel.WARNING, LogLevel.EMERGENCY]
                    }),
                    new SentryTarget({
                        enabled: envBoolean('APP_SENTRY_ENABLED', false),
                        dsn: env('APP_SENTRY_DSN', 'https://fake@fake.local/123'),
                        release: ConfigFactory.getBase().version,
                        environment: ConfigFactory.getBase().environment,
                        levels: [LogLevel.EMERGENCY, LogLevel.ERROR, LogLevel.WARNING]
                    })
                ]
            },
            http: {
                host: '*',
                port: 3000,
                timeout: 300,
                metrics: {
                    enabled: true,
                    collectDefaultMetrics: false,
                    prefix: ''
                }
            }
        };
    }


    public static getServices(): ServicesConfigInterface {
        return {
            inputs: {
                alertmanager: {
                    enabled: envBoolean('APP_INPUT_ALERTMANAGER_ENABLED', false),
                    instanceUrl: env('APP_INPUT_ALERTMANAGER_INSTANCE_URL', false),
                    auth: {
                        enabled: envBoolean('APP_INPUT_ALERTMANAGER_AUTH_ENABLED', false),
                        user: env('APP_INPUT_ALERTMANAGER_AUTH_USER', false),
                        pass: env('APP_INPUT_ALERTMANAGER_AUTH_PASS', false),
                    },
                    fields: {
                        environment: env('APP_INPUT_ALERTMANAGER_ENV'),
                        resource: env('APP_INPUT_ALERTMANAGER_RESOURCE')
                    }
                }
            },
            outputs: {
                alerta: {
                    enabled: envBoolean('APP_OUTPUT_ALERTA_ENABLED', false),
                    url: env('APP_OUTPUT_ALERTA_URL', false),
                    token: env('APP_OUTPUT_ALERTA_TOKEN', false),
                },
                telegram: {
                    enabled: envBoolean('APP_OUTPUT_TELEGRAM_ENABLED', false),
                    token: env('APP_OUTPUT_TELEGRAM_TOKEN', 'empty'),
                    allowCalls: envBoolean('APP_OUTPUT_TELEGRAM_ALLOW_CALLS', false),
                    chatId: env('APP_OUTPUT_TELEGRAM_CHAT_ID', 'empty'),
                    textMsgTemplatePath: env('APP_OUTPUT_TELEGRAM_TEXT_MSG_TEMPLATE_PATH', 'empty'),
                }
            }
        };
    }
}

interface ServicesConfigInterface {
    inputs: {
        alertmanager: AlertManagerConfigInterface
    };
    outputs: {
        alerta: AlertaConfigInterface
        telegram: TelegramConfigInterface
    };
}
