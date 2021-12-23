import { Component, Input, TemplateRef } from '@angular/core';

@Component({
    selector: 'mock-routing',
    template: '',
})
export class MockRoutingComponent {}

export class MockPrerenderRequestsWatcherService {
    setPrerenderStatus(ready: boolean): void {}
    create404MetaTag(): void {}
    remove404MetaTag(): void {}
}

@Component({
    selector: 'oc-button',
    template: '',
})
export class MockButtonComponent {
    @Input() text: string = '';
    @Input() disabled: boolean = false;
    @Input() type: 'primary' | 'secondary' | 'link' = 'primary';
    @Input() customClass: string;
    @Input() style: string;
    @Input() process: boolean;
    @Input() customTemplate: TemplateRef<any>;
}
