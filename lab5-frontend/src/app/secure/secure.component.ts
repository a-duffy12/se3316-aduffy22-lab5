import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'secure',
  templateUrl: './secure.component.html',
  styleUrls: ['./secure.component.css']
})
export class SecureComponent implements OnInit {

  // fields to track whether a user is logged in or not
  subscription: Subscription;
  activeUser: string = "";

  constructor(private http: HttpClient, private val: Validator)
  {
    // every second, update the active user variable
    this.subscription = interval(1000).subscribe(() => {
      this.activeUser = this.val.getActiveUser();
    });
  }

  ngOnInit(): void {
  }


}
