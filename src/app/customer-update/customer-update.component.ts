import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';

import * as _moment from 'moment';
const moment = _moment;
moment.locale('pt-BR');

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DD MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD MMMM YYYY'
  },
};

@Component({
  selector: 'app-customer-update',
  templateUrl: './customer-update.component.html',
  styleUrls: ['./customer-update.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class CustomerUpdateComponent implements OnInit {

  // tslint:disable-next-line:ban-types
  id: String = '';
  customerForm: FormGroup;
  // tslint:disable-next-line:ban-types
  name: String = '';
  // tslint:disable-next-line:ban-types
  contactName: String = '';
  // tslint:disable-next-line:ban-types
  isLoadingResults = true;

  date = new FormControl(moment(), Validators.required);

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private formBuilder: FormBuilder) { }

  ngOnInit() {
      this.getCustomer(this.route.snapshot.params.id);
      this.customerForm = this.formBuilder.group({
      name : [null, Validators.required],
      contactName : [null, Validators.required],
      date : this.date
    });
  }

  getCustomer(id) {
    this.api.getCustomer(id).subscribe(data => {
      this.id = data.id;
      this.customerForm.setValue({
        name: data.name,
        contactName: data.contactName,
        date: moment(data.date, 'DD/MM/YYYY')
      });
      this.isLoadingResults = false;
    });
  }

  updateCustomer(form: NgForm) {
    this.isLoadingResults = true;
    form.date = form.date.format('DD/MM/YYYY');
    this.api.updateCustomer(this.route.snapshot.params.id, form)
      .subscribe(res => {
          this.isLoadingResults = false;
          this.router.navigate(['/customer-show/' + this.route.snapshot.params.id]);
        }, (err) => {
          console.log(err);
          this.isLoadingResults = false;
        }
      );
  }

}
