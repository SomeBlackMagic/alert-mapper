import {BaseCommand} from '@Core/Tactician/BaseCommand';
import {EventDescription} from '@tests/Common/TraceableEventBus';
import {TacticianCommandBus} from '@Core/Tactician/CommandBus';

export class TraceableCommandBus extends TacticianCommandBus {

    private emittedCommands: BaseCommand[] = [];

    public handle(command: BaseCommand) {
        this.emittedCommands.push(command);
        return [];
    }

    public getEmittedCommands() {
        return this.emittedCommands;
    }
}
