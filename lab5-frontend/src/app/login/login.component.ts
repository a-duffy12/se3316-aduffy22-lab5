import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // member fields for controlling state
  subscription: Subscription;
  activeUser: string = "";
  done: number = 0;
  loggedIn: boolean = false;
  newUser: boolean = false;
  buildLogin: boolean = false;
  buildUser: boolean = false;
  error: string = "";

  // memer fields to house user information
  backData: any;
  savedProfile: any;
  userEmail: string = "";
  userPassword: string= "";
  userName: string = "";
  newUserName: string = "";
  newUserPassword: string = "";
  exPassword: string = "";

  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService, private http: HttpClient, private val: Validator) {

    // every second, update the active user variable
    this.subscription = interval(1000).subscribe(() => {
      this.activeUser = this.val.getActiveUser();
    });

    // every second, check if the user logged in via Auth0
    this.subscription = interval(1000).subscribe(() => {

      if (this.auth.user$ && this.done == 0)
      {
        this.auth.user$.subscribe((profile) => {

          this.http.get(`http://localhost:3000/api/open/users/${profile.email}`).subscribe((data:any) => {
            this.savedProfile = data; // set returned data to the saved profile

            if (this.savedProfile.email == profile.email)
            {
              if (!this.savedProfile.active) // if the user has been set to inactive
              {
                this.done = 1;
                console.log(`User: ${profile.email} has been deactivated!`);
                this.error = `User: ${profile.email} has been deactivated!`;
                this.logout();
                this.done = 0;
              }
              else
              {
                this.done = 1;
                this.val.setActiveUser(String(profile.email)); // set active user
                console.log(`Logging in user: ${profile.email}`);
              }
            }
            else
            {
              this.done = 2;
              console.log(`Need to register user: ${profile.email}`);
            }
          },
          (error: any) => { // if the user does not exist
            this.done = 2;
            console.log(`Need to register user: ${profile.email}`);
          })
        })
      }
    });

   }

  ngOnInit(): void {
  }

  // method to login locally
  login()
  {
    this.error = ""; // reset error message

    if (this.userEmail && this.userPassword && this.val.validateEmail(this.userEmail) && this.val.validatePass(this.userPassword, 100))
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
        console.log(`Unrecognized user: ${this.userEmail}`);
        this.error = "Unrecognized user, please register!";
        this.newUser = true;
      })
    }
    else if (this.userEmail && this.userPassword && this.val.validatePass(this.userPassword, 100))
    {
      this.error = "Please enter a valid email address!";
      console.log("Invalid input!");
    }
    else if (this.userPassword && this.val.validatePass(this.userPassword, 100))
    {
      this.error = "Please enter an email address!";
      console.log("Invalid input!");
    }
    else if (this.userEmail && this.val.validateEmail(this.userEmail))
    {
      this.error = "Please enter a password!";
      console.log("Invalid input!")
    }
    else
    {
      this.error = "Invalid input!";
      console.log("Invalid input!");
    }
  }

  // method to login via Auth0
  loginA(): void
  {
    this.error = ""; // reset error message

    this.auth.loginWithRedirect();
  }

  // method to logout via Auth0
  logout(): void
  {
    if (this.auth.user$) // if the user used auth0 to log in
    {
      this.auth.logout({ returnTo: this.document.location.origin }); // log out with auth0
      this.val.setActiveUser(""); // set active user to an empty string
      this.done = 0;
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
    this.error = ""; // reset error message

    if (this.auth.user$ && !this.newUser) // if the user is logged in with Auth0
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
      this.done = 0;
    }
    else if (this.newUser) // if the user is logged in locally
    {

      if (this.userEmail && this.userPassword && this.userName && this.val.validateEmail(this.userEmail) && this.val.validatePass(this.userPassword, 100) && this.val.validate(this.userName, 20))
      {
        // get request to see if the user already exists
        this.http.get(`http://localhost:3000/api/open/users/${this.userEmail}`).subscribe((data:any) => {
          this.error = `Cannot create a new account for existing user: ${data.email}`;
        },
        (error:any) => {

          let user: PostUser = { // create JSON to send to back end
            name: this.userName,
            password: this.userPassword,
            active: true,
            verified: false,
            permission_level: "secure"
          }
          // send new user data to back end
          this.http.post(`http://localhost:3000/api/open/users/${this.userEmail}`, JSON.stringify(user), reqHeader).subscribe((data:any) => {
            console.log(`Created user: ${this.userEmail}`)
            console.log(data);
          })

          this.loggedIn = true;
          this.newUser = false;
        })
      }
      else if (this.userEmail && this.userPassword && this.userName && this.val.validatePass(this.userPassword, 100) && this.val.validate(this.userName, 20))
      {
        this.error = "Please enter a valid email address!";
        console.log("Invalid input!");
      }
      else if (this.userPassword && this.userName && this.val.validatePass(this.userPassword, 100) && this.val.validate(this.userName, 20))
      {
        this.error = "Please enter an email address!";
        console.log("Invalid input!");
      }
      else if (this.userEmail && this.userName && this.val.validateEmail(this.userEmail) && this.val.validate(this.userName, 20))
      {
        this.error = "Please enter a pawwsord!";
        console.log("Invalid input!");
      }
      else
      {
        this.error = "Invalid input!";
        console.log("Invalid input!");
      }
    }
  }

  // update username
  updateUsername()
  {
    this.reset(); // reset member variables

    if (this.newUserName != "" && this.exPassword != "" && this.val.validate(this.newUserName, 20) && this.val.validatePass(this.exPassword, 100))
    {
      let obj = { // build request body
        old_password: this.exPassword,
        name: this.newUserName
      }

      // request to back end
      this.http.put(`http://localhost:3000/api/secure/users/name/${this.activeUser}`, JSON.stringify(obj), reqHeader).subscribe((data:any) => {
        this.backData = data; // get reponse from the back end
      })
      console.log(`Updated username of user: ${this.activeUser}`);
    }
    else if (this.newUserName != "" && this.val.validatePass(this.newUserName, 20))
    {
      this.error = "Invalid input for existing password field!";
      console.log("Invalid input!");
    }
    else if (this.exPassword != "" && this.val.validatePass(this.exPassword, 100))
    {
      this.error = "Invalid input for new username field!";
      console.log("Invalid input!");
    }
    else
    {
      this.error = "Invalid input for new uersname and existing password fields!";
      console.log("INvalid input!");
    }
  }

  // update password
  updatePassword()
  {
    this.reset(); // reset member variables

    if (this.newUserPassword != "" && this.exPassword != "" && this.val.validatePass(this.newUserPassword, 100) && this.val.validatePass(this.exPassword, 100))
    {
      let obj = { // build request body
        old_password: this.exPassword,
        password: this.newUserPassword
      }

      // request to back end
      this.http.put(`http://localhost:3000/api/secure/users/pass/${this.activeUser}`, JSON.stringify(obj), reqHeader).subscribe((data:any) => {
        this.backData = data; // get reponse from the back end
      })
      console.log(`Updated password of user: ${this.activeUser}`);
    }
    else if (this.newUserPassword != "" && this.val.validatePass(this.newUserPassword, 100))
    {
      this.error = "Invalid input for existing password field!";
      console.log("Invalid input!");
    }
    else if (this.exPassword != "" && this.val.validatePass(this.exPassword, 100))
    {
      this.error = "Invalid input for new password field!";
      console.log("Invalid input!");
    }
    else
    {
      this.error = "Invalid input for new password and existing password fields!";
      console.log("INvalid input!");
    }
  }

  // method to reset member fields in between uses
  reset()
  {
    this.backData = undefined;
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
