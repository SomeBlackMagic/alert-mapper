import * as path from 'path';
import { env, envBoolean, envEnum, envNumber } from '@Helpers/functions';
import {ConsoleTarget} from '@elementary-lab/logger/src/Targets/ConsoleTarget';
import {SentryTarget} from '@elementary-lab/logger/src/Targets/SentryTarget';
import {LogLevel} from '@elementary-lab/logger/src/Types';
import {AppInfo, CoreConfigInterface} from '@Core/App';
import { AlertManagerConfigInterface } from "@Modules/AlertManager";
import { AlertaConfigInterface } from "@Modules/Alerta";

export class ConfigFactory {

    public static getBase(): AppInfo {
        return {
            id: env('APP_NAME', 'app'),
            version: env('APP_VERSION'),
            environment: env('APP_ENV'),
        };
    }


    public static getCore(): CoreConfigInterface {
        return {
            log: {
                flushInterval: 1,
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
                        levels: [LogLevel.ERROR, LogLevel.WARNING]
                    })
                ]
            },
            http: {
                host: '*',
                port: 3000,
                timeout: 300
            }
        };
    }


    public static getServices(): ServicesConfigInterface {
        return {
            inputs: {
                alertmanager: {
                    enabled: true,
                    instanceUrl: env('APP_ALERTMANAGER_INSTANCE_URL', false),
                    auth: {
                        enabled: envBoolean('APP_ALERTMANAGER_AUTH_ENABLED', false),
                        user: env('APP_ALERTMANAGER_AUTH_USER', false),
                        pass: env('APP_ALERTMANAGER_AUTH_PASS', false),
                    }
                }
            },
            outputs: {
                alerta: {
                    enabled: false,
                    url: 'http://localhost:8080',
                    token: 'test-token'
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
    }
}
