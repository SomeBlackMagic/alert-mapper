import { Argument, BaseJob, JobAction } from '@Core/BaseJob';
import { EventBusInterface } from "@elementary-lab/standards/src/EventBusInterface";
import { SimpleEventBus } from "@elementary-lab/events/src/SimpleEventBus";
import { Core } from "@Core/App";
import { AlertManagerModule } from "@Modules/AlertManager";
import { ConfigFactory } from "@Config/app-config";

export class ListenCommand extends BaseJob<ListenCommand> {
    private bus: EventBusInterface<SimpleEventBus>;

    public constructor(bus?: EventBusInterface<SimpleEventBus>) {
        super();
        this.bus = bus ?? Core.app().bus();
    }


    public getName(): string {
        return 'Test';
    }

    public getDescription(): string {
        return '';
    }

    public getArguments(): Argument[] {
        return [
            // {
            //     name: '<poriod>',
            //     description: 'test'
            // }
        ];
    }

    public async run(action: JobAction): Promise<number> {
        return 1;
    }


}
