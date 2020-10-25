import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { UserHeaderComponent } from './user-header/user-header.component';


// Services
import { WINDOW_PROVIDERS } from './services/windows.service';
import { LandingFixService } from '../shared/services/landing-fix.service';
import { LoaderComponent } from './loader/loader.component';
import { ListShopHeaderComponent } from './list-shop-header/list-shop-header.component';
import {AuthenticationService} from "./services/authentication.service";
import { AlertComponent } from './alert/alert.component';
import {AlertService} from "./services/alert.service";
import {ListService} from "./services/list.service";
import {DishService} from "./services/dish.service";
import {DishSelectComponent} from "./dish-select/dish-select.component";
import {AutoCompleteModule} from "primeng/autocomplete";
import {FormsModule} from "@angular/forms";

@NgModule({
  exports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    UserHeaderComponent,
    ListShopHeaderComponent,
    DishSelectComponent

  ],
    imports: [
        CommonModule,
        RouterModule,
        NgxPageScrollModule,
        NgbModule,
        AutoCompleteModule,
        FormsModule
    ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
      UserHeaderComponent,
      ListShopHeaderComponent,
      DishSelectComponent
  ],
  providers: [
    WINDOW_PROVIDERS,
    LandingFixService,
      AuthenticationService,
      ListService,
      DishService
  ]
})
export class SharedModule { }
