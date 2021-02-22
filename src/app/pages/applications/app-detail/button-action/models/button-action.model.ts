export interface ButtonAction {
  type: 'install' | 'form' | string,
  appTypes: string [],
}

export interface FormButtonAction extends ButtonAction, ViewData {
  formId: string,
}

export interface OwnershipButtonAction extends ButtonAction {
  unowned: ViewData;
  owned: ViewData;
}

export interface ViewData {
  message: ToasterMessages;
  button: ButtonForm;
}

export interface ToasterMessages {
  success: string;
  fail: string;
}

export interface ButtonForm {
  class: string;
  text: string;
}
