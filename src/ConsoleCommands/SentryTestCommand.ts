import { Argument, BaseCliCommand, JobAction } from '@Core/BaseCliCommand';
import { Core } from '@Core/App';

export class SentryTestCommand extends BaseCliCommand<SentryTestCommand> {
    public getArguments(): Argument[] {
        return [];
    }

    public getDescription(): string {
        return '';
    }

    public getName(): string {
        return 'sentry-test';
    }

    public async run(action: JobAction): Promise<number> {
        Core.emergency('Test emergency error', {tag1: 'value1', tag2: 'value2'}, 'SentryTestCommand');
        try {
            throw new Error('Test error');
        } catch (e) {
            Core.error('Error exception', {exception: e, tag1: 'value1', tag2: 'value2'}, 'SentryTestCommand');
        }

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        //
        // await delay(2000); /// waiting 1 second.

        return Promise.resolve(1);
    }

}
