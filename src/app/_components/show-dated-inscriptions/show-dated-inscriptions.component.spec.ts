import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDatedInscriptionsComponent } from './show-dated-inscriptions.component';

describe('ShowDatedInscriptionsComponent', () => {
  let component: ShowDatedInscriptionsComponent;
  let fixture: ComponentFixture<ShowDatedInscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowDatedInscriptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowDatedInscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
