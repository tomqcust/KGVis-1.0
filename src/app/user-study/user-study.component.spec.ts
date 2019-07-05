import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStudyComponent } from './user-study.component';

describe('UserStudyComponent', () => {
  let component: UserStudyComponent;
  let fixture: ComponentFixture<UserStudyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserStudyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
