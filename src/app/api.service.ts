import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Customer } from 'src/model/customer';
import { Evaluation } from 'src/model/evaluation';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json', Authorization : 'desafio-forlogic-34896'})
};
const apiUrl = 'http://desafio4devs.forlogic.net/api/customers';
const apiEvaluationUrl = 'http://desafio4devs.forlogic.net/api/evaluations';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(apiUrl, httpOptions)
      .pipe(
        tap(customers => console.log('leu os clientes')),
        catchError(this.handleError('getCustomers', []))
      );
  }

  getEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(apiEvaluationUrl, httpOptions)
      .pipe(
        tap(evaluations => console.log('leu as Avaliações')),
        catchError(this.handleError('getEvaluations', []))
      );
  }

  getCustomer(id: number): Observable<Customer> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<Customer>(url, httpOptions).pipe(
      tap(_ => console.log(`leu o cliente id=${id}`)),
      catchError(this.handleError<Customer>(`getCustomer id=${id}`))
    );
  }

  addCustomer(customer): Observable<Customer> {
    return this.http.post<Customer>(apiUrl, customer, httpOptions).pipe(
      // tslint:disable-next-line:no-shadowed-variable
      tap((customer: Customer) => console.log(`adicionou o cliente com id=${customer.id}`)),
      catchError(this.handleError<Customer>('addCustomer'))
    );
  }

  addEvaluation(evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(apiEvaluationUrl, evaluation, httpOptions).pipe(
      // tslint:disable-next-line:no-shadowed-variable
      tap((evaluation: Evaluation) => console.log(`adicionou o cliente com id=${evaluation.id}`)),
      catchError(this.handleError<Evaluation>('addEvaluation'))
    );
  }

  updateCustomer(id, customer): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, customer, httpOptions).pipe(
      tap(_ => console.log(`atualiza o cliente com id=${id}`)),
      catchError(this.handleError<any>('updateCustomer'))
    );
  }

  deleteCustomer(id): Observable<Customer> {
    const url = `${apiUrl}/${id}`;

    return this.http.delete<Customer>(url, httpOptions).pipe(
      tap(_ => console.log(`remove o cliente com id=${id}`)),
      catchError(this.handleError<Customer>('deleteCustomer'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);

      return of(result as T);
    };
  }

}
