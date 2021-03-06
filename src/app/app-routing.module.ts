import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NPuzzleComponent } from './n-puzzle/n-puzzle.component';

const routes: Routes = [{
  path: '',
  component: NPuzzleComponent,
  pathMatch: 'full'
},{
  path: '**',
  redirectTo: ''
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
