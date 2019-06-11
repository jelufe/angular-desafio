import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { Evaluation } from 'src/model/evaluation';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  public date;
  public customers;
  public pos;
  public andamento;
  isLoadingResults = false;
  evaluation = [];
  evaluationForm: FormGroup;

  constructor(private router: Router, private api: ApiService, private route: ActivatedRoute, private formBuilder: FormBuilder) {
    this.pos = 0;
    this.andamento = 0;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.date = JSON.parse(params.date);
      this.customers = JSON.parse(params.customers);
    });

    this.evaluationForm = this.formBuilder.group({
      nota : [null, [Validators.min(0), Validators.max(10), Validators.required]],
      pergunta : [null, Validators.required]
    });
  }

  addEvaluation(form: NgForm) {
    if (this.pos >= (this.customers.length - 1)) {

      this.addInArray();

      this.isLoadingResults = true;

      this.evaluation.forEach( (myObject, index) => {

        let categoriaNota = 'Nenhum';

        if (myObject.nota > 8) {
          categoriaNota = 'Promotor';
        } else if (myObject.nota >= 7 && myObject.nota <= 8) {
          categoriaNota = 'Neutro';
        } else if (myObject.nota >= 0 && myObject.nota < 7) {
          categoriaNota = 'Detrator';
        }

        this.api.updateCustomer(myObject.customerId,
          {
            name : this.customers[index].name,
            contactName: this.customers[index].contactName,
            date: this.customers[index].date,
            categoria : categoriaNota
          }
        )
        .subscribe(res => {
            console.log(res);
          }, (err) => {
            console.log(err);
          }
        );

        this.api.addEvaluation(myObject)
        .subscribe(res => {
            const id = res.id;
            this.isLoadingResults = false;
            const str = this.date.split('/');
            this.router.navigate(['/evaluations', str[0], str[1]]);
        }, (err) => {
            console.log(err);
            this.isLoadingResults = false;
        });
      });

      console.log('finalizado');
      console.log(this.evaluation);
    } else {
      this.addInArray();
      this.evaluationForm.reset();
      this.pos++;
    }

  }

  addInArray() {
    const saveEvaluation = new Evaluation();
    saveEvaluation.ref = this.date;
    saveEvaluation.customerId = this.customers[this.pos].id;
    saveEvaluation.customerName = this.customers[this.pos].name;
    saveEvaluation.nota = this.evaluationForm.get('nota').value;
    saveEvaluation.pergunta = this.evaluationForm.get('pergunta').value;
    this.evaluation.push(saveEvaluation);
    this.andamento = ((this.pos + 1) / this.customers.length) * 100;
  }

}
