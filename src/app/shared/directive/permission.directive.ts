import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthHolderService, Permission } from '@openchannel/angular-common-services';

@Directive({
    selector: '[appPermissions]',
})
export class PermissionDirective implements OnInit {
    @Input('appPermissions') permission: Permission[];

    private element: ElementRef;

    constructor(private authHolder: AuthHolderService, private elementRef: ElementRef) {
        this.element = elementRef;
    }

    ngOnInit(): void {
        if (!this.authHolder.hasAnyPermission(this.permission)) {
            this.element.nativeElement.style.display = 'none';
        }
    }
}
