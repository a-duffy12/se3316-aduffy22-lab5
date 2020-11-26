import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements OnInit {

  // fields to track whether a user is logged in or not
  subscription: Subscription;
  activeUser: string = "";
  ad: boolean = false;
  uData: any; // list of all users

  // member variables to track what to show
  pol: boolean = false;
  dmca: boolean = false;
  proc: boolean = false;
  dData: any;
  error: string = "";

  // member variables for making DMCA records
  userEmail: string = "";
  rType: string = "";
  song: string  = "";
  artist: string  = "";
  rTypes: string[] = ["request", "notice", "dispute"];


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

    // request to the back end
    this.http.get(`http://localhost:3000/api/admin/users`).subscribe((data:any) => {
      this.uData = data; // get data obejct from the back end
    })
  }

  ngOnInit(): void {
  }

  // method to show and hide privace policy
  showPolicy()
  {
    if (this.pol)
    {
      this.pol = false;
    }
    else if (!this.pol)
    {
      this.pol = true;
    }
  }

  // method to show and hide DMCA notices
  showDMCA()
  {
    if (this.dmca)
    {
      this.dmca = false;
    }
    else if (!this.dmca)
    {
      this.dmca = true;
    }
  }

  // method to show and hide DMCA takedown procedure steps
  showProc()
  {
    if (this.proc)
    {
      this.proc = false;
    }
    else if (!this.proc)
    {
      this.proc = true;
    }
  }

  // method to create a DMCA record
  createRecord()
  {
    this.reset(); // reset all member variables

    if(this.userEmail != "" && this.rType != "" && this.song != "" && this.artist != "" && this.val.validateEmail(this.userEmail) && this.val.validate(this.rType, 7) && this.val.validate(this.song, 100) && this.val.validate(this.artist, 100))
    {
      let indA = -1;

      for (let i = 0; i < this.uData.length; i++) // find index of the user's email in the list of users
      {
        if (this.uData[i].email == this.userEmail)
        {
          indA = i; // set this to the index of this user
        }
      }

      let indB = this.rTypes.indexOf(this.rType); // find index of the record type

      console.log(this.uData);

      if (indA >= 0 && indB >= 0) // if the given email matches a user account and the type is valid
      {
        let obj = { // request body to send to back end
          type: this.rType,
          date: (new Date()).toISOString(),
          song: this.song,
          artist: this.artist
        }

        // request to back end
        this.http.post(`http://localhost:3000/api/admin/dmca/${this.userEmail}`, JSON.stringify(obj), reqHeader).subscribe((data:any) => {
          this.dData = data; // get back end data object
        })
        console.log(`Created DMCA ${this.rType} record for ${this.userEmail} in regards to ${this.song} by ${this.artist}`);
      }
      else if (indA < 0 && indB >= 0) // if the given email does not match a user account but the type is valid
      {
        this.error = `No user found with email: ${this.userEmail}!`;
        console.log("Invalid input!");
      }
      else if (indA >= 0 && indB < 0) // if the given email matches a user account but the type is not valid
      {
        this.error = `Invalid input for type: ${this.rType}!`;
        console.log("Invalid input!");
      }
      else if (indA < 0 && indB < 0) // if the given email does not match a user account and the type is not valid
      {
        this.error = `No user found with email: ${this.userEmail} and invalid input for type: ${this.rType}!`;
        console.log("Invalid input!");
      }
    }
    else
    {
      this.error = "Invalid input!";
      console.log("Invalid input!");
    }
  }

  // method to show all existing records
  displayRecords()
  {
    this.reset(); // reset all member variables

    // request to the back end
    this.http.get(`http://localhost:3000/api/admin/dmca`).subscribe((data:any) => {
      this.dData = data; // get data obejct from the back end
    })
  }

  // method to reset member variables
  reset()
  {
    this.dData = undefined;
    this.error = "";
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
