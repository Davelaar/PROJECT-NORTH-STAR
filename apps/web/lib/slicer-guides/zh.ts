/**
 * Simplified Chinese (简体中文) slicer instruction guide content.
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
    heading: "支持的切片软件",
    lead: "OpenFilament 创建耗材预设文件。你下载并导入到自己的切片软件中。OpenFilament 不安装任何软件，也不修改切片软件的本地文件夹。",
    tableCaption: "兼容性概览",
    interchangeTitle: "OpenFilamentProfile JSON",
    interchangeBody:
      "用于备份、可移植性、集成和开发者的标准交换格式。它不是切片预设，不能直接用来打印。",
    viewInstructions: "查看导入说明",
    officialSite: "官方网站",
    colSlicer: "切片软件",
    colStatus: "状态",
    colFilament: "耗材预设",
    colPrinter: "打印机预设",
    colProcess: "工艺预设",
    colInstructions: "说明",
    yes: "是",
    no: "否",
    identityHeading: "预设 vs 料盘身份",
    identityBody:
      "切片软件中的耗材预设配置温度和挤出参数。CFS/AMS/RFID 用于识别或映射物理料盘。切片后的 G-code 是打印机执行的内容。它们可能引用同一条 OpenFilament 记录，但不是同一个文件。",
  },
  status: {
    supported: "已支持",
    beta: "Beta",
    planned: "计划中",
    interchange: "交换格式",
  },
  guides: {
    "creality-print": guide(
      "Creality Print — 导入说明",
      "下载 OpenFilament 耗材用户预设（.json），使用 File → Import → Import Configs 导入。打印机和工艺设置不受影响。菜单名称沿用 Creality Print 英文界面。",
      [
        {
          id: "what",
          heading: "OpenFilament 导出的内容",
          blocks: [
            {
              type: "p",
              text: "Creality Print 格式的耗材用户预设 JSON，包含字符串数组覆盖和继承链（基于你的打印机和喷嘴的 Generic/HP 基础配置）。",
            },
            {
              type: "ul",
              items: [
                "耗材厂商、类型、颜色、密度和线径",
                "喷嘴和热床温度（包括首层温度，如已知）",
                "流量比、压力提前、最大体积流速",
                "冷却和回抽覆盖（如有）",
                "腔室温度和收缩率（如有）",
                "来源备注（filament_notes）",
              ],
            },
            {
              type: "p",
              text: "不包括打印机固件、完整的打印机预设、工艺/打印预设、切片 G-code 或 RFID/CFS 数据。",
            },
          ],
        },
        {
          id: "before",
          heading: "开始之前",
          blocks: [
            {
              type: "ul",
              items: [
                "Creality Print 6.x 或 7.x（Beta 支持）",
                "先在 Creality Print 中添加你的打印机",
                "选择对应的喷嘴直径",
                "下载不需要 OpenFilament 账户",
                "可选：备份现有用户预设（File → Export → Export Presets）",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "从 OpenFilament 下载",
          blocks: [
            {
              type: "ol",
              items: [
                "找到耗材（搜索 / 目录）。",
                "打开颜色 / 规格。",
                "选择打印机和喷嘴。",
                "选择校准配置文件。",
                "打开「下载切片软件预设」/ Export，选择 Creality Print。",
                "生成下载并保存 .json 文件。",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "导入到 Creality Print",
          blocks: [
            {
              type: "ol",
              items: [
                "打开 Creality Print。",
                "选择 File → Import → Import Configs。",
                "选择下载的 OpenFilament .json 文件。",
                "如有提示，确认是否覆盖现有预设。",
              ],
            },
            {
              type: "note",
              text: "在大版本升级时，Creality 可能还会提供「Import 5.x Presets」或迁移提示——那个路径是用来迁移旧版 Creality 用户数据的，不是 OpenFilament 的常规下载。",
            },
          ],
        },
        {
          id: "select",
          heading: "选择已导入的配置文件",
          blocks: [
            {
              type: "ul",
              items: [
                "打开项目的耗材列表。",
                "找到名称类似「品牌 产品 颜色 @Creality … 喷嘴」的用户预设。",
                "确认当前打印机和喷嘴与配置文件匹配。",
                "系统预设与用户预设分开显示。",
              ],
            },
          ],
        },
        {
          id: "cfs",
          heading: "与物理耗材关联（CFS）",
          blocks: [
            {
              type: "p",
              text: "导入的预设存在于切片软件中。CFS 料槽的材料身份是独立的。",
            },
            {
              type: "ol",
              items: [
                "加载或编辑物理料盘对应的 CFS 料槽。",
                "当 Creality Print 要求选择耗材时，将料槽映射到已导入的耗材预设。",
                "RFID 可以识别材料和颜色，但不包含完整的 OpenFilament 校准配置文件。",
              ],
            },
          ],
        },
        {
          id: "verify",
          heading: "验证导入",
          blocks: [
            {
              type: "ul",
              items: [
                "预设出现在耗材列表中",
                "已选择正确的打印机",
                "已选择正确的喷嘴直径",
                "温度与 OpenFilament 配置文件一致",
                "流量和最大体积流速已存在",
                "切片项目使用了已导入的耗材",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "故障排除",
          blocks: [
            {
              type: "ul",
              items: [
                "文件被拒绝——确认这是 OpenFilament 用户预设 .json，不是 OpenFilamentProfile 交换格式 JSON。",
                "看不到——清除筛选条件；检查你的打印机/喷嘴是否有对应的继承基础配置。",
                "喷嘴不对——使用正确的喷嘴重新导出，或在 Creality Print 中更改喷嘴再重新选择耗材。",
                "名称重复——在重新导入前重命名或删除旧的用户预设。",
                "版本过旧——升级到 Creality Print 6.x/7.x。",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "删除或替换配置文件",
          blocks: [
            {
              type: "p",
              text: "从 Creality Print 的耗材用户列表中删除该预设，或导入更新版本的 OpenFilament 修订（建议每次下载使用不同的文件名）。避免保留过多几乎相同的修订版本。",
            },
          ],
        },
        {
          id: "limits",
          heading: "已知限制",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta：结构测试通过；更广泛的手动验证仍在进行中。",
                "仅导出耗材——不支持打印机/工艺导出。",
                "特殊材料可能继承了不完整的 Generic 基础配置。",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "来源与兼容性",
          blocks: [
            {
              type: "ul",
              items: [
                "支持版本：6.x, 7.x (Beta)",
                "最后一次结构验证：2026-08-10",
                "适配器：@open-filament/slicer-creality",
                "研究笔记：docs/SLICER_IMPORT_SOURCES.md",
              ],
            },
          ],
        },
      ],
    ),
    orcaslicer: guide(
      "OrcaSlicer — 导入说明",
      "下载 OpenFilament 耗材 JSON 预设，使用 File → Import → Import Configs 导入。菜单名称沿用 OrcaSlicer 英文界面 / wiki。",
      [
        {
          id: "what",
          heading: "OpenFilament 导出的内容",
          blocks: [
            {
              type: "p",
              text: "OrcaSlicer 耗材用户预设 JSON（type: filament），继承如 Generic ASA @K2 Plus-all，包含温度、流量、PA、体积流速上限、冷却和回抽（如已知）。",
            },
            {
              type: "p",
              text: "不包括打印机或工艺预设、G-code 或 RFID 数据。",
            },
          ],
        },
        {
          id: "before",
          heading: "开始之前",
          blocks: [
            {
              type: "ul",
              items: [
                "推荐 OrcaSlicer 2.0+（Beta）",
                "先安装/选择打印机配置文件",
                "可选备份：File → Export → Export Preset Bundle",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "从 OpenFilament 下载",
          blocks: [
            {
              type: "ol",
              items: [
                "找到耗材 → 规格 → 打印机/喷嘴 → 配置文件。",
                "在 Export / 「下载切片软件预设」页面选择 OrcaSlicer。",
                "生成下载并保存 .json 文件。",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "导入到 OrcaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "打开 OrcaSlicer。",
                "选择 File → Import → Import Configs（wiki: Preset Configs）。",
                "选择 OpenFilament .json 耗材预设。",
                "如果同名预设已存在，确认覆盖。",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "选择已导入的配置文件",
          blocks: [
            {
              type: "ul",
              items: [
                "打开 Filament 下拉菜单。",
                "找到用户预设（品牌 / 产品 / 颜色）。",
                "如果找不到：Filament settings → Dependencies——启用你的打印机/喷嘴。",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "与物理耗材关联",
          blocks: [
            {
              type: "p",
              text: "外置料盘时，在准备标签页选择已导入的耗材。在 Orca 中进行 AMS/CFS 映射时，仅在你的打印机配置支持的情况下将料槽映射到该用户耗材——OpenFilament 不会自动写入 RFID。",
            },
          ],
        },
        {
          id: "verify",
          heading: "验证导入",
          blocks: [
            {
              type: "ul",
              items: [
                "预设出现在用户耗材中",
                "打印机和喷嘴已激活",
                "温度 / 流量 / 最大体积流速匹配",
                "项目使用该耗材进行切片",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "故障排除",
          blocks: [
            {
              type: "ul",
              items: [
                "配置无效——确保是 JSON（不是 Prusa .ini）。",
                "导入后不可见——修复 compatible_printers / Dependencies。",
                "继承基础不对——选择更匹配的打印机型号后重新导出。",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "删除或替换配置文件",
          blocks: [
            {
              type: "p",
              text: "在 OrcaSlicer 中删除用户耗材预设，或导入更新的 OpenFilament 下载。建议从 OpenFilament 使用不同的修订文件名。",
            },
          ],
        },
        {
          id: "limits",
          heading: "已知限制",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta 支持",
                "仅导出耗材",
                "继承 Generic @printer-all 风格基础",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "来源与兼容性",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer wiki import_export",
                "最后一次结构验证：2026-08-10",
                "适配器：@open-filament/slicer-orca",
              ],
            },
          ],
        },
      ],
    ),
    prusaslicer: guide(
      "PrusaSlicer — 导入说明",
      "下载 OpenFilament 耗材配置包（.ini），使用 File → Import → Import Config Bundle… 导入。菜单名称沿用 PrusaSlicer 英文界面 / Prusa Knowledge Base。",
      [
        {
          id: "what",
          heading: "OpenFilament 导出的内容",
          blocks: [
            {
              type: "p",
              text: "PrusaSlicer 配置包，包含一个 [filament:…] 段落，继承（*PLA*、*PET*、*ABS*、*FLEX*），温度，挤出倍率，体积流速上限，风扇和备注。Pressure advance 以 start_filament_gcode 提示形式存在。",
            },
            {
              type: "p",
              text: "不包括打印机预设、打印/工艺预设、G-code 或 RFID 数据。",
            },
          ],
        },
        {
          id: "before",
          heading: "开始之前",
          blocks: [
            {
              type: "ul",
              items: [
                "PrusaSlicer 2.7+（Beta；已通过 2.9.x 字段的结构测试）",
                "先在 PrusaSlicer 中配置你的打印机",
                "可选：File → Export → Export Config Bundle 备份",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "从 OpenFilament 下载",
          blocks: [
            {
              type: "ol",
              items: [
                "找到耗材 → 规格 → 打印机/喷嘴 → 配置文件。",
                "在 Export / 「下载切片软件预设」页面选择 PrusaSlicer。",
                "生成下载并保存 .ini 文件。",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "导入到 PrusaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "打开 PrusaSlicer。",
                "选择 File → Import → Import Config Bundle…",
                "选择 OpenFilament .ini 文件。",
              ],
            },
            {
              type: "note",
              text: "请使用 Import Config Bundle 导入此文件（这是一个包含耗材段落的小型配置包）。Import Config 用于单个组合配置文件 / G-code——不是 OpenFilament 的常规路径。",
            },
          ],
        },
        {
          id: "select",
          heading: "选择已导入的配置文件",
          blocks: [
            {
              type: "ul",
              items: [
                "打开 Filament Settings。",
                "选择自定义预设（品牌 / 产品 / 颜色）。",
                "切片前在工作台上确认打印机和喷嘴。",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "与物理耗材关联",
          blocks: [
            {
              type: "p",
              text: "PrusaSlicer 不会自动映射第三方 RFID。在工作台上为已装载的料盘选择已导入的耗材预设。OpenFilament 没有自动材料系统集成。",
            },
          ],
        },
        {
          id: "verify",
          heading: "验证导入",
          blocks: [
            {
              type: "ul",
              items: [
                "自定义耗材出现在列表中",
                "温度和挤出倍率匹配",
                "切片使用了所选耗材",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "故障排除",
          blocks: [
            {
              type: "ul",
              items: [
                "没有导入——使用 Import Config Bundle，不是 Import Config。",
                "扩展名错误——保持 .ini（不要改为 .txt）。",
                "ASA 使用 *ABS* 继承——对标准模板来说这是正常的。",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "删除或替换配置文件",
          blocks: [
            {
              type: "p",
              text: "在 PrusaSlicer 中删除自定义耗材预设，或导入更新的 OpenFilament .ini。如果你自定义了想保留的值，请先在本地重命名。",
            },
          ],
        },
        {
          id: "limits",
          heading: "已知限制",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta 支持",
                "仅耗材配置包",
                "PA 通过 gcode 提示",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "来源与兼容性",
          blocks: [
            {
              type: "ul",
              items: [
                "Prusa Knowledge Base 文章 382766",
                "最后一次结构验证：2026-08-10",
                "适配器：@open-filament/slicer-prusa",
              ],
            },
          ],
        },
      ],
    ),
    "bambu-studio": guide(
      "Bambu Studio — 导入说明",
      "下载 OpenFilament 耗材用户预设 JSON，使用 File → Import → Import Configs 导入。菜单名称沿用当前 Bambu Studio 英文界面。",
      [
        {
          id: "what",
          heading: "OpenFilament 导出的内容",
          blocks: [
            {
              type: "p",
              text: "Bambu Studio / SoftFever 系列耗材用户预设 JSON，包含继承（Generic {material} [@printer]）、温度、流量、PA、体积流速上限、冷却、回抽和备注。",
            },
            {
              type: "p",
              text: "不包括打印机/工艺预设、G-code，OpenFilament 也不支持 Bambu RFID 写入。",
            },
          ],
        },
        {
          id: "before",
          heading: "开始之前",
          blocks: [
            {
              type: "ul",
              items: [
                "Bambu Studio 1.9+ / 2.0+（Beta）",
                "先在 Studio 中选择打印机和喷嘴",
                "可选：导出用户预设备份",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "从 OpenFilament 下载",
          blocks: [
            {
              type: "ol",
              items: [
                "找到耗材 → 规格 → 打印机/喷嘴 → 配置文件。",
                "在 Export / 「下载切片软件预设」页面选择 Bambu Studio。",
                "生成下载并保存 .json 文件。",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "导入到 Bambu Studio",
          blocks: [
            {
              type: "ol",
              items: [
                "打开 Bambu Studio。",
                "选择 File → Import → Import Configs。",
                "选择 OpenFilament .json 耗材预设。",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "选择已导入的配置文件",
          blocks: [
            {
              type: "ul",
              items: [
                "打开耗材选择 → 用户 / 自定义耗材。",
                "如果预设被隐藏，请清除打印机/喷嘴筛选。",
                "为工作板选择已导入的预设。",
              ],
            },
          ],
        },
        {
          id: "ams",
          heading: "与物理耗材关联（AMS）",
          blocks: [
            {
              type: "p",
              text: "AMS 材料身份与切片预设是独立的。在 Studio 的 AMS / 耗材映射界面中，将 AMS 料槽映射到已导入的用户耗材。OpenFilament 不会向 Bambu 标签写入第三方 RFID。",
            },
          ],
        },
        {
          id: "verify",
          heading: "验证导入",
          blocks: [
            {
              type: "ul",
              items: [
                "用户耗材已列出",
                "打印机/喷嘴正确",
                "温度 / 流量 / 体积流速匹配",
                "切片使用了已导入的耗材",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "故障排除",
          blocks: [
            {
              type: "ul",
              items: [
                "看不到——清除筛选条件；确认继承基础配置存在。",
                "被拒绝——不要使用 OpenFilamentProfile 交换格式 JSON。",
                "AMS 不匹配——手动将料槽映射到用户预设。",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "删除或替换配置文件",
          blocks: [
            {
              type: "p",
              text: "在 Bambu Studio 中删除用户耗材，或导入更新的 OpenFilament 下载（使用不同的文件名）。",
            },
          ],
        },
        {
          id: "limits",
          heading: "已知限制",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta 支持",
                "仅耗材",
                "不支持 Bambu RFID 写入",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "来源与兼容性",
          blocks: [
            {
              type: "ul",
              items: [
                "File → Import → Import Configs（当前 Studio）",
                "最后一次结构验证：2026-08-10",
                "适配器：@open-filament/slicer-bambu",
              ],
            },
          ],
        },
      ],
    ),
  },
};
