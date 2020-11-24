import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  // fields to track whether a user is logged in or not
  subscription: Subscription;
  activeUser: string = "";
  ad: boolean = false;

  // member variables
  addUser: string = ""; // username of user to give admin to
  subject: string = ""; // subject of the review to show/hide
  course: string = ""; // course of the review to show/hide
  userEmail: string = ""; // email of author of the review to show/hide
  deUser: string = ""; // username of user to activate/deactivate

  // member variables for output
  gData: any;
  rData: any;
  dData: any;
  gError: string = "";
  rError: string = "";
  dError: string = "";

  constructor(private http: HttpClient, private val: Validator)
  {
    // every second, update the active user variable
    this.subscription = interval(10000).subscribe(() => {
      this.activeUser = this.val.getActiveUser();

      if (this.activeUser)
      {
        // check to see if this user is an admin
        this.http.get(`http://localhost:3000/api/open/users/${this.activeUser}`).subscribe((data:any) => {
          if (data.permission_level === "admin") // if user is an admin
          {
            this.ad = true; // reveal admin level content
          }
          else // if user is not an admin
          {
            this.ad = false; // hide admin level content
          }
        })
      }
    });
  }

  ngOnInit(): void {
  }

  // method to give a particular user admin privileges
  giveAdmin()
  {
    this.reset(); // reset all member variables

    if (this.addUser != "" && this.val.validateEmail(this.addUser))
    {
      // empty object to send
      let obj = {
        adds: this.addUser
      }

      // request to back end
      this.http.put(`http://localhost:3000/api/admin/users/ad/${this.addUser}`, JSON.stringify(obj), reqHeader).subscribe((data:any) => {
        this.gData = data; // get response
      })
      console.log(`Gave admin privileges to user: ${this.addUser}`);
    }
    else
    {
      this.gError = "Invalid input for user email!";
      console.log("Invalid error!");
    }
  }

  // method for admin to see all existing users, regardless of status
  displayUsersA()
  {
    this.reset(); // reset all member variables

    // request to the back end
    this.http.get(`http://localhost:3000/api/admin/users`).subscribe((data:any) => {
      this.gData = data; // get data obejct from the back end
    })
  }

  // method to show or hide a review
  shReview()
  {
    this.reset(); // reset all member variables

    if (this.subject != "" && this.course != "" && this.userEmail != "" && this.val.validate(this.subject, 8) && this.val.validate(this.course, 5) && this.val.validateEmail(this.userEmail))
    {
      // empty object to send
      let obj = {
        adds: this.addUser
      }

      // request to back end
      this.http.put(`http://localhost:3000/api/admin/comments/${this.subject.toUpperCase()}/${this.course.toUpperCase()}/${this.userEmail}`, JSON.stringify(obj), reqHeader).subscribe((data:any) => {
        this.rData = data; // get response from the back end
      })
      console.log(`Toggled visiblity for review of ${this.subject.toUpperCase()}: ${this.course.toUpperCase()} by ${this.userEmail}`);
    }
    else if (this.subject != "" && this.course != "" && this.val.validate(this.subject, 8) && this.val.validate(this.course, 5))
    {
      this.rError = "Invalid input in the user email field!";
      console.log("Invalid input!");
    }
    else if (this.subject != "" && this.userEmail != "" && this.val.validate(this.subject, 8) && this.val.validateEmail(this.userEmail))
    {
      this.rError = "Invalid input in the course code field!";
      console.log("Invalid input!");
    }
    else if (this.course != "" && this.userEmail != "" && this.val.validate(this.course, 5) && this.val.validateEmail(this.userEmail))
    {
      this.rError = "Invalid input in the subject field!";
      console.log("Invalid input!")
    }
    else if (this.subject != "" && this.val.validate(this.subject, 8))
    {
      this.rError = "Invalid input in the course code and user email fields!";
      console.log("Invalid input!");
    }
    else if (this.course != "" && this.val.validate(this.course, 5))
    {
      this.rError = "Invalid input in the subject and user email fields!";
      console.log("Invalid input!");
    }
    else if (this.userEmail != "" && this.val.validateEmail(this.userEmail))
    {
      this.rError = "Invalid input in the subject and course code fields!";
      console.log("Invalid input!");
    }
    else
    {
      this.rError = "Invalid input in the subject, course code, and user email fields!";
      console.log("Invalid input!");
    }
  }

  // method for admin to see all exisitng reviews, regardless of status
  displayReviews()
  {
    this.reset(); // reset all member variables

    // request to the back end
    this.http.get(`http://localhost:3000/api/admin/comments`).subscribe((data:any) => {
      this.rData = data; // get data obejct from the back end
    })
  }

  // method to activate or deactivate a user
  daUser()
  {
    this.reset(); // reset all member variables

    if (this.deUser != "" && this.val.validateEmail(this.deUser))
    {
      // empty object to send
      let obj = {
        adds: this.deUser
      }

      // request to back end
      this.http.put(`http://localhost:3000/api/admin/users/de/${this.deUser}`, JSON.stringify(obj), reqHeader).subscribe((data:any) => {
        this.dData = data; // get response
      })
      console.log(`Gave admin privileges to user: ${this.deUser}`);
    }
    else
    {
      this.dError = "Invalid input for user email!";
      console.log("Invalid error!");
    }
  }

  // method for admin to see all existing users, regardless of status
  displayUsersB()
  {
    this.reset(); // reset all member variables

    // request to the back end
    this.http.get(`http://localhost:3000/api/admin/users`).subscribe((data:any) => {
      this.dData = data; // get data obejct from the back end
    })
  }

  // method to reset member variables
  reset()
  {
    this.gData = undefined;
    this.rData = undefined;
    this.dData = undefined;
    this.gError = "";
    this.rError = "";
    this.dError = "";
  }
}

// build options for the http requests
const reqHeader = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Access-Control-Allow-Headers": "Content-Type"
  })
}
