import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryDatedInscriptionsComponent } from './summary-dated-inscriptions.component';

describe('SummaryDatedInscriptionsComponent', () => {
  let component: SummaryDatedInscriptionsComponent;
  let fixture: ComponentFixture<SummaryDatedInscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryDatedInscriptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryDatedInscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
