import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styles: []
})
export class RegistrationComponent implements OnInit {

  constructor(public service: UserService, private toastr: ToastrService) { }

  ngOnInit() {
    this.service.formModel.reset();
  }
  onSubmit(){
    this.service.register().subscribe(
    (res:any) => {
      if(res.Succeeded){
        this.service.formModel.reset();
        this.toastr.success('New user created!', 'Registration successful.');
      }else{
        res.Errors.forEach(element => {
          switch (element.code) {
            case 'DuplicateUserName':
              //UserName is already token
              this.toastr.error('Username is already taken','Registration failed.');
              break;          
            default:
              //Resgister Failed.
              this.toastr.error(element.description,'Registration failed.');
              break;
          }
        });
      }
    },
      err => {
        console.log(err);
      }
    );
  }
}
