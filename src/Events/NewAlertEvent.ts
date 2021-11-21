import { AlertInterface } from "src/Interfaces/AlertInterface";

export class NewAlertEvent {
    public static readonly id = 'Global.NewAlertEvent';

    private _uuid: string;
    private _alert: AlertInterface;

    public constructor(uuid: string, alert: AlertInterface) {
        this._uuid = uuid;
        this._alert = alert;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public get alert(): AlertInterface {
        return this._alert;
    }
}
