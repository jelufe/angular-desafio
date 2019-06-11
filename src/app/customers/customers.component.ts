import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Customer } from 'src/model/customer';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  displayedColumns: string[] = [ 'name', 'contactName', 'date', 'categoria', 'acao'];
  dataSource;
  hasClientes = true;
  isLoadingResults = true;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getCustomers()
    .subscribe(res => {
      if (res != null) {
        const mapped = Object.keys(res).map(key => ({id: key, name: res[key].name,
           contactName: res[key].contactName, date: res[key].date,
           categoria: res[key].categoria === undefined ? 'Nenhum' : res[key].categoria }));
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
  }

}
