import { throwError } from 'rxjs';

export const throwObservableError = (getIsThrowError: () => boolean) => (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any): any {
        if (getIsThrowError()) {
            return throwError('Error');
        } else {
            // tslint:disable-next-line:no-invalid-this
            return originalMethod.apply(this, args);
        }
    };
};
