# SIM. — Guia de publicação com login e banco de dados

Tempo total: ~15 minutos. Tudo no plano gratuito.

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com → **Start your project** → entre com GitHub ou e-mail
2. **New project** → nome `sim-noivas` → defina uma senha do banco (guarde) → região `South America (São Paulo)` → Create
3. Aguarde ~2 minutos até o projeto ficar pronto

## 2. Criar as tabelas

1. No menu lateral: **SQL Editor** → **New query**
2. Cole o conteúdo inteiro do arquivo `supabase-setup.sql` → **Run**
3. Deve aparecer "Success. No rows returned"

## 3. Ajustar o login por e-mail

1. Menu **Authentication → Providers → Email**
2. Para testar mais rápido, desative **"Confirm email"** (as testadoras entram direto, sem confirmar e-mail). Reative depois, em produção.

## 4. Conectar o app ao seu projeto

1. Menu **Settings → API**: copie a **Project URL** e a **anon public key**
2. Abra o `app-cloud.html` e, no topo do script, substitua:

```js
const SUPABASE_URL='COLE_AQUI_SUA_URL';
const SUPABASE_ANON_KEY='COLE_AQUI_SUA_ANON_KEY';
```

> A anon key é pública por design — a segurança vem das políticas de
> acesso por linha (RLS) criadas no passo 2. Cada usuária só lê e
> escreve os próprios dados.

3. Renomeie `app-cloud.html` para `index.html` (substituindo o antigo)

## 5. Publicar

**GitHub Pages:** suba os arquivos no repositório → Settings → Pages →
Branch `main` → Save → URL pública em ~1 minuto.

**Vercel (alternativa):** vercel.com → Add New Project → importe o
repositório → Deploy.

## 6. Testar

1. Abra a URL pública → tela de login do SIM.
2. **Criar minha conta** → e-mail e senha → cai no cadastro do casamento
3. Cadastre dados, feche o navegador, abra no celular e entre com a
   mesma conta: tudo lá. ✨

## O que ainda NÃO funciona nesta versão

- **Leitura por IA** (colar proposta / ler contrato): precisa de um
  backend simples que guarde a sua chave da API da Anthropic
  (uma Edge Function do próprio Supabase resolve — próximo passo do
  roadmap; nunca coloque a chave da API no HTML).

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| "Configuração pendente" no login | URL/anon key não coladas no passo 4 |
| "E-mail ou senha incorretos" ao criar conta | Conta já existe — use Entrar |
| Criou conta e não entra | "Confirm email" ligado — confirme no e-mail ou desative (passo 3) |
| Dados não aparecem em outro aparelho | Entrou com outro e-mail |
