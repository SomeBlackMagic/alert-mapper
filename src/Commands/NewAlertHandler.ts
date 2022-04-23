import {BaseHandler} from '@Core/Tactician/BaseHandler';
import {NewAlertCommand} from './NewAlertCommand';
import {Core} from '@Core/App';

export class NewAlertHandler extends BaseHandler<NewAlertCommand> {

    public async handle(command: NewAlertCommand) {
        let outputs = Core.app().getService<Iterable<any>>('outputs');
        let arr = [...outputs];
        let a = arr.map((item) => {
            return item.applyNewAlertEvent(command.getAlert());
        });
        let isFailed = false;
        await Promise.all(a).then((item) => {
            item.map((status) => {
                if (status === false && isFailed !== false) {
                    isFailed = true;
                }
            });
        });
        return isFailed;
    }

}
