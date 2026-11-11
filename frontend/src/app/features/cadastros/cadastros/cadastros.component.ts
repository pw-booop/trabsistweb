import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { JogosTabComponent } from '../jogos-tab/jogos-tab.component';
import { TimesTabComponent } from '../times-tab/times-tab.component';
import { EstadiosTabComponent } from '../estadios-tab/estadios-tab.component';

@Component({
  selector: 'app-cadastros',
  imports: [MatTabsModule, JogosTabComponent, TimesTabComponent, EstadiosTabComponent],
  template: `
    <h1>Cadastros</h1>
    <mat-tab-group animationDuration="0ms">
      <mat-tab label="Jogos"><div class="aba"><app-jogos-tab /></div></mat-tab>
      <mat-tab label="Times"><div class="aba"><app-times-tab /></div></mat-tab>
      <mat-tab label="Estádios"><div class="aba"><app-estadios-tab /></div></mat-tab>
    </mat-tab-group>
  `,
  styles: `.aba { padding-top: var(--space-3); }`,
})
export class CadastrosComponent {}
