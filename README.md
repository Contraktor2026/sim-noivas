# SIM. — Seu casamento organizado na palma da mão

App de organização de casamento para noivas do Brasil e da América Latina.
**Você disse sim. O resto, a gente organiza juntas.**

## O que o app faz

- **Hoje** — contagem regressiva com monograma do casal, pagamentos chegando, decisões em aberto e guia de primeiros passos
- **Dinheiro** — orçamento total, comprometido vs. disponível, despesas agrupadas por mês com subtotais, atrasados em destaque
- **Fornecedores** — orçamentos por categoria com leitura automática por IA (cole a mensagem do WhatsApp ou anexe foto/PDF e os campos se preenchem), avaliação por estrelas, comparação além do preço (diferencial + o que inclui)
- **Contratos** — página própria por fornecedor contratado: contatos, anexo do contrato com leitura automática (valor, condições e parcelas com datas lançadas direto no Dinheiro), plano de pagamento e anotações
- **Lista** — roteiro de tarefas que se adapta ao tempo que falta até o casamento (de 12+ meses à reta final)
- **Anotações** — bloco rápido acessível de qualquer tela
- Dados persistentes, moeda com máscara automática (padrão brasileiro), guia de boas-vindas em 5 passos

## Versões

- `index.html` — **app oficial**: login + banco de dados na nuvem (Supabase)
- `app-local.html` — versão local (dados só no aparelho), útil para demonstrações

## Como rodar

É um único arquivo: abra `index.html` no navegador.

> **Nota:** os recursos de leitura por IA usam a API da Anthropic através do ambiente de artifacts do Claude.ai.
> Fora dele, é necessário um backend simples com chave própria da API (ver roadmap).

## Publicar com GitHub Pages

Settings → Pages → Branch `main` → pasta `/` (root) → Save.
Em ~1 minuto o app fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Roadmap

- [ ] Backend para a leitura por IA (proxy da API Anthropic)
- [ ] Autocomplete de cidades via API do IBGE
- [ ] Módulo de convidados e RSVP
- [ ] Exportar relatório financeiro (PDF)
- [ ] "Me ajude a decidir": comparação de orçamentos assistida por IA

## Stack

HTML + CSS + JavaScript puro, arquivo único, sem dependências.
Tipografia: Marcellus + Karla (Google Fonts). Identidade: verde-garrafa, dourado champanhe, estética de papelaria de convite.

---

Feito com ♥ por Yolanda — Fontez Fotografia.
