import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseWithTitleComponent } from './collapse-with-title.component';
import { By } from '@angular/platform-browser';

describe('CollapseWithTitleComponent', () => {
    let component: CollapseWithTitleComponent;
    let fixture: ComponentFixture<CollapseWithTitleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CollapseWithTitleComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CollapseWithTitleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit collapse state on collapse button click', () => {
        jest.spyOn(component.collapseChanged, 'emit');

        const collapseBtn = fixture.debugElement.query(By.css('.filters-collapse')).nativeElement;
        collapseBtn.click();

        expect(component.collapseChanged.emit).toHaveBeenCalledWith(!component.collapsed);
    });

    it('should change title according to collapse state', () => {
        const TITLE_FOR_CLOSE = 'TITLE FOR CLOSE';
        const TITLE_FOR_OPEN = 'TITLE FOR OPEN';

        const title = fixture.debugElement.query(By.css('.filters-collapse a')).nativeElement;

        component.titleForClose = TITLE_FOR_CLOSE;
        component.titleForOpen = TITLE_FOR_OPEN;

        component.collapsed = true;
        fixture.detectChanges();
        expect(title.textContent).toBe(TITLE_FOR_OPEN);

        component.collapsed = false;
        fixture.detectChanges();
        expect(title.textContent).toBe(TITLE_FOR_CLOSE);
    });

    it('should set rotate class on arrow according to collapse state', () => {
        const arrow = fixture.debugElement.query(By.css('.filters-collapse img')).nativeElement;

        component.collapsed = true;
        fixture.detectChanges();
        expect(arrow.classList.contains('rotate')).toBeTruthy();

        component.collapsed = false;
        fixture.detectChanges();
        expect(arrow.classList.contains('rotate')).toBeFalsy();
    });
});
