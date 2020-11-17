import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Validator } from './validator.service';
import { LoginComponent } from './login/login.component';
import { OpenComponent } from './open/open.component';
import { SecureComponent } from './secure/secure.component';
import { AdminComponent } from './admin/admin.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    OpenComponent,
    SecureComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [Validator],
  bootstrap: [AppComponent]
})
export class AppModule { }
