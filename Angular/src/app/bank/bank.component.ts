import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { BankService } from '../shared/services/bank.service';
import { BankAccountService } from '../shared/services/bank-account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit {
  bankAccountForms: FormArray = this.fb.array([]);
  bankList = [];
  notification = null;;

  constructor(
    private fb: FormBuilder,
    private bankService: BankService,
    private service: BankAccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.bankService
      .getBankList()
      .subscribe(res => (this.bankList = res as []));
    this.service.getBankAccountList().subscribe(res => {
      // tslint:disable-next-line:triple-equals
      if (res == []) {
        this.addBankAccountForm();
      } else {
        // generate formarray as per the data received from BankAccont table
        (res as []).forEach((bankAccount: any) => {
          this.bankAccountForms.push(
            this.fb.group({
              BankAccountID: [bankAccount.BankAccountID],
              AccountNumber: [bankAccount.AccountNumber, Validators.required],
              AccountHolder: [bankAccount.AccountHolder, Validators.required],
              BankID: [bankAccount.BankID, Validators.min(1)],
              IFSC: [bankAccount.IFSC, Validators.required]
            })
          );
        });
      }
    });
  }

  onLogout(){
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

  accountSave(fg: FormGroup) {
    if (fg.value.BankAccountID === 0) {
      this.service.postBankAccount(fg.value).subscribe((res: any) => {
        fg.patchValue({ BankAccountID: res.BankAccountID });
        this.showNotification('insert');
      });
    } else {
      this.service.putBankAccount(fg.value).subscribe((res: any) => {
        this.showNotification('update');
      });
    }
  }

  addBankAccountForm() {
    this.bankAccountForms.push(
      this.fb.group({
        BankAccountID: [0],
        AccountNumber: ['', Validators.required],
        AccountHolder: ['', Validators.required],
        BankID: [0, Validators.min(1)],
        IFSC: ['', Validators.required]
      })
    );
  }

  Delete(BankAccountID, i) {
    if (BankAccountID === 0) {
      this.bankAccountForms.removeAt(i);
    } else if (confirm('Are you sure to delete this record ?')){
      this.service.deleteBankAccount(BankAccountID).subscribe(
        res => {
          this.bankAccountForms.removeAt(i);
          this.showNotification('delete');
        });
      }
  }

  showNotification(category) {
    switch (category) {
      case 'insert':
        this.notification = { class: 'text-success', message: 'saved!' };
        break;
      case 'update':
        this.notification = { class: 'text-primary', message: 'updated!' };
        break;
      case 'delete':
        this.notification = { class: 'text-danger', message: 'deleted!' };
        break;

      default:
        break;
    }
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }
}
