import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';


/*const links = [  { source : 0  , target: 1 } , { source : 1  , target: 2 } ,
  { source : 3  , target: 2 } , { source : 3  , target: 4 } ,
  { source : 3  , target: 1 } , { source : 2  , target: 4 }];*/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hello-world';
  constructor(private router: Router) { }
}


