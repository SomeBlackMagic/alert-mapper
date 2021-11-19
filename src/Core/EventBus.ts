import { EventBusInterface } from '@elementary-lab/standards/src/EventBusInterface';
import { SimpleEventBus } from '@elementary-lab/events/src/SimpleEventBus';
import { Core } from '@Core/App';
import { BlockchainConfigInterface } from '@Modules/Blockchain';

export class EventBus {

    public constructor(bus?: EventBusInterface<SimpleEventBus>) {
        // this.bus = bus ?? Core.app().bus();
    }
}
