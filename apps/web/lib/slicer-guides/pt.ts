/**
 * Portuguese (Português) slicer instruction guide content.
 * Menu names stay in official English where the slicer UI does.
 */

import type { GuidesBundle, GuideSection, SlicerGuide } from "./en";

function guide(
  title: string,
  lead: string,
  sections: GuideSection[],
): SlicerGuide {
  return { title, lead, sections };
}

export const guides: GuidesBundle = {
  overview: {
    heading: "Slicers compatíveis",
    lead: "O OpenFilament cria um ficheiro de preset de filamento. Descarrega-o e importa-o para o teu slicer. O OpenFilament não instala software nem altera pastas locais do slicer.",
    tableCaption: "Visão geral de compatibilidade",
    interchangeTitle: "OpenFilamentProfile JSON",
    interchangeBody:
      "Formato de intercâmbio canónico para cópias de segurança, portabilidade, integrações e programadores. Não é um preset de slicer e não pode ser usado diretamente para imprimir.",
    viewInstructions: "Ver instruções de importação",
    officialSite: "Site oficial",
    colSlicer: "Slicer",
    colStatus: "Estado",
    colFilament: "Preset de filamento",
    colPrinter: "Preset de impressora",
    colProcess: "Preset de processo",
    colInstructions: "Instruções",
    yes: "Sim",
    no: "Não",
    identityHeading: "Preset vs. identidade do rolo",
    identityBody:
      "O preset de filamento do slicer configura temperaturas e extrusão. CFS/AMS/RFID identificam ou mapeiam o rolo físico. O G-code fatiado é o que a impressora executa. Podem referir-se ao mesmo registo OpenFilament, mas não são o mesmo ficheiro.",
  },
  status: {
    supported: "Suportado",
    beta: "Beta",
    planned: "Planeado",
    interchange: "Formato de intercâmbio",
  },
  guides: {
    "creality-print": guide(
      "Creality Print — instruções de importação",
      "Descarrega um preset de filamento de utilizador (.json) do OpenFilament e importa-o com File → Import → Import Configs. As definições de impressora e processo permanecem inalteradas. Os nomes dos menus seguem a interface em inglês do Creality Print.",
      [
        {
          id: "what",
          heading: "O que o OpenFilament exporta",
          blocks: [
            {
              type: "p",
              text: "Um ficheiro JSON wrapper de utilizador no estilo Creality Print com substituições em array de strings e uma cadeia inherits (base Generic/HP para a tua impressora e nozzle).",
            },
            {
              type: "ul",
              items: [
                "Fabricante, tipo, cor, densidade e diâmetro do filamento",
                "Temperaturas do nozzle e da base (incluindo primeira camada, quando conhecido)",
                "Rácio de fluxo, pressure advance, fluxo volumétrico máximo",
                "Substituições de arrefecimento e retração, quando presentes",
                "Temperatura da câmara e encolhimento, quando presentes",
                "Notas de proveniência em filament_notes",
              ],
            },
            {
              type: "p",
              text: "Não inclui firmware de impressora, preset completo de impressora, preset de processo/impressão, G-code fatiado ou payloads RFID/CFS.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de começar",
          blocks: [
            {
              type: "ul",
              items: [
                "Creality Print 6.x ou 7.x (suporte Beta)",
                "Adiciona primeiro a tua impressora no Creality Print",
                "Seleciona o diâmetro de nozzle correspondente",
                "Não é necessária conta OpenFilament para descarregar",
                "Opcional: faz cópia de segurança dos presets de utilizador existentes (File → Export → Export Presets)",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descarregar do OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encontra o filamento (Pesquisa / catálogo).",
                "Abre a cor / variante.",
                "Escolhe a impressora e o nozzle.",
                "Escolhe um perfil de calibração.",
                "Abre Download for slicer / Export e escolhe Creality Print.",
                "Cria o download e guarda o ficheiro .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar para o Creality Print",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre o Creality Print.",
                "Escolhe File → Import → Import Configs.",
                "Seleciona o ficheiro .json descarregado do OpenFilament.",
                "Confirma se te for perguntado sobre presets existentes.",
              ],
            },
            {
              type: "note",
              text: "Ao atualizar entre versões principais, o Creality pode oferecer «Import 5.x Presets» ou avisos de migração — esse caminho serve para migrar dados antigos do Creality, não para o download habitual do OpenFilament.",
            },
          ],
        },
        {
          id: "select",
          heading: "Selecionar o perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre a lista de filamentos do teu projeto.",
                "Encontra o preset de utilizador com o nome tipo «Brand Product Colour @Creality … nozzle».",
                "Confirma que a impressora ativa e o nozzle correspondem ao perfil.",
                "Os presets de sistema permanecem separados dos presets de utilizador.",
              ],
            },
          ],
        },
        {
          id: "cfs",
          heading: "Ligá-lo ao filamento físico (CFS)",
          blocks: [
            {
              type: "p",
              text: "O preset importado vive no slicer. A identidade do material no slot CFS é separada.",
            },
            {
              type: "ol",
              items: [
                "Carrega ou edita o slot CFS para o rolo físico.",
                "Mapeia o slot para o preset de filamento importado quando o Creality Print pedir um filamento.",
                "O RFID pode identificar material e cor; não contém o perfil de calibração completo do OpenFilament.",
              ],
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar a importação",
          blocks: [
            {
              type: "ul",
              items: [
                "O preset aparece na lista de filamentos",
                "Impressora correta selecionada",
                "Diâmetro de nozzle correto selecionado",
                "Temperaturas correspondem ao perfil do OpenFilament",
                "Fluxo e fluxo volumétrico máximo estão presentes",
                "O projeto fatiado usa o filamento importado",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Resolução de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "Ficheiro rejeitado — confirma que é o preset de utilizador .json do OpenFilament, não o JSON de intercâmbio OpenFilamentProfile.",
                "Não visível — limpa filtros; verifica se a base inherits existe para a tua impressora/nozzle.",
                "Nozzle errado — re-exporta com o nozzle correto, ou altera o nozzle no Creality Print e re-seleciona o filamento.",
                "Nome duplicado — renomeia ou elimina o preset de utilizador antigo antes de reimportar.",
                "Versão antiga — atualiza para Creality Print 6.x/7.x.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remover ou substituir o perfil",
          blocks: [
            {
              type: "p",
              text: "Elimina o preset de utilizador da lista de filamentos de utilizador do Creality Print, ou importa uma revisão mais recente do OpenFilament (prefere um nome de ficheiro distinto de um novo download). Evita manter muitas revisões quase duplicadas.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitações conhecidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta: testes estruturais passam; verificação manual mais ampla em curso.",
                "Apenas filamento — sem exportação de impressora/processo.",
                "Materiais exóticos podem herdar uma base Generic incompleta para esse tipo.",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fontes e compatibilidade",
          blocks: [
            {
              type: "ul",
              items: [
                "Versões suportadas: 6.x, 7.x (Beta)",
                "Última verificação estrutural: 2026-08-10",
                "Adapter: @open-filament/slicer-creality",
                "Notas de investigação: docs/SLICER_IMPORT_SOURCES.md",
              ],
            },
          ],
        },
      ],
    ),
    orcaslicer: guide(
      "OrcaSlicer — instruções de importação",
      "Descarrega um preset de filamento JSON do OpenFilament e importa-o com File → Import → Import Configs. Os nomes dos menus seguem a interface em inglês / wiki do OrcaSlicer.",
      [
        {
          id: "what",
          heading: "O que o OpenFilament exporta",
          blocks: [
            {
              type: "p",
              text: "Um preset de utilizador de filamento JSON para OrcaSlicer (type: filament) com inherits como Generic ASA @K2 Plus-all, além de temperaturas, fluxo, PA, limite volumétrico, arrefecimento e retração quando conhecidos.",
            },
            {
              type: "p",
              text: "Não inclui presets de impressora ou de processo, G-code ou dados RFID.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de começar",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer 2.0+ recomendado (Beta)",
                "Instala/seleciona primeiro o teu perfil de impressora",
                "Cópia de segurança opcional: File → Export → Export Preset Bundle",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descarregar do OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encontra filamento → variante → impressora/nozzle → perfil.",
                "Escolhe OrcaSlicer na página Export / Download for slicer.",
                "Cria o download e guarda o ficheiro .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar para o OrcaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre o OrcaSlicer.",
                "Escolhe File → Import → Import Configs (wiki: Preset Configs).",
                "Seleciona o preset de filamento .json do OpenFilament.",
                "Confirma a substituição se já existir um preset com o mesmo nome.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Selecionar o perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre o menu Filament.",
                "Localiza o preset de utilizador (marca / produto / cor).",
                "Se não aparecer: Filament settings → Dependencies — ativa a tua impressora/nozzle.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Ligá-lo ao filamento físico",
          blocks: [
            {
              type: "p",
              text: "Para um rolo externo, seleciona o filamento importado no separador prepare. Para mapeamento estilo AMS/CFS no Orca, mapeia o slot para este filamento de utilizador apenas quando o teu perfil de impressora o suportar — o OpenFilament não escreve RFID automaticamente.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar a importação",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset listado em filamentos de utilizador",
                "Impressora e nozzle ativos",
                "Temperaturas / fluxo / volumétrico máximo correspondem",
                "O projeto fatia com este filamento",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Resolução de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "Configuração inválida — certifica-te de que é JSON (não Prusa .ini).",
                "Oculto após importação — corrige compatible_printers / Dependencies.",
                "Base inherit errada — re-exporta após escolher um modelo de impressora mais próximo.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remover ou substituir o perfil",
          blocks: [
            {
              type: "p",
              text: "Elimina o preset de filamento de utilizador no OrcaSlicer, ou importa um download mais recente do OpenFilament. Prefere nomes de ficheiro de revisão distintos do OpenFilament.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitações conhecidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Suporte Beta",
                "Exportação apenas de filamento",
                "Herda bases no estilo Generic @printer-all",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fontes e compatibilidade",
          blocks: [
            {
              type: "ul",
              items: [
                "Wiki do OrcaSlicer import_export",
                "Última verificação estrutural: 2026-08-10",
                "Adapter: @open-filament/slicer-orca",
              ],
            },
          ],
        },
      ],
    ),
    prusaslicer: guide(
      "PrusaSlicer — instruções de importação",
      "Descarrega um config bundle de filamento (.ini) do OpenFilament e importa-o com File → Import → Import Config Bundle…. Os nomes dos menus seguem a interface em inglês / Prusa Knowledge Base do PrusaSlicer.",
      [
        {
          id: "what",
          heading: "O que o OpenFilament exporta",
          blocks: [
            {
              type: "p",
              text: "Um config bundle para PrusaSlicer contendo uma secção [filament:…] com inherits (*PLA*, *PET*, *ABS*, *FLEX*), temperaturas, multiplicador de extrusão, limite volumétrico, ventoinhas e notas. O pressure advance é uma indicação em start_filament_gcode.",
            },
            {
              type: "p",
              text: "Sem preset de impressora, preset de impressão/processo, G-code ou dados RFID.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de começar",
          blocks: [
            {
              type: "ul",
              items: [
                "PrusaSlicer 2.7+ (Beta; testado estruturalmente até campos 2.9.x)",
                "Configura primeiro a tua impressora no PrusaSlicer",
                "Opcional: File → Export → Export Config Bundle para cópia de segurança",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descarregar do OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encontra filamento → variante → impressora/nozzle → perfil.",
                "Escolhe PrusaSlicer em Export / Download for slicer.",
                "Cria o download e guarda o ficheiro .ini.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar para o PrusaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre o PrusaSlicer.",
                "Escolhe File → Import → Import Config Bundle…",
                "Seleciona o ficheiro .ini do OpenFilament.",
              ],
            },
            {
              type: "note",
              text: "Usa Import Config Bundle para este ficheiro (é um pequeno bundle com uma secção de filamento). Import Config é para um perfil combinado único / G-code — não é o caminho habitual do OpenFilament.",
            },
          ],
        },
        {
          id: "select",
          heading: "Selecionar o perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre Filament Settings.",
                "Seleciona o preset personalizado (marca / produto / cor).",
                "Confirma a impressora e o nozzle no plater antes de fatiar.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Ligá-lo ao filamento físico",
          blocks: [
            {
              type: "p",
              text: "O PrusaSlicer não mapeia automaticamente RFID de terceiros. Seleciona o preset de filamento importado no plater para o rolo que carregaste. Não existe integração automática de sistema de materiais do OpenFilament.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar a importação",
          blocks: [
            {
              type: "ul",
              items: [
                "O filamento personalizado aparece na lista",
                "Temperaturas e multiplicador de extrusão correspondem",
                "A fatiação usa o filamento selecionado",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Resolução de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "Nada importado — usa Import Config Bundle, não Import Config.",
                "Extensão errada — mantém .ini (não deixes como .txt).",
                "ASA usa inherit *ABS* — esperado para templates de fábrica.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remover ou substituir o perfil",
          blocks: [
            {
              type: "p",
              text: "Remove o preset de filamento personalizado no PrusaSlicer, ou importa um .ini mais recente do OpenFilament. Renomeia localmente se personalizaste valores que queres manter.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitações conhecidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Suporte Beta",
                "Bundle apenas de filamento",
                "PA via indicação em gcode",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fontes e compatibilidade",
          blocks: [
            {
              type: "ul",
              items: [
                "Artigo Prusa Knowledge Base 382766",
                "Última verificação estrutural: 2026-08-10",
                "Adapter: @open-filament/slicer-prusa",
              ],
            },
          ],
        },
      ],
    ),
    "bambu-studio": guide(
      "Bambu Studio — instruções de importação",
      "Descarrega um preset de filamento JSON de utilizador do OpenFilament e importa-o com File → Import → Import Configs. Os nomes dos menus seguem a interface atual em inglês do Bambu Studio.",
      [
        {
          id: "what",
          heading: "O que o OpenFilament exporta",
          blocks: [
            {
              type: "p",
              text: "Um preset de utilizador de filamento JSON para Bambu Studio / família SoftFever com inherits (Generic {material} [@printer]), temperaturas, fluxo, PA, limite volumétrico, arrefecimento, retração e notas.",
            },
            {
              type: "p",
              text: "Sem presets de impressora/processo, G-code ou suporte de escrita RFID Bambu pelo OpenFilament.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de começar",
          blocks: [
            {
              type: "ul",
              items: [
                "Bambu Studio 1.9+ / 2.0+ (Beta)",
                "Seleciona primeiro a tua impressora e nozzle no Studio",
                "Opcional: exporta uma cópia de segurança dos presets de utilizador",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descarregar do OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encontra filamento → variante → impressora/nozzle → perfil.",
                "Escolhe Bambu Studio em Export / Download for slicer.",
                "Cria o download e guarda o ficheiro .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar para o Bambu Studio",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre o Bambu Studio.",
                "Escolhe File → Import → Import Configs.",
                "Seleciona o preset de filamento .json do OpenFilament.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Selecionar o perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre a seleção de filamento → User / Custom filaments.",
                "Limpa filtros de impressora/nozzle se o preset estiver oculto.",
                "Seleciona o preset importado para a placa.",
              ],
            },
          ],
        },
        {
          id: "ams",
          heading: "Ligá-lo ao filamento físico (AMS)",
          blocks: [
            {
              type: "p",
              text: "A identidade do material AMS é separada do preset do slicer. Mapeia o slot AMS para o filamento de utilizador importado na interface de mapeamento AMS / filamento do Studio. O OpenFilament não reivindica escrita RFID de terceiros em tags Bambu.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar a importação",
          blocks: [
            {
              type: "ul",
              items: [
                "Filamento de utilizador listado",
                "Impressora/nozzle corretos",
                "Temperaturas / fluxo / volumétrico correspondem",
                "A fatiação usa o filamento importado",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Resolução de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "Não visível — limpa filtros; confirma que a base inherit existe.",
                "Rejeitado — não uses o JSON de intercâmbio OpenFilamentProfile.",
                "Incompatibilidade AMS — mapeia o slot manualmente para o preset de utilizador.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remover ou substituir o perfil",
          blocks: [
            {
              type: "p",
              text: "Remove o filamento de utilizador no Bambu Studio ou importa um download mais recente do OpenFilament com um nome de ficheiro distinto.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitações conhecidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Suporte Beta",
                "Apenas filamento",
                "Sem escrita RFID Bambu",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fontes e compatibilidade",
          blocks: [
            {
              type: "ul",
              items: [
                "File → Import → Import Configs (Studio atual)",
                "Última verificação estrutural: 2026-08-10",
                "Adapter: @open-filament/slicer-bambu",
              ],
            },
          ],
        },
      ],
    ),
  },
};
