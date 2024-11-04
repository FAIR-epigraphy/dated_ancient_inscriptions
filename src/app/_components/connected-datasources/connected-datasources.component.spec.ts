import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedDatasourcesComponent } from './connected-datasources.component';

describe('ConnectedDatasourcesComponent', () => {
  let component: ConnectedDatasourcesComponent;
  let fixture: ComponentFixture<ConnectedDatasourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectedDatasourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectedDatasourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
