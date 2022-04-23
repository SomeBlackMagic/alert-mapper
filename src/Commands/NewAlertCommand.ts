import {BaseCommand} from '@Core/Tactician/BaseCommand';
import {GlobalAlertInterface} from '@Interfaces/GlobalAlertInterface';

export class NewAlertCommand extends BaseCommand {
    public _uuid: string;
    public _alert: GlobalAlertInterface;


    public constructor(uuid: string, alert: GlobalAlertInterface) {
        super();
        this._uuid = uuid;
        this._alert = alert;
    }

    public getUuid(): string {
        return this._uuid;
    }

    public getAlert() {
        return this._alert;
    }


}
