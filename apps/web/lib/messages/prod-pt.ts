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
    "Escolhe marca → material → produto → cor no catálogo. Pesquisa primeiro; «Outro» só se o item realmente faltar.",
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
  cookiesTitle: "Política de cookies",
  termsTitle: "Termos de utilização",
  securityTitle: "Segurança",
  trustTitle: "Trust center",
  placeholderNotice:
    "Esta página inclui placeholders do operador claramente assinalados. Bloqueiam o lançamento até serem substituídos.",
  effective: "Data de entrada em vigor",
  operator: "Operador",
  privacyContact: "Contacto de privacidade",
  hosting: "Alojamento",
  contact: "Contacto",
  openSourceRepository: "Repositório open source",
  cookieSettingsHint: "Use as definições de cookies no rodapé",
  sections: {
    privacy: [
      { heading: "Dados tratados", items: ["Conta, sessões e registos de segurança.", "Cloud My Spools, notas privadas e identidades QR/RFID só após sincronização explícita.", "My Spools local permanece no navegador.", "Contribuições públicas e preferências de consentimento.", "Google Analytics 4 apenas após consentimento."] },
      { heading: "Bases legais e direitos", paragraphs: ["Tratamos dados para contrato/serviço pedido, interesse legítimo de segurança, consentimento para analytics e obrigações legais. Pode pedir acesso, correção, eliminação, limitação, portabilidade, oposição e retirar consentimento."] },
      { heading: "My Spools, retenção e transferências", paragraphs: ["Local permanece no dispositivo e iniciar sessão não o envia. Cloud é alojamento pré-pago opcional de 12 meses sem renovação automática. A resolução QR pública não expõe notas, locais ou IDs de conta.", "A retenção segue docs/DATA_RETENTION.md. Com analytics ativo, a Google pode tratar dados fora do EEE. Alterações materiais podem voltar a pedir consentimento."] },
    ],
    terms: [
      { heading: "Plataforma comunitária", paragraphs: ["OpenFilament fornece catálogo, identificação e calibrações comunitárias sem garantia de segurança de impressão; valida as definições na sua impressora."] },
      { heading: "Contas, Cloud e contribuições", paragraphs: ["Contas são opcionais. My Spools Local é gratuito. Cloud custa 19,99 € por 12 meses por pagamento Stripe único, sem renovação automática. A Stripe trata pagamentos; OpenFilament não guarda cartões.", "Ao enviar calibrações aceita os termos apresentados; emails de contribuidores ficam privados."] },
      { heading: "Disponibilidade e responsabilidade", paragraphs: ["O serviço é fornecido tal como está, sem garantia de disponibilidade contínua; a responsabilidade por ferramentas comunitárias gratuitas é limitada até ao permitido por lei."] },
    ],
    cookies: [
      { heading: "Armazenamento do navegador", paragraphs: ["Cookies/armazenamento necessários servem idioma, consentimento, sessões, CSRF, My Spools local e shell PWA. Analytics apenas com consentimento."] },
      { heading: "Escolha", paragraphs: ["Rejeitar analytics não desativa pesquisa, My Spools, contas, QR, RFID ou downloads. Não usamos armazenamento de marketing."] },
    ],
    security: [
      { heading: "Proteção", items: ["Palavras-passe com hash scrypt.", "Tokens de sessão com hash e cookies httpOnly.", "My Spools privado com verificações de propriedade.", "Projeções QR públicas sem campos privados."] },
      { heading: "Divulgação responsável", paragraphs: ["Reporte vulnerabilidades em privado ao contacto de segurança e não publique segredos, exploits contra utilizadores reais ou credenciais de produção antes de tempo razoável para correção."] },
    ],
  },
};
