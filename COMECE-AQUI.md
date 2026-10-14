# COMECE AQUI — versão em inglês para o mercado americano

**Produto:** Tech Toolkit 64GB 2026 · **Preço:** US$ 7 (pagamento único) · **Pasta do site:** `/site`

---

## 🔴 1. URGENTE — faça isso primeiro (segurança)

Seu repositório atual tem um arquivo **`.env` público** com a chave da OpenAI:

```
https://raw.githubusercontent.com/uanderson-ux/kittecnico/main/.env   →  HTTP 200 (qualquer pessoa lê)
```

A chave começa com `sk-` e tem 164 caracteres. Enquanto ela estiver válida, qualquer pessoa pode usar seu crédito de API.

**O que fazer, nesta ordem:**

1. Entre em `platform.openai.com` → *API keys* → **revogue a chave antiga** e crie uma nova (que você guarda só no seu computador).
2. Remova o arquivo do repositório:

```bash
git clone https://github.com/uanderson-ux/kittecnico.git
cd kittecnico
git rm --cached .env
rm -f .env                     # apaga do seu computador também
git commit -m "Remove exposed environment file"
git push
```

3. Atenção: o `.env` continua no **histórico** do GitHub. Como revogar a chave resolve o risco real, isso já basta. Se quiser limpar o histórico também, use `git filter-repo` (ou apague o repositório e suba de novo — veja a seção 4).

O site novo já vem com `.gitignore` configurado para nunca mais deixar isso acontecer.

---

## ✅ 2. O que já está pronto nesta pasta

| Item | Status |
|---|---|
| Página de vendas traduzida e **adaptada para o público americano** (novo headline, seção de dores, comparativo "manual vs. ferramenta", oferta, FAQ) | pronto |
| Preço **US$ 7** em todos os botões, na tabela e no chat | pronto |
| Chat "Ana" traduzido + **base de conhecimento com 117 intenções em inglês** | pronto |
| Imagem de caixa 3D nova, com texto em inglês (`assets/techtoolkit-box.png`) | pronto |
| SEO: title, meta description, Open Graph, dados estruturados (JSON-LD), `robots.txt`, `sitemap.xml` | pronto |
| Imagens e vídeo agora são **locais** (não dependem mais do Blogger) | pronto |
| Arquivo de verificação do Google mantido (`googled4fa5620d5eeb571.html`) | pronto |

Nada no site precisa de servidor, banco de dados ou API paga — funciona no GitHub Pages como o anterior.

---

## ⚙️ 3. Antes de anunciar: 3 ajustes (leva 2 minutos)

Abra o arquivo **`config.js`**. Ele é o cérebro do site: tudo (botões de compra, preço, e-mail de suporte e as respostas do chat) lê daqui.

```js
checkoutUrl: 'PASTE-YOUR-CHECKOUT-LINK-HERE',   // 1) OBRIGATÓRIO: link de checkout em USD
supportEmail: 'support@yourdomain.com',         // 2) seu e-mail de suporte real
guaranteeDays: null,                            // 3) null = sem garantia exibida | 7 ou 30 = mostra "7-day money-back"
```

**Sobre o checkout:** o link atual do Kiwify cobra em **reais** e não serve para vender a US$ 7 para americanos. Crie um checkout em dólar em uma destas plataformas e cole o link em `checkoutUrl`:

- **Stripe Payment Link** (mais profissional, cartão + Apple/Google Pay, resolve imposto nos EUA)
- **Gumroad / Lemon Squeezy / Payhip** (mais simples, entrega digital automática + Merchant of Record, eles cuidam de sales tax/VAT)
- **PayPal** (se quiser aceitar quem não usa cartão)

Enquanto o link não for configurado, os botões levam suavemente para a seção de oferta (nada quebra, mas ninguém compra).

---

## 🚀 4. Como publicar no GitHub Pages

### Opção A — substituir o site atual (mesma URL `uanderson-ux.github.io/kittecnico/`)

```bash
git clone https://github.com/uanderson-ux/kittecnico.git
cd kittecnico

# limpa tudo (inclusive o .env perigoso)
git rm -r --cached . && rm -rf * .gitignore .env

# copia os arquivos novos (ajuste o caminho da pasta onde você baixou o site)
cp -r /caminho/do/site/* .
cp /caminho/do/site/.gitignore .

git add .
git commit -m "Rebuild site in English for the US market"
git push
```

Em 1–2 minutos o site atualiza. (Se quiser começar do zero: apague o repositório no GitHub e crie outro com o mesmo nome — o GitHub Pages se configura sozinho.)

### Opção B — repositório novo, só em inglês

Suba os arquivos em um repositório novo (ex.: `techtoolkit`) e depois ajuste a URL em **4 lugares**:
`index.html` (canonical + og:url + JSON-LD), `robots.txt`, `sitemap.xml` e `knowledge/produto.md`.

---

## 🇺🇸 5. Recomendações importantes para vender nos EUA

1. **Domínio próprio** (ex.: `techtoolkit.com`): URL `github.io` derruba conversão e gera desconfiança em tráfego pago. O GitHub Pages aceita domínio customizado gratuitamente.
2. **Capturas de tela e vídeo estão em português.** A página avisa isso de forma honesta (o visitante não se sente enganado), mas converte menos. Antes de gastar com anúncios, regrave as imagens e o vídeo com o painel em inglês — é o item de maior impacto depois do checkout.
3. **Provas sociais:** não inventei depoimentos (não existe nenhum nos EUA ainda). O site diz a verdade: a ferramenta é usada no Brasil e em Portugal há anos. Assim que tiver 3–5 compradores americanos, publique prints de avaliações — é o que mais aumenta conversão nesse mercado.
4. **Páginas legais:** Meta e Google Ads exigem política de privacidade, termos de uso e política de reembolso publicadas no site. Hoje o site não tem essas páginas — crie-as antes de anunciar.
5. **Cuidado com o que prometer no anúncio:** vender "Office PRO grátis" / "ativador" ou "desativa o Windows Defender" viola as políticas de anúncios do Google e da Meta e gera risco de DMCA. Escrevi a página em inglês **sem** essas promessas, destacando programas, drivers e automação. Mantenha assim e você não perde a conta de anúncios.
6. **Preço riscado:** o campo `compareAtPrice` ficou `null` de propósito. Só mostre um preço "de" se ele foi realmente praticado (regra da FTC) — é um risco evitável nos EUA.
7. **Suporte em inglês:** se você não responde em inglês, use um modelo de tradução pronto no Gmail ou contrate um freelancer para responder. Um "não entendo" no pós-venda gera reembolso e review ruim.

---

## 📁 6. Estrutura dos arquivos

```
site/
├── index.html              → a página de vendas em inglês
├── style.css               → visual (mesma identidade: fundo escuro + verde neon)
├── script.js               → comportamento (menu, FAQ, animações, aplica o config)
├── config.js               → ⭐ preço, link de checkout, e-mail de suporte, garantia
├── demo-video.mp4          → vídeo demonstrativo
├── assets/                 → caixa 3D em inglês + 5 capturas da interface
├── chat/                   → widget do chat (Ana) + motor de respostas local
│   ├── ChatWidget.js  ChatWindow.js  Message.js  TypingIndicator.js
│   ├── faqEngine.js   matcher.js     normalize.js  mergeFaq.js
│   └── chat.css  ana-avatar.png
├── knowledge/              → base de conhecimento do chat
│   ├── faq_*.json          → 20 arquivos, 117 intenções (é aqui que você edita respostas)
│   ├── faq.json            → gerado automaticamente (o chat lê este)
│   └── produto.md, bonus.md, garantia.md, faq.md
├── robots.txt / sitemap.xml / .gitignore
└── googled4fa5620d5eeb571.html → verificação do Google (não apague)
```

---

## ✏️ 7. Como editar as respostas do chat

1. Abra o arquivo da categoria em `knowledge/` (ex.: `faq_preco.json`).
2. Edite `response` (a resposta) ou `patterns`/`keywords` (as formas como o cliente pergunta).
3. Rode o gerador:

```bash
cd site
node chat/mergeFaq.js      # regrava knowledge/faq.json com todas as intenções
```

**Atalhos disponíveis nas respostas** (são substituídos automaticamente pelo valor do `config.js`):
`{{PRICE}}` · `{{PRODUCT_NAME}}` · `{{USB_SIZE}}` · `{{SUPPORT_EMAIL}}` · `{{CHECKOUT_URL}}` · `{{CHECKOUT_LINK}}` · `{{GUARANTEE}}`

Assim, quando você mudar o link de checkout ou o preço, **o site inteiro e o chat** se atualizam sozinhos.

---

## 📋 8. Checklist antes de ligar os anúncios

- [ ] Chave da OpenAI **revogada** e `.env` removido do repositório
- [ ] `checkoutUrl` com um checkout que aceita **USD**
- [ ] `supportEmail` com um e-mail que você realmente lê
- [ ] Teste real: comprar com cartão e conferir o e-mail de entrega
- [ ] Testar o site e o chat no celular
- [ ] Páginas de privacidade, termos e reembolso publicadas
- [ ] Capturas de tela e vídeo regravados em inglês (opcional, mas recomendado)
- [ ] Domínio próprio apontado para o Pages
- [ ] Google Search Console reconectado (o arquivo de verificação já está na pasta)

Bom lançamento! 🇺🇸
