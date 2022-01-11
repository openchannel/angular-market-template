import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'transactionAmount',
})
export class TransactionAmountPipe implements PipeTransform {
    transform(amount: number): string {
        return `$${amount / 100}`;
    }
}
