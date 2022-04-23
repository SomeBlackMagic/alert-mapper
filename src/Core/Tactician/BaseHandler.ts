export abstract class BaseHandler<T> {
    abstract handle(command: T): any | Promise<any>;
}

