/** Shared European Portuguese copy. Address: tu. */
export const consentPt = {
  bannerAria: "Consentimento de cookies",
  bannerText:
    "Usamos armazenamento necessário para o site funcionar. As analytics opcionais ajudam a melhorar o OpenFilament. Podes rejeitar cookies não essenciais sem perder pesquisa, My Spools, transferências, QR ou RFID.",
  acceptAll: "Aceitar tudo",
  rejectNonEssential: "Rejeitar não essenciais",
  manage: "Gerir preferências",
  cookiePolicy: "Política de cookies",
  privacyPolicy: "Política de privacidade",
  prefsTitle: "Preferências de cookies",
  prefsLead:
    "O armazenamento necessário permanece ativo. Analytics e marketing ficam desativados salvo se os ativares.",
  necessary: "Necessários",
  necessaryHelp: "Sessão, segurança, escolha de consentimento, idioma, My Spools local.",
  preferences: "Preferências",
  preferencesHelp: "Memorizar preferências de IU não essenciais.",
  analytics: "Analytics",
  analyticsHelp: "Google Analytics 4 com privacidade, apenas após consentimento.",
  marketing: "Marketing",
  marketingHelp: "Não utilizado. Permanece desativado.",
  savePrefs: "Guardar preferências",
  cancel: "Cancelar",
};

export const footerPt = {
  navAria: "Site e legal",
  privacy: "Privacidade",
  cookies: "Cookies",
  cookieSettings: "Definições de cookies",
  terms: "Termos",
  security: "Segurança",
  trust: "Trust center",
  mySpools: "My Spools",
  support: "Suporte",
  tagline: "OpenFilament — inteligência de filamento, primeiro no browser.",
  legalPlaceholderWarn:
    "Os dados legais do operador ainda são placeholders — ver docs/PRODUCTION_LAUNCH_CHECKLIST.md antes do lançamento.",
};

export const spoolsPt = {
  heading: "My Spools",
  lead:
    "Acompanha bobinas físicas neste dispositivo. A sync Cloud é opcional e nunca começa só porque inicias sessão.",
  localMode: "Apenas local (este browser)",
  localWarn:
    "Os dados locais podem perder-se se limpares dados do site ou mudares de dispositivo. Exporta uma cópia de segurança regularmente.",
  cloudMode: "Sync Cloud (conta)",
  create: "Adicionar bobina",
  export: "Exportar JSON",
  import: "Importar JSON",
  clearAll: "Limpar todos os dados locais",
  clearConfirm:
    "Eliminar todos os registos locais de bobinas neste dispositivo? Isto não pode ser anulado.",
  syncPreview: "Pré-visualizar sync",
  syncConfirm: "Carregar bobinas selecionadas",
  syncKeepLocal: "Manter cópia local após sync",
  syncRemoveLocal: "Remover cópia local após sync",
  empty: "Ainda sem bobinas. Adiciona o teu primeiro rolo.",
  status: "Estado",
  weight: "Peso atual (g)",
  tare: "Tara / bobina vazia (g)",
  initial: "Líquido inicial (g)",
  remaining: "Restante %",
  location: "Local de armazenamento",
  notes: "Notas (privadas)",
  batch: "Lote / batch",
  purchase: "Data de compra",
  opened: "Data de abertura",
  archive: "Arquivar",
  restore: "Restaurar",
  delete: "Eliminar",
  duplicate: "Duplicar para um rolo novo",
  drying: "Adicionar secagem",
  qr: "Associar identidade QR",
  rfid: "Associar identidade RFID",
  save: "Guardar bobina",
  syncNeverAuto:
    "Iniciar sessão não envia bobinas locais. Tens de confirmar a sync explicitamente.",
  conflictPolicy:
    "Conflitos usam last-write-wins por versão de sync. A reimportação ignora duplicados antigos.",
  wizardLead:
    "Escolhe marca e material no catálogo, depois produto e cor. Pesquisa primeiro; «Outro» só se o item realmente faltar.",
  catalogRequired:
    "Seleciona marca, material, produto e cor no catálogo antes de guardar.",
  existingRollWarn:
    "Já tens {count} rolo(s) desta cor em My Spools. Guarda só se for outra bobina física.",
  editSpool: "Editar bobina",
  cancel: "Cancelar",
  showArchived: "Mostrar arquivadas",
  usageLabel: "Usado após impressão (g)",
  usagePlaceholder: "ex. 42",
  usageSubmit: "Subtrair uso",
  usageAddSubmit: "Adicionar gramas",
  usageSaved: "Uso registado e quantidade restante atualizada.",
  usageError: "Introduza uma quantidade positiva de gramas usadas.",
  usageNeedsWeights: "Adicione peso inicial e atual para acompanhar o uso de impressão.",
};

export const accountPt = {
  heading: "Conta",
  sessions: "Sessões ativas",
  revokeSession: "Revogar",
  revokeOthers: "Revogar outras sessões",
  exportData: "Exportar os meus dados",
  deleteAccount: "Eliminar a minha conta",
  deleteWarn:
    "Isto elimina permanentemente bobinas privadas e sessões. Contribuições públicas podem ser anonimizadas em vez de removidas.",
  deleteConfirmLabel: "Escreve DELETE para confirmar",
  privacyPrefs: "Preferências de privacidade",
  register: "Criar conta",
  logout: "Terminar sessão",
};

export const legalPagesPt = {
  privacyTitle: "Política de privacidade",
  privacyMetaDescription: "Como a OpenFilament trata o e-mail da conta, pagamentos Stripe, My Spools e cookies.",
  cookiesTitle: "Política de cookies",
  termsTitle: "Termos de serviço",
  termsMetaDescription:
    "Termos OpenFilament: serviço tal como está, sem reembolsos de Cloud, sem renovação automática, janela de exportação Cloud de 30 dias após expiração.",
  securityTitle: "Segurança",
  trustTitle: "Trust center",
  placeholderNotice: "Esta página inclui placeholders do operador claramente marcados. Bloqueiam o lançamento até serem substituídos.",
  effective: "Data de vigência",
  operator: "Operador",
  privacyContact: "Contacto de privacidade",
  hosting: "Alojamento",
  contact: "Contacto",
  openSourceRepository: "Repositório open-source",
  cookieSettingsHint: "Podes alterar cookies de analytics e preferências a qualquer momento em Definições de cookies. Versão do consentimento:",
  sections: {
    privacy: [
      {
        heading: "Contas — o que guardamos",
        paragraphs: [
          "Criar uma conta só exige um e-mail e uma palavra-passe. Guardamos esse e-mail para iniciares sessão, receberes recibos de pagamento e redefinires a palavra-passe. Não pedimos o teu nome real; é gerado automaticamente um nome de utilizador interno. As palavras-passe são armazenadas como hashes scrypt — nunca em texto simples.",
          "Não usamos o teu e-mail para marketing. Recuperação de conta e mensagens essenciais do serviço (por exemplo, pagamento ou segurança) são os usos previstos.",
        ],
      },
      {
        heading: "Pagamentos (Stripe)",
        paragraphs: [
          "Compras opcionais de My Spools Cloud são pagas via Stripe Checkout. Introduzes cartão ou carteira nas páginas de pagamento alojadas pela Stripe. A Stripe é o processador de pagamentos: a OpenFilament nunca recebe nem guarda o teu número completo de cartão, CVC ou segredos equivalentes da carteira.",
          "Do nosso lado só mantemos o necessário para acesso Cloud e contabilidade: montante, moeda, estado do pagamento, identificadores de sessão/pagamento Stripe, carimbos temporais e o teu período de entitlement Cloud. A Stripe trata dados de pagamento segundo os seus próprios termos e política de privacidade.",
          "O acesso Cloud é um período pré-pago único (atualmente 12 meses). Não há renovação automática nem débito off-session a menos que inicies tu um novo Checkout.",
        ],
      },
      {
        heading: "O que mais processamos",
        items: [
          "Sessões de autenticação (cookies httpOnly) e registos de segurança.",
          "Inventário My Spools Cloud, notas privadas e identidades QR/RFID apenas quando sincronizas explicitamente para a Cloud.",
          "My Spools local permanece no browser até sincronizares ou exportares — iniciar sessão não envia bobinas locais por si só.",
          "Contribuições públicas da comunidade que escolhes publicar (calibrações, dicas de catálogo).",
          "Preferências de consentimento e Google Analytics 4 opcional só após opt-in.",
        ],
      },
      {
        heading: "Bases legais",
        items: [
          "Contrato / serviço solicitado para contas, Cloud, exportações e transferências.",
          "Interesse legítimo para segurança, prevenção de abuso e integridade do serviço.",
          "Consentimento para cookies/armazenamento de analytics — retirável via Definições de cookies neste site.",
          "Obrigação legal quando registos de segurança ou contabilísticos devam ser retidos.",
        ],
      },
      {
        heading: "My Spools",
        paragraphs: [
          "My Spools local é gratuito e fica no teu dispositivo. Limpar dados do site, perder o dispositivo ou mudar de browser pode removê-lo.",
          "My Spools Cloud é alojamento pago opcional para sync de inventário e cópia de segurança. A resolução QR pública não expõe notas privadas, localizações nem identificadores de conta.",
        ],
      },
      {
        heading: "Os teus direitos e retenção",
        paragraphs: [
          "Podes pedir acesso, correção, eliminação, restrição, portabilidade e oposição, e retirar o consentimento. Usa exportar/eliminar conta, Definições de cookies ou e-mail o contacto de privacidade. Podes queixar-te à autoridade de supervisão indicada para este site.",
          "Bobinas Cloud soft-deleted são purgadas segundo calendário. Registos de pagamento e segurança podem ser mantidos mais tempo quando a contabilidade ou prevenção de fraude o exijam. Backups podem reter dados eliminados até à expiração do backup.",
        ],
      },
      {
        heading: "Transferências internacionais e alterações",
        paragraphs: [
          "O alojamento da aplicação e da base de dados está no nosso VPS da UE como indicado acima. Se ativares analytics, a Google pode processar dados fora do EEE sob as suas salvaguardas. A Stripe pode processar dados de pagamento nas regiões onde opera. Alterações materiais de política atualizam a versão do consentimento e podem voltar a pedir consentimento.",
        ],
      },
    ],
    terms: [
      {
        heading: "Serviço comunitário tal como está",
        paragraphs: [
          "A OpenFilament é fornecida tal como está e conforme disponível. Dados do catálogo, perfis iniciais e calibrações da comunidade não são garantia de segurança de impressão. Continuas responsável por validar as definições na tua impressora e pelos resultados de impressão.",
          "Não garantimos disponibilidade ininterrupta, funcionamento sem erros nem adequação a um fim específico, na medida permitida por lei. My Spools Cloud é oferecido em beta.",
        ],
      },
      {
        heading: "Contas e uso gratuito",
        paragraphs: [
          "Navegar, pesquisar, descarregar perfis e My Spools Local são gratuitos. Uma conta (e-mail e palavra-passe) é opcional para o uso gratuito e só é necessária se comprares My Spools Cloud, para podermos associar o inventário e recuperar o acesso.",
        ],
      },
      {
        heading: "My Spools Cloud — pagamento, sem renovação, sem reembolsos",
        paragraphs: [
          "Cloud é um serviço digital pré-pago opcional: atualmente 19,99 € por 12 meses, pago uma vez via Stripe Checkout. Não há renovação automática nem débito off-session. O acesso termina quando o período pago acaba, salvo se iniciares tu um novo Checkout.",
          "Todas as compras Cloud são finais: sem reembolsos, sem chargebacks por arrependimento do comprador, nem reembolsos parciais por meses não usados. A Stripe processa o pagamento; a OpenFilament não guarda números de cartão.",
          "Cloud só acrescenta sincronização de bobinas entre dispositivos e stock/cópia de segurança no servidor. Não desbloqueia funções extra de catálogo, perfil ou RFID/QR além do Local.",
        ],
      },
      {
        heading: "Após expirar a Cloud — 30 dias para exportar",
        paragraphs: [
          "Quando o teu período Cloud termina, mantemos o inventário Cloud durante mais 30 dias. Nesses 30 dias ainda podes exportar os teus dados Cloud (JSON). A sync e o acesso de escrita após a expiração seguem as regras do produto (só leitura / janela de exportação).",
          "Após esses 30 dias, o inventário Cloud pode ser eliminado permanentemente dos nossos servidores. My Spools local no browser não é afetado e continua gratuito. Registos de pagamento e segurança podem ser mantidos mais tempo quando a contabilidade ou a prevenção de fraude o exijam.",
        ],
      },
      {
        heading: "Contribuições",
        paragraphs: [
          "Ao submeteres calibrações aceitas os termos de contribuição mostrados no envio e licencias a contribuição para exibição pública sob os termos abertos do projeto. Os e-mails dos contribuidores permanecem privados.",
        ],
      },
      {
        heading: "Responsabilidade",
        paragraphs: [
          "Na medida permitida pela lei aplicável, a OpenFilament e o seu operador não respondem por danos indiretos, incidentais ou consequentes decorrentes do uso das ferramentas gratuitas ou do serviço Cloud em beta. Direitos de consumo imperativos que não podem ser renunciados ao abrigo do direito neerlandês ou da UE permanecem inalterados.",
        ],
      },
    ],
    cookies: [
      {
        heading: "Armazenamento necessário",
        paragraphs: [
          "Necessário para o site funcionar: idioma (of_locale), escolha de consentimento (of_consent), sessão iniciada (of_session, httpOnly), proteção CSRF (of_csrf) e dados locais de My Spools em IndexedDB. Um service worker / Cache Storage pode manter o shell PWA offline. Não é usado para publicidade.",
        ],
      },
      {
        heading: "Analytics opcional",
        paragraphs: [
          "Só se aceitares analytics carregamos Google Analytics 4 com preocupação de privacidade, que pode definir cookies first-party como _ga. Rejeitar analytics deixa pesquisa, My Spools, contas, QR, RFID e transferências plenamente utilizáveis. Cookies de marketing não são usados.",
        ],
      },
      {
        heading: "Alterar a tua escolha",
        paragraphs: [
          "Abre Definições de cookies no rodapé ou na página de privacidade a qualquer momento. Mudar de ideias atualiza o armazenamento de imediato e desliga analytics quando retiras o consentimento.",
        ],
      },
    ],
    security: [
      {
        heading: "O que protegemos",
        items: [
          "Credenciais de conta com hashes de palavra-passe scrypt.",
          "Tokens de sessão hasheados em repouso e enviados ao browser como cookies httpOnly.",
          "My Spools privado com verificações de propriedade no servidor.",
          "Projeções QR públicas sem notas, localizações nem identificadores de conta.",
          "Dados de cartão tratados pela Stripe — não armazenados nos servidores OpenFilament.",
        ],
      },
      {
        heading: "Responsible disclosure",
        paragraphs: [
          "Reporta vulnerabilidades em privado ao contacto de segurança configurado. Não divulgues publicamente segredos, exploits contra utilizadores reais ou credenciais de produção. Concede tempo razoável de correção antes de discussão pública.",
        ],
      },
    ],
  },
};

export const supportPt = {
  title: "Suporte",
  metaDescription: "O que é a OpenFilament, o que podes fazer, e como My Spools gratuito difere da sync Cloud paga (beta).",
  lead: "Ajuda curta de operador para cliente: para que serve este site e como funciona My Spools Local vs Cloud — incluindo que Cloud pago ainda está em beta.",
  productHeading: "O que é a OpenFilament",
  productBody: "A OpenFilament é um catálogo de filamento e hub de calibração, primeiro no browser. Encontra dados de filamento, descarrega perfis starter ou medidos para o teu slicer, identifica bobinas com QR ou RFID e mantém inventário opcional com My Spools — sem instalar uma app de secretária para o produto principal.",
  productItems: [
    "Pesquisa marcas, materiais e cores; usa intervalos do fabricante como primeira definição sólida.",
    "Descarrega presets de slicer (perfis medidos da comunidade quando disponíveis, senão starters baseados no fabricante).",
    "Imprime etiquetas QR e usa fluxos RFID se tiveres hardware compatível.",
    "Contribui com calibrações para outros imprimirem melhor.",
    "Conta opcional para sync de inventário Cloud — navegar e My Spools Local funcionam sem pagar.",
  ],
  mySpoolsHeading: "My Spools — gratuito vs pago",
  mySpoolsLocalTitle: "My Spools Local (gratuito)",
  mySpoolsLocalBody: "Inventário completo neste dispositivo: notas, secagem, ligações QR/RFID, importar/exportar. Não é necessária conta. Os dados ficam no browser — exporta cópias se limpares dados do site ou mudares de dispositivo.",
  mySpoolsCloudTitle: "My Spools Cloud (pago, beta)",
  mySpoolsCloudBody: "Alojamento pré-pago opcional (19,99 € por 12 meses, pagamento único via Stripe, sem renovação automática). É necessária uma conta (e-mail + palavra-passe) para associar inventário Cloud e recuperar o acesso.",
  mySpoolsDiffItems: [
    "Local gratuito: ferramentas de inventário completas num browser/dispositivo.",
    "Cloud pago: os únicos extras são sincronizar bobinas entre dispositivos e stock/cópia de segurança no servidor no nosso VPS.",
    "A Cloud não desbloqueia melhores perfis, privilégios de catálogo, funções RFID/QR nem outras ferramentas de inventário além do Local.",
    "Após o período pago mantemos os dados Cloud 30 dias para ainda poderes exportá-los; depois podem ser eliminados. My Spools Local continua plenamente utilizável sem Cloud.",
  ],
  betaNote:
    "My Spools Cloud está em beta. Espera arestas enquanto endurecemos sync e faturação. O produto pago mantém-se estreito: sync de bobinas e cópia de stock — nada mais. As compras são finais (sem reembolsos) e não se renovam automaticamente.",
  contactHeading: "Contacto",
  contactBody: "Perguntas sobre privacidade, faturação ou beta Cloud: envia-nos e-mail. Para cookies, usa Definições de cookies na página de privacidade.",
};
