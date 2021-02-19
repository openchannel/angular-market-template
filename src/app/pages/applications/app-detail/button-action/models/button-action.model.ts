export interface ButtonAction {
  type: string,
  appTypes: string [],
  formId: string,
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
