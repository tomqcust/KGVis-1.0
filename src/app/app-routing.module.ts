import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ArticleComponent} from './article/article.component';
import {OperatorComponent} from './operator/operator.component';
const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  { path: 'doc', component: OperatorComponent },
  { path: '', component: ArticleComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
