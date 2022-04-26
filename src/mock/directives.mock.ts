import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Permission } from '@openchannel/angular-common-services';

@Directive({
    selector: 'infiniteScroll',
})
export class MockInfiniteScrollDirective {
    @Output() readonly scrolled: EventEmitter<any> = new EventEmitter<any>();
}

@Directive({
    selector: 'ngbDropdown',
})
export class MockNgbDropdownDirective {
    @Input() placement: string = '';
}

@Directive({
    selector: 'ngbDropdownToggle',
})
export class MockNgbDropdownToggleDirective {}

@Directive({
    selector: 'ngbDropdownMenu',
})
export class MockNgbDropdownMenuDirective {}

@Directive({
    selector: 'ngbDropdownItem',
})
export class MockNgbDropdownItemDirective {}

@Directive({
    selector: '[appPermissions]',
})
export class MockPermissionDirective {
    @Input('appPermissions') permission: Permission[];
}
