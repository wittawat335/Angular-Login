import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private formBuild:FormBuilder, private http: HttpClient) { }
  readonly BaseURI = 'https://localhost:44392/api';

  formModel = this.formBuild.group({
    UserName : ['', Validators.required],
    Email : ['', Validators.email],
    FullName : [''],
    Passwords : this.formBuild.group({
      Password : ['',[Validators.required, Validators.minLength(4)]],
      ConfirmPassword : ['',[Validators.required]]
    }, {validators: this.comparePassword})  
  });

  comparePassword(formBuild: FormGroup){
    let confirmPassword = formBuild.get('ConfirmPassword');
    //Password ไม่ตรง
    //confirmPassword.errors={passwordMismatch:true}
    if (confirmPassword.errors == null || 'passwordMismatch' in confirmPassword.errors) {
      if (formBuild.get('Password').value != confirmPassword.value)
      confirmPassword.setErrors({ passwordMismatch: true });
      else
        confirmPassword.setErrors(null);
    }
  }
  register() {
    var body = {
      UserName: this.formModel.value.UserName,
      Email: this.formModel.value.Email,
      FullName: this.formModel.value.FullName,
      Password: this.formModel.value.Passwords.Password
    };
    return this.http.post(this.BaseURI + '/User/Register', body);
  }

  login(formData) {
    return this.http.post(this.BaseURI + '/User/Login', formData);
  }

  getUserProfile() {
    return this.http.get(this.BaseURI + '/UserProfile');
  }

  roleMacth(allowedRoles): boolean{
    var isMatch = false;
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    var userRole = payLoad.role;
    allowedRoles.forEach(element => {
      if(userRole == element){
        isMatch = true;
        return false;
      }
    });
    
    return isMatch;
  }
}
