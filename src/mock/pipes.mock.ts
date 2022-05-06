import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'transactionAmount',
})
export class MockTransactionAmountPipe implements PipeTransform {
    transform(s: string): string {
        return s;
    }
}
@Pipe({
    name: 'checkoutPrice',
})
export class MockCheckoutPricePipe implements PipeTransform {
    transform(s: string): string {
        return s;
    }
}
@Pipe({
    name: 'price',
})
export class MockPricePipe implements PipeTransform {
    transform(s: string): string {
        return s;
    }
}
