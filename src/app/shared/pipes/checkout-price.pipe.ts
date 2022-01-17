import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
    name: 'checkoutPrice',
})
export class CheckoutPricePipe implements PipeTransform {
    private isoCurrencyCode = {
        USD: '$',
        EUR: '€',
        CNY: '¥',
        GBP: '£',
    };
    constructor(private decimalPipe: DecimalPipe) {}

    transform(priceValue: number, currency: string): string {
        return this.isoCurrencyCode[currency] + this.decimalPipe.transform(priceValue / 100, '1.2-2');
    }
}
