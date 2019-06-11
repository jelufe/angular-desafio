import { Component, OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import { ApiService } from '../api.service';
import { Customer } from 'src/model/customer';
import { Router, NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup, NgForm, Validators, FormControl } from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';

import * as _moment from 'moment';
const moment = _moment;
moment.locale('pt-BR');

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@Component({
  selector: 'app-evaluation-create',
  templateUrl: './evaluation-create.component.html',
  styleUrls: ['./evaluation-create.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class EvaluationCreateComponent implements OnInit {

  date = new FormControl(moment(), Validators.required);
  avaluationForm: FormGroup;
  selection = new SelectionModel<Customer>(true, []);

  displayedColumns: string[] = ['select', 'name'];
  dataSource;
  dataSourceEvaluations;
  hasClientes = true;
  hasEvaluations = true;
  isLoadingResults = true;
  isLoadingResults2 = true;
  erroDate = false;
  erroPorcentagem = false;

  constructor(private router: Router, private api: ApiService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.avaluationForm = this.formBuilder.group({
      date : this.date
    });
    this.api.getCustomers()
    .subscribe(res => {
      if (res != null) {
        const mapped = Object.keys(res).map(key => ({id: key, name: res[key].name,
           contactName: res[key].contactName, date: res[key].date}));
        this.dataSource = mapped;
        console.log(this.dataSource);
      } else {
        this.hasClientes = false;
      }

      this.isLoadingResults = false;
    }, err => {
      console.log(err);
      this.isLoadingResults = false;
    });


    this.api.getEvaluations()
    .subscribe(res => {
      if (res != null) {
        const mapped = Object.keys(res).map(key => ({id: key, customerName: res[key].customerName,
          nota: res[key].nota, pergunta: res[key].pergunta, ref: res[key].ref, customerId: res[key].customerId}));
        this.dataSourceEvaluations = mapped;

        if (this.dataSourceEvaluations.length < 1) {
          this.hasEvaluations = false;
        } else {
          this.hasEvaluations = true;
        }
      } else {
        this.hasEvaluations = false;
      }

      this.isLoadingResults2 = false;
    }, err => {
      console.log(err);
      this.isLoadingResults2 = false;
    });


  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    let numRows = 0;
    if (this.dataSource !== undefined) {
      numRows = (this.dataSource.length * 20) / 100;
    }
    return numSelected >= numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    let keepGoing = true;
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.forEach(row => {
          if (keepGoing) {
            if (this.checkAvailability(row.id)) {
              this.selection.select(row);
            }
            if ((this.selection.selected.length / this.dataSource.length) * 100 >= 20) {
              keepGoing = false;
            }
          }
        });
  }

  checkAvailability(id) {
    let result = true;

    if (this.avaluationForm.get('date').value != null && this.dataSourceEvaluations !== undefined) {
      const dateInMoment = this.avaluationForm.get('date').value.format('MM/YYYY');

      const customerEvaluations = this.dataSourceEvaluations.filter(evaluation => evaluation.customerId === id);

      if (customerEvaluations.length < 1) {
        result = true;
      } else {
        const arrayDates = [];
        customerEvaluations.forEach( (avaliacao, index) => {
          arrayDates.push(moment(avaliacao.ref, 'MM/YYYY').format('MM/YYYY'));
          arrayDates.push(moment(avaliacao.ref, 'MM/YYYY').add(1, 'months').format('MM/YYYY'));
          arrayDates.push(moment(avaliacao.ref, 'MM/YYYY').add(2, 'months').format('MM/YYYY'));
        });

        if (arrayDates.indexOf(dateInMoment) !== -1) {
          result = false;
        }
      }
    }

    return result;

  }

  addAvaluation(form: NgForm) {
    this.isLoadingResults = true;

    this.api.getEvaluations()
    .subscribe(res => {
      if (res != null) {
          const arrayMapped = Object.keys(res).map(key => ({id: key, customerName: res[key].customerName,
          nota: res[key].nota, pergunta: res[key].pergunta, ref: res[key].ref}));
          const arrayFilter = arrayMapped.filter(evaluation => evaluation.ref === this.avaluationForm.get('date').value.format('MM/YYYY'));

          if (arrayFilter.length < 1) {
            this.erroDate = false;
            if ((this.selection.selected.length / this.dataSource.length) * 100 !== 20) {
              this.erroPorcentagem = true;
              this.isLoadingResults = false;
            } else {
              this.erroPorcentagem = false;
              this.callQuestions();
            }
          } else {
            this.isLoadingResults = false;
            this.erroDate = true;
          }
      } else {
        this.erroDate = false;
        if ((this.selection.selected.length / this.dataSource.length) * 100 !== 20) {
          this.erroPorcentagem = true;
          this.isLoadingResults = false;
        } else {
          this.erroPorcentagem = false;
          this.callQuestions();
        }
      }
    }, err => {
      console.log(err);
      this.isLoadingResults = false;
    });

  }

  callQuestions() {
    const navigationExtras: NavigationExtras = {
        queryParams: {
            date: JSON.stringify(this.avaluationForm.get('date').value.format('MM/YYYY')),
            customers: JSON.stringify(this.selection.selected)
        }
    };
    this.router.navigate(['/questions'], navigationExtras);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Customer): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  chosenYearHandler(normalizedYear: _moment.Moment) {
    this.selection.clear();
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  reset() {
    this.selection.clear();
  }

  chosenMonthHandler(normalizedMonth: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    this.selection.clear();
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

}
