import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'auth-button',
  template: `
    <ng-container *ngIf="auth.isAuthenticated$ | async; else loggedOut">
      <button (click)="auth.logout({ returnTo: document.location.origin })">Logout</button>
    </ng-container>

    <ng-template #loggedOut>
      <button (click)="auth.loginWithRedirect()">Login</button>
    </ng-template>
  `,

  styleUrls: ['./auth-button.component.css']
})

export class AuthButtonComponent {
  constructor (@Inject(DOCUMENT) public document: Document, public auth: AuthService) {}
}
