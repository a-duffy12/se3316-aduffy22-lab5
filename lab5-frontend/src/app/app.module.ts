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
import { AuthModule } from '@auth0/auth0-angular';
import { PolicyComponent } from './policy/policy.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    OpenComponent,
    SecureComponent,
    AdminComponent,
    PolicyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,

    // import auth0 module into the application with specified configuration
    AuthModule.forRoot({
      domain: 'dev-7wim8ia3.us.auth0.com',
      clientId: 'VCvWBGbyOJ6zmfNWfUhcfpAkiE0H1K0D'
    })
  ],
  providers: [Validator],
  bootstrap: [AppComponent]
})
export class AppModule { }
