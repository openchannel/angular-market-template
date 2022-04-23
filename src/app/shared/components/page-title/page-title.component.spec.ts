import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTitleComponent } from './page-title.component';
import { By } from '@angular/platform-browser';
import { MockButtonComponent } from '../../../../mock/components.mock';

describe('PageTitleComponent', () => {
    let component: PageTitleComponent;
    let fixture: ComponentFixture<PageTitleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PageTitleComponent, MockButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PageTitleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit navigate click when click on navigate block', () => {
        jest.spyOn(component.navigateClick, 'emit');

        component.navigateText = 'Some text';
        fixture.detectChanges();

        const navigateBlock = fixture.debugElement.query(By.css('.main-container__page-title__router-navigate')).nativeElement;
        navigateBlock.click();
        expect(component.navigateClick.emit).toHaveBeenCalled();
    });

    it('should emit custom button click when click on custom button', () => {
        jest.spyOn(component.buttonClick, 'emit');

        component.buttonText = 'Some text';
        fixture.detectChanges();

        const customBtn = fixture.debugElement.query(By.css('.main-container__custom-button')).nativeElement;
        customBtn.click();
        expect(component.buttonClick.emit).toHaveBeenCalled();
    });

    it('should render navigate block only if navigateText exist', () => {
        component.navigateText = 'Some text';
        fixture.detectChanges();
        let navigateBlock = fixture.debugElement.query(By.css('.main-container__page-title__router-navigate'));
        expect(navigateBlock).toBeTruthy();

        component.navigateText = null;
        fixture.detectChanges();
        navigateBlock = fixture.debugElement.query(By.css('.main-container__page-title__router-navigate'));
        expect(navigateBlock).toBeNull();
    });

    it('should render custom button only if buttonText exist', () => {
        component.buttonText = 'Some text';
        fixture.detectChanges();
        let customBtn = fixture.debugElement.query(By.css('.main-container__custom-button'));
        expect(customBtn).toBeTruthy();

        component.buttonText = null;
        fixture.detectChanges();
        customBtn = fixture.debugElement.query(By.css('.main-container__custom-button'));
        expect(customBtn).toBeNull();
    });

    it('should use navigateText and pageTitle in the template', () => {
        const NAVIGATE_TEXT = 'NAVIGATE TEXT';
        const PAGE_TITLE = 'PAGE TITLE';

        component.navigateText = NAVIGATE_TEXT;
        component.pageTitle = PAGE_TITLE;
        fixture.detectChanges();

        const navigateTextElement = fixture.debugElement.query(By.css('.main-container__page-title-breadcrumbs')).nativeElement;
        const pageTitleElement = fixture.debugElement.query(By.css('.main-container__page-title__title')).nativeElement;

        expect(navigateTextElement.textContent).toBe(NAVIGATE_TEXT);
        expect(pageTitleElement.textContent).toBe(PAGE_TITLE);
    });

    it('should pass buttonText to the custom button', () => {
        const BUTTON_TEXT = 'BUTTON TEXT';

        component.buttonText = BUTTON_TEXT;
        fixture.detectChanges();

        const customBtnComponent = fixture.debugElement.query(By.css('.main-container__custom-button')).componentInstance;
        expect(customBtnComponent.text).toBe(BUTTON_TEXT);
    });
});
