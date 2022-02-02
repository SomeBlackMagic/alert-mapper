import { GlobalAlertInterface } from "src/Interfaces/GlobalAlertInterface";

export class NewAlertEvent {
    public static readonly id = 'Global.NewAlertEvent';

    private readonly _uuid: string;
    private readonly _alert: GlobalAlertInterface;

    public constructor(uuid: string, alert: GlobalAlertInterface) {
        this._uuid = uuid;
        this._alert = alert;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public get alert(): GlobalAlertInterface {
        return this._alert;
    }
}
