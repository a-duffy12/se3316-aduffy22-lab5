import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // member fields for controlling state
  loggedIn: boolean = false;
  buildLogin: boolean = false;
  buildUser: boolean = false;
  newUser: boolean = false;

  // memer fields to house user information
  userProfile: any;
  userEmail: string = "";
  userPassword: string= "";
  passCheck: string = "";
  userName: string = "";

  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) { }

  ngOnInit(): void {
  }

  // method to login locally
  login()
  {
    this.buildLogin = true;
    this.loggedIn = true;

    // query back end to see if user needs to be registered or not
    this.register();
    // check if user is active, if not, prevent login
  }

  // method to login via Auth0
  loginA(): void
  {
    this.auth.loginWithRedirect();

    // query back end to see if user needs to be registered or not
    this.register();
    // check if user is active, if not, prevent login
  }

  // method to logout via Auth0
  logout(): void
  {
    this.reset(); // reset member variables

    if (this.auth.user$) // if the user used auth0 to log in
    {
      this.auth.logout({ returnTo: this.document.location.origin }); // log out with auth0
    }
    else if (this.loggedIn)
    {
      this.loggedIn = false;
    }
  }

  // method to register used in back end database
  register()
  {
    if (this.auth.user$) // if the user is logged in with Auth0
    {
      this.auth.user$.subscribe((profile) => {
        this.userProfile = profile;
        // build user object
        // send user object to back end via POST
      })
    }
    else if (this.loggedIn) // if the user is logged in locally
    {
      // verify email is real
      // verify both passwords match
      // build user object
      // send user object to back end via POST
    }
  }

  // method to reset membter fields in between uses
  reset()
  {
    this.userEmail = "";
    this.userPassword = "";
    this.passCheck = "";
    this.userName = "";
    this.userProfile = undefined;
  }
}
