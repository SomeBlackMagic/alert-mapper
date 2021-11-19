export abstract class BaseModule<T> {
    public abstract init(): Promise<T | boolean>;
    public abstract run(): Promise<T | boolean >;
    public stop(): Promise<T | boolean > {
        return  Promise.resolve(true);
    }
}

export interface BaseModuleConfig {
    enabled: boolean
}
