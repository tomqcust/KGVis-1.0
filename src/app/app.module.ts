import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularHighlightJsModule } from 'angular2-highlight-js';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ArticleComponent } from './article/article.component';
import { OperatorComponent } from './operator/operator.component';
import { UserStudyComponent } from './user-study/user-study.component';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);

@NgModule({
  declarations: [
    AppComponent,
    ArticleComponent,
    OperatorComponent,
    UserStudyComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularHighlightJsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
 }
