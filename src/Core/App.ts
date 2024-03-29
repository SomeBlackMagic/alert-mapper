import {Logger} from '@elementary-lab/logger/src';
import {LoggerInterface} from '@elementary-lab/standards/src/LoggerInterface';
import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {LoggerConfigInterface} from '@elementary-lab/logger/src/Interface/LoggerConfigInterface';
import {HttpServerConfigInterface} from '@Core/Http';
import {ServiceRegistry} from '@Core/ServiceRegistry';
import { env, loadEnvFile } from '@Helpers/functions';
import * as fs from 'fs';

export class Core {

    private static $self: Core;

    private static appInfo: AppInfo;

    public static app(): Core {
        if (Core.$self === undefined) {
            throw Error('Application not bootstrap');
        }

        return Core.$self;
    }

    private registry: ServiceRegistry<any> = null;

    public static loadEnv(): void {
        let currentEnv = env('APP_ENV');
        if (fs.existsSync(process.cwd() + '/.env.local')) {
            const env = loadEnvFile(process.cwd() + '/.env.local');
            if (env === false) {
                process.exit(1);
            }
        }
        if (currentEnv !== null && currentEnv !== 'local') {
            if (fs.existsSync(process.cwd() + '/.env.' + currentEnv)) {
                const env = loadEnvFile(process.cwd() + '/.env.' + currentEnv);
                if (env === false) {
                    process.exit(1);
                }
            }
        }
    }

    public static bootstrap(info: AppInfo, coreConfig: CoreConfigInterface):void {
        Core.$self = new Core(coreConfig);
        Core.appInfo = info;
        Core.info('Hello ' + info.id, {version: info.version, env: info.environment});
        Core.info('Bootstrap system');

    }

    public static getAppInfo(): AppInfo {
        return Core.appInfo;
    }

    private constructor(coreConfig: CoreConfigInterface) {
        this.registry = ServiceRegistry.init();
        this.registry = this.registry
            .register('logger', new Logger(coreConfig.log))
            .register('bus', new SimpleEventBus(this.registry.get('logger')));
    }

    public logger(): LoggerInterface {
        return this.registry.get('logger');
    }

    public bus(): EventBusInterface<SimpleEventBus> {
        return this.registry.get('bus');
    }

    public registerService(key: string, object: any): void {
        this.registry = this.registry.register(key, object);
    }

    public getService<T>(key: string): T {
        return this.registry.get(key);
    }

    public static info(message: string, context?: any, category: string = 'application') {
        Core.app().logger().info(message, context, category);
    }
    public static emergency(message: string, context?: any, category: string = 'application') {
        Core.app().logger().emergency(message, context, category);
    }
    public static error(message: string, context?: any, category: string = 'application') {
        Core.app().logger().error(message, context, category);
    }
    public static debug(message: string, context?: any, category: string = 'application') {
        Core.app().logger().debug(message, context, category);
    }
    public static warn(message: string, context?: any, category: string = 'application') {
        Core.app().logger().warn(message, context, category);
    }
    public static profile(message: string, context?: any, category: string = 'application') {
        Core.app().logger().profile(message, context, category);
    }

    public exitHandler: Function;


    public subscribeOnProcessExit(): void {


        /*do something when app is closing*/
        // process.on('exit', this.exitHandler.bind(null, {cleanup: true, code:'exit'}));

        /*catches ctrl+c event*/
        process.on('SIGINT', this.exitHandler.bind(null, {exit: true, code:'SIGINT'}));
        process.on('SIGQUIT', this.exitHandler.bind(null, {exit: true, code:'SIGQUIT'}));

        /*catches "kill pid" (for example: nodemon restart)*/
        process.on('SIGUSR1', this.exitHandler.bind(null, {exit: true, code:'SIGUSR1'}));
        process.on('SIGUSR2', this.exitHandler.bind(null, {exit: true, code:'SIGUSR2'}));
        process.on('SIGTERM', this.exitHandler.bind(null, {exit: true, code:'SIGTERM'}));

        /*catches uncaught exceptions*/
        process.on('uncaughtException', this.uncaughtExceptionHandler);
        process.on('unhandledRejection', this.uncaughtRejectionHandler);
    }

    public setExitHandler(cb: Function): void {
        this.exitHandler = cb;
    }


    public uncaughtExceptionHandler(error: Error) {
        Core.error(error.message, error.stack, error.name);
        process.exit(99);

    }

    public uncaughtRejectionHandler(reason: {} | null | undefined, promise: Promise<any>) {
        if (typeof reason !== 'undefined') {
            Core.error(reason.toString());
        }
        process.exit(99);

    }


}

export interface AppInfo {
    id: string;
    version: string;
    environment: string;
}

export interface CoreConfigInterface {
    log: LoggerConfigInterface;
    http: HttpServerConfigInterface;
}
