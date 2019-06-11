import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Evaluation } from 'src/model/evaluation';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class EvaluationsComponent implements OnInit {

  avaluationForm: FormGroup;
  displayedColumns: string[] = [ 'customerName', 'nota', 'pergunta'];
  dataSource;
  allData;
  hasEvaluations = true;
  isLoadingResults = true;
  nps = 0;
  promotores = 0;
  detratores = 0;
  color = 'white';

  month = this.route.snapshot.params.month;
  year = this.route.snapshot.params.year;
  date = this.month + '/' + this.year;
  dateMoment = new FormControl(moment(this.date, 'MM/YYYY'), Validators.required);

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.avaluationForm = this.formBuilder.group({
      dateMoment : this.dateMoment
    });
    console.log(this.date);
    this.api.getEvaluations()
    .subscribe(res => {
      if (res != null) {
        const mapped = Object.keys(res).map(key => ({id: key, customerName: res[key].customerName,
          nota: res[key].nota, pergunta: res[key].pergunta, ref: res[key].ref}));
        this.allData = mapped;
        this.dataSource = mapped.filter(evaluation => evaluation.ref === this.date);

        this.calculateNPS(this.dataSource);

        if (this.dataSource.length < 1) {
          this.hasEvaluations = false;
        } else {
          this.hasEvaluations = true;
        }
      } else {
        this.hasEvaluations = false;
      }

      this.isLoadingResults = false;
    }, err => {
      console.log(err);
      this.isLoadingResults = false;
    });
  }

  addAvaluation(form: NgForm) {
    if (this.dataSource !== undefined) {
      const month = this.avaluationForm.get('dateMoment').value.format('MM');
      const year = this.avaluationForm.get('dateMoment').value.format('YYYY');
      this.router.navigate(['/evaluations', month, year]);
      this.date = this.avaluationForm.get('dateMoment').value.format('MM/YYYY');
      this.dataSource = this.allData.filter(evaluation => evaluation.ref === this.date);
      this.calculateNPS(this.dataSource);
      if (this.dataSource.length < 1) {
        this.hasEvaluations = false;
      } else {
        this.hasEvaluations = true;
      }
    }
  }

  calculateNPS(avaliacoes) {
    this.promotores = 0;
    this.detratores = 0;
    const total = avaliacoes.length;
    avaliacoes.forEach( (avaliacao, index) => {
      if (avaliacao.nota >= 9) {
        this.promotores += 1;
      } else if (avaliacao.nota >= 0 && avaliacao.nota <= 6) {
        this.detratores += 1;
      }
    });

    this.nps = ((this.promotores - this.detratores) / total) * 100;
    if (this.nps >= 80) {
      this.color = 'green';
    } else if (this.nps >= 60 && this.nps < 80) {
      this.color = 'yellow';
    } else if (this.nps < 60) {
      this.color = 'red';
    }
  }

  chosenYearHandler(normalizedYear: _moment.Moment) {
    const ctrlValue = this.dateMoment.value;
    ctrlValue.year(normalizedYear.year());
    this.dateMoment.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    const ctrlValue = this.dateMoment.value;
    ctrlValue.month(normalizedMonth.month());
    this.dateMoment.setValue(ctrlValue);
    datepicker.close();
  }


}
