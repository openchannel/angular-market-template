import { Injectable } from '@angular/core';
import {ActionButton, DownloadButtonType} from '../../../../../assets/data/configData';
import {AppResponse} from '@openchannel/angular-common-services';
import { get } from 'lodash';

@Injectable({
    providedIn: 'root',
})
export class ButtonActionService {
    canBeShow(app: AppResponse, buttons: ActionButton[]): ActionButton[] {
        return buttons.filter(button => {
            if (button.showForAppTypes?.length > 0 && !button.showForAppTypes.includes(app.type)) {
                return false;
            }
            switch (button.type) {
                case 'install':
                    return this.canBeShowInstallButton(app);
                case 'uninstall':
                    return this.canBeShowUninstallButton(app);
                case 'form':
                    return true;
                case 'purchase':
                    return true;
                case 'download':
                    return this.canBeShowDownloadButton(app, button);
                default:
                    return false;
            }
        });
    }

    private canBeShowInstallButton(app: any): boolean {
        return app?.ownership?.ownershipStatus !== 'active';
    }

    private canBeShowUninstallButton(app: any): boolean {
        return app?.ownership?.ownershipStatus === 'active';
    }

    private canBeShowDownloadButton(app: any, button: DownloadButtonType): boolean {
        return !!get(app, button.pathToFile);
    }
}
