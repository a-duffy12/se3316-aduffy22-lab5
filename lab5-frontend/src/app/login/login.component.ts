import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';

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
  error: string = "";

  // memer fields to house user information
  savedProfile: any;
  userEmail: string = "";
  userPassword: string= "";
  userName: string = "";

  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService, private http: HttpClient, private val: Validator) { }

  ngOnInit(): void {
  }

  // method to login locally
  login()
  {
    this.error = ""; // reset error message

    if (this.userEmail && this.userPassword && this.val.validateEmail(this.userEmail))
    { // get request to see if the user already exists
      this.http.get(`http://localhost:3000/api/open/users/${this.userEmail}`).subscribe((data:any) => {
        this.savedProfile = data; // set returned data to the saved profile

        if (this.savedProfile.password === this.userPassword) // make sure passwords match
        {
          if (!this.savedProfile.active) // if the user has been set to inactive
          {
            console.log(`User: ${this.userEmail} has been deactivated!`);
            this.error = `User: ${this.userEmail} has been deactivated! Please contact a site administrator`;
          }
          else
          {
            console.log(`Logging in user: ${this.userEmail}`);
            this.loggedIn = true; // allow log in
            this.val.setActiveUser(this.userEmail); // set active user
          }
        }
        else
        {
          this.error = "Incorrect password!";
          console.log("Incorrect password!");
        }
      },
      (error: any) => { // if the user does not exist, then automatically register them
        console.log(`Registering user: ${this.userEmail}`);
        this.loggedIn = true;
        this.register();
      })
    }
    else
    {
      this.error = "Invalid input!";
      console.log("Invalid input!");
    }
  }

  // method to login via Auth0 // TODO
  loginA(): void
  {
    this.error = ""; // reset error message

    this.auth.loginWithRedirect();

    if (this.auth.user$)
    {
      this.auth.user$.subscribe((profile) => {

        this.http.get(`http://localhost:3000/api/open/users/${profile.email}`).subscribe((data:any) => {
          this.savedProfile = data; // set returned data to the saved profile

          if (this.savedProfile.email == profile.email)
          {
            if (!this.savedProfile.active) // if the user has been set to inactive
            {
              console.log(`User: ${profile.email} has been deactivated!`);
              this.error = `User: ${profile.email} has been deactivated!`;
              this.logout();
            }
            else
            {
              this.val.setActiveUser(String(profile.email)); // set active user
            }
          }
          else
          {
            console.log(`Registering user: ${profile.email}`);
            this.register();
          }
        },
        (error: any) => { // if the user does not exist
          console.log(`Registering user: ${profile.email}`);
          this.register();
        })
      })
    }
  }

  // method to logout via Auth0
  logout(): void
  {
    if (this.auth.user$) // if the user used auth0 to log in
    {
      this.auth.logout({ returnTo: this.document.location.origin }); // log out with auth0
      this.val.setActiveUser(""); // set active user to an empty string
    }
    else if (this.loggedIn)
    {
      console.log(`Logging out user: ${this.userEmail}`);
      this.loggedIn = false;
      this.val.setActiveUser(""); // set active user to an empty string
    }

    this.reset(); // reset member variables
  }

  // method to register used in back end database
  register()
  {
    if (this.auth.user$ && !this.loggedIn) // if the user is logged in with Auth0
    {
      this.auth.user$.subscribe((profile) => {
        let newUser: PostUser = { // create JSON to send to back end
          name: profile.nickname,
          password: "3p",
          active: true,
          verified: profile.email_verified,
          permission_level: "secure"
        }
        // send new user data to back end
        this.http.post(`http://localhost:3000/api/open/users/${profile.email}`, JSON.stringify(newUser), reqHeader).subscribe((data:any) => {
          console.log(`Created user: ${profile.email}`)
          console.log(data);
        })
      })
    }
    else if (this.loggedIn) // if the user is logged in locally
    {
      let newUser: PostUser = { // create JSON to send to back end
        name: this.userEmail.substring(0, this.userEmail.lastIndexOf("@")),
        password: this.userPassword,
        active: true,
        verified: false,
        permission_level: "secure"
      }
      // send new user data to back end
      this.http.post(`http://localhost:3000/api/open/users/${this.userEmail}`, JSON.stringify(newUser), reqHeader).subscribe((data:any) => {
          console.log(`Created user: ${this.userEmail}`)
          console.log(data);
        })
    }
  }

  // method to reset membter fields in between uses
  reset()
  {
    this.userEmail = "";
    this.userPassword = "";
    this.userName = "";
    this.savedProfile = undefined;
  }
}

// type to send to backend to create a user
interface PostUser {
  name: string,
  password: string,
  active: boolean,
  verified: boolean,
  permission_level: string
}

// build options for the http requests
const reqHeader = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Access-Control-Allow-Headers": "Content-Type"
  })
}
