import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { Customer } from 'src/model/customer';

@Component({
  selector: 'app-customer-show',
  templateUrl: './customer-show.component.html',
  styleUrls: ['./customer-show.component.css']
})
export class CustomerShowComponent implements OnInit {

  id = this.route.snapshot.params.id;
  customer: Customer = { id: this.id, name: '', contactName: '', date: '', categoria: '' };
  isLoadingResults = true;
  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService) { }


  ngOnInit() {
    this.getCustomer(this.id);
  }

  getCustomer(id) {
    this.api.getCustomer(id)
      .subscribe(data => {
        this.customer = data;
        if (this.customer.categoria === undefined) {
          this.customer.categoria = 'Nenhum';
        }
        this.isLoadingResults = false;
      });
  }

  deleteCustomer(id) {
    console.log(id);
    this.isLoadingResults = true;
    this.api.deleteCustomer(id)
      .subscribe(res => {
          this.isLoadingResults = false;
          this.router.navigate(['/customers']);
        }, (err) => {
          console.log(err);
          this.isLoadingResults = false;
        }
      );
  }

}
