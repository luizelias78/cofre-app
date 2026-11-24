# Cofre — app de senhas (Android e iPhone)

App feito em React Native + Expo (SDK 58). Um único código gera o app de Android e de iPhone.

## O que ele faz
- Abre bloqueado: pede digital, Face ID ou o PIN do celular para entrar.
- Bloqueia de novo sozinho se o app ficar mais de 30 s em segundo plano.
- Cada registro guarda: nome, tipo (Site, E-mail, App, Banco, Wi-Fi, Outro), URL, e-mail/usuário, senha e descrição.
- A senha fica oculta (••••). Para ver ou copiar, o app pede o PIN/digital. Ela volta a se esconder sozinha depois de 30 s.
- Quando você copia uma senha, ela é apagada da área de transferência depois de 45 s.
- Gerador de senha forte (botão ✨) e medidor de força.
- Busca, filtros por tipo e favoritos.
- Os dados ficam só no celular, criptografados pelo sistema (Keychain no iPhone, Keystore no Android). Não há servidor nem nuvem.

> Atenção: como nada vai para a nuvem, se você trocar de celular ou desinstalar o app, as senhas não vão junto.

---

## Pré-requisito (uma vez só, no Windows)
1. Instale o **Node.js LTS**: https://nodejs.org
2. Crie uma conta grátis na Expo: https://expo.dev/signup
3. Descompacte esta pasta, abra o **PowerShell** dentro dela e rode:
   ```
   npm install
   npx eas-cli@latest login
   ```

## Gerar o .apk (Android), grátis
```
npx eas-cli@latest build -p android --profile apk
```
- Na primeira vez ele pergunta se quer criar o projeto e a chave de assinatura. Responda **Y** (sim) em tudo.
- A compilação roda na nuvem da Expo e leva uns 10 a 20 minutos.
- No fim aparece um **link e um QR Code**. Abra no celular Android, baixe o `.apk` e instale. Se o Android pedir, permita "instalar apps de fontes desconhecidas".

## iPhone (.ipa)
A Apple só deixa instalar um `.ipa` assinado por uma conta **Apple Developer** (US$ 99/ano). Com ela:
```
npx eas-cli@latest device:create
npx eas-cli@latest build -p ios --profile ios-teste
```
- `device:create` gera um link. Abra esse link no iPhone para registrar o aparelho.
- No fim do build, abra o link no iPhone e instale.

**Para testar no iPhone sem pagar:** instale o app **Expo Go** pela App Store e rode `npx expo start` no PC. Depois leia o QR Code com a câmera do iPhone. Isso serve para ver o app funcionando, mas ele roda dentro do Expo Go e não vira um app instalado.

## Estrutura
- `App.tsx`: navegação entre as telas e o bloqueio automático
- `src/screens/`: telas Bloqueio, Lista, Formulario e Detalhe
- `src/storage.ts`: gravação criptografada e gerador de senha
- `src/auth.ts`: PIN, digital e Face ID
- `src/theme.ts`: cores e tipos de registro
