import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { CustomerShowComponent } from './customer-show/customer-show.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { CustomerUpdateComponent } from './customer-update/customer-update.component';
import { EvaluationCreateComponent } from './evaluation-create/evaluation-create.component';
import { EvaluationsComponent } from './evaluations/evaluations.component';
import { QuestionsComponent } from './questions/questions.component';

const routes: Routes = [
  {
    path: 'customers',
    component: CustomersComponent,
    data: { title: 'Lista de Clientes' }
  },
  {
    path: 'customer-show/:id',
    component: CustomerShowComponent,
    data: { title: 'Visualiza um Cliente' }
  },
  {
    path: 'customer-create',
    component: CustomerCreateComponent,
    data: { title: 'Cadastra um novo Cliente' }
  },
  {
    path: 'customer-update/:id',
    component: CustomerUpdateComponent,
    data: { title: 'Edita um Cliente' }
  },
  {
    path: 'evaluations/:month/:year',
    component: EvaluationsComponent,
    data: { title: 'Lista as Avaliação' }
  },
  {
    path: 'evaluation-create',
    component: EvaluationCreateComponent,
    data: { title: 'Realiza uma nova Avaliação' }
  },
  {
    path: 'questions',
    component: QuestionsComponent,
    data: { title: 'Tela em que as perguntas de cada cliente é respondida' },
  },
  { path: '',
    redirectTo: '/customers',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
