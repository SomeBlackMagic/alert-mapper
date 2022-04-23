import { ActionParameters } from 'types';

export abstract class BaseJob<T> {
    abstract getName(): string;
    abstract getDescription(): string;
    abstract getArguments(): Argument[];
    abstract run(action: JobAction): Promise<number>;

}

export interface Argument {
    name: string;
    description: string;
}

export interface JobAction extends ActionParameters {}
