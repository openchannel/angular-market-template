import {Component} from '@angular/core';
import {LoaderService} from '@core/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  loading: boolean;

  constructor(public loaderService: LoaderService) {

    this.loaderService.inProcess.subscribe((v) => {
      this.loading = v;
    });

  }

  toggle() {
    this.loading = !this.loading;
  }

}
