export interface ButtonAction {
    type: 'install' | 'form' | 'download' | 'purchase' | string;
    appTypes: string[];
    statistic: string;
}

export interface FormButtonAction extends ButtonAction, ViewData {
    formId: string;
}

export interface OwnershipButtonAction extends ButtonAction {
    unowned: ViewData;
    owned: ViewData;
}

export interface DownloadButtonAction extends ButtonAction {
    fileField: string;
    button: ButtonForm;
}

export interface PurchaseButtonAction extends ButtonAction {
    button: ButtonForm;
}

export interface ViewData {
    message: ToasterMessages;
    button: ButtonForm;
}

export interface ToasterMessages {
    success: string;
    fail: string;
    notFound?: string;
}

export interface ButtonForm {
    class: string;
    text: string;
}
