import { Component, inject } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PassageiroStore } from '../../../core/passageiro.store';
import { cpfValido } from '../../../shared/validators/cpf.validator';
import { formatarCpf, formatarTelefone } from '../../../shared/utils/formatar';

@Component({
  selector: 'app-passageiro-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule,
  ],
  templateUrl: './passageiro-form.component.html',
  styleUrl: './passageiro-form.component.scss',
})
export class PassageiroFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private store = inject(PassageiroStore);

  private idParam = inject(ActivatedRoute).snapshot.paramMap.get('id');
  editando = this.idParam !== null;
  passageiro = this.idParam ? this.store.obter(Number(this.idParam)) : undefined;
  naoEncontrado = this.editando && !this.passageiro;

  // RN07: ao editar, o próprio CPF do passageiro não conta como duplicado
  private cpfUnico: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '');
    return v && this.store.cpfExiste(v, this.passageiro?.id) ? { cpfDuplicado: true } : null;
  };

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, cpfValido, this.cpfUnico]],
    telefone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/)]],
    email: ['', Validators.email],
  });

  constructor() {
    const p = this.passageiro;
    if (p) {
      this.form.patchValue({ nome: p.nome, cpf: p.cpf, telefone: p.telefone, email: p.email ?? '' });
    }
  }

  mascaraCpf(e: Event) {
    const valor = formatarCpf((e.target as HTMLInputElement).value);
    this.form.controls.cpf.setValue(valor, { emitEvent: false });
  }

  mascaraTelefone(e: Event) {
    const valor = formatarTelefone((e.target as HTMLInputElement).value);
    this.form.controls.telefone.setValue(valor, { emitEvent: false });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dados = { nome: v.nome.trim(), cpf: v.cpf, telefone: v.telefone, email: v.email || null };

    if (this.passageiro) {
      this.store.atualizar(this.passageiro.id, dados);
      this.snack.open(`${dados.nome} atualizado`, 'OK', { duration: 3000 });
    } else {
      this.store.criar(dados);
      this.snack.open(`${dados.nome} cadastrado`, 'OK', { duration: 3000 });
    }
    this.router.navigateByUrl('/passageiros');
  }
}
