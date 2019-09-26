import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private service : UserService){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if(localStorage.getItem('token') != null){
        let role = next.data['permittedRoles'] as Array<string>;
        if(role){
          if(this.service.roleMacth(role)){
            return true;
          }
          else{
            this.router.navigate(['/forbidden']);
            return false;
          }
        }
        return true;
      }
      else{
        this.router.navigate(['/user/login']);
        return false;
      }
  } 
}
