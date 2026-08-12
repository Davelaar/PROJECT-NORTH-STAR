/** Shared Simplified Chinese copy. */
export const consentZh = {
  bannerAria: "Cookie 同意",
  bannerText:
    "我们使用必要存储以保障网站运行。注重隐私的分析用于改进 OpenFilament，默认开启，直到你拒绝。你可以拒绝非必要 Cookie，同时继续使用搜索、My Spools、下载、QR 与 RFID。",
  acceptAll: "全部接受",
  rejectNonEssential: "拒绝非必要",
  manage: "管理偏好",
  cookiePolicy: "Cookie 政策",
  privacyPolicy: "隐私政策",
  prefsTitle: "Cookie 偏好",
  prefsLead: "必要存储保持开启。分析默认开启，直到你关闭。营销未使用。",
  necessary: "必要",
  necessaryHelp: "会话、安全、同意选择、语言、本地 My Spools。",
  preferences: "偏好",
  preferencesHelp: "记住非必要的界面偏好。",
  analytics: "分析",
  analyticsHelp: "注重隐私的 Google Analytics 4 — 开启直至你拒绝。",
  marketing: "营销",
  marketingHelp: "未使用。保持关闭。",
  savePrefs: "保存偏好",
  cancel: "取消",
};

export const footerZh = {
  navAria: "站点与法律",
  privacy: "隐私",
  cookies: "Cookie",
  cookieSettings: "Cookie 设置",
  terms: "条款",
  security: "安全",
  trust: "Trust center",
  mySpools: "My Spools",
  support: "支持",
  tagline: "OpenFilament — 浏览器优先的耗材信息。",
  legalPlaceholderWarn:
    "运营方法律信息仍为占位符 — 上线前请参阅 docs/PRODUCTION_LAUNCH_CHECKLIST.md。",
};

export const spoolsZh = {
  heading: "My Spools",
  lead: "在此设备跟踪实体线轴。云同步为可选项，不会仅因登录而自动开始。",
  localMode: "仅本地（此浏览器）",
  localWarn: "清除网站数据或更换设备可能导致本地数据丢失。请定期导出备份。",
  cloudMode: "云同步（账户）",
  create: "添加线轴",
  export: "导出 JSON",
  import: "导入 JSON",
  clearAll: "清除全部本地数据",
  clearConfirm: "删除此设备上的全部本地线轴记录？此操作无法撤销。",
  syncPreview: "预览同步",
  syncConfirm: "上传所选线轴",
  syncKeepLocal: "同步后保留本地副本",
  syncRemoveLocal: "同步后删除本地副本",
  empty: "还没有线轴。添加你的第一卷。",
  status: "状态",
  weight: "当前重量（g）",
  tare: "皮重 / 空轴（g）",
  initial: "初始净重（g）",
  remaining: "剩余 %",
  location: "存放位置",
  notes: "备注（私密）",
  batch: "批次 / 批号",
  purchase: "购买日期",
  opened: "开封日期",
  archive: "归档",
  restore: "恢复",
  delete: "删除",
  duplicate: "为新卷复制",
  drying: "添加烘干记录",
  qr: "关联 QR 身份",
  rfid: "关联 RFID 身份",
  save: "保存线轴",
  syncNeverAuto: "登录不会上传本地线轴。你必须明确确认同步。",
  conflictPolicy: "冲突按同步版本采用 last-write-wins。重新导入会跳过较旧的重复项。",
  wizardLead:
    "从目录选择品牌和材料，然后选择产品和颜色。请先搜索；仅在确实缺失时使用“其他”。",
  catalogRequired: "保存前请从目录选择品牌、材料、产品和颜色。",
  existingRollWarn:
    "My Spools 中已有 {count} 卷此颜色。仅当这是另一卷实体线轴时再保存。",
  editSpool: "编辑线轴",
  cancel: "取消",
  showArchived: "显示已归档",
  usageLabel: "打印后使用量（克）",
  usagePlaceholder: "例如 42",
  usageSubmit: "扣除用量",
  usageAddSubmit: "添加克数",
  usageSaved: "已记录用量并更新剩余量。",
  usageError: "请输入正数克数。",
  usageNeedsWeights: "填写初始和当前重量后即可跟踪打印用量。",
};

export const accountZh = {
  heading: "账户",
  sessions: "活跃会话",
  revokeSession: "撤销",
  revokeOthers: "撤销其他会话",
  exportData: "导出我的数据",
  deleteAccount: "删除我的账户",
  deleteWarn:
    "这将永久删除私密线轴与会话。公开贡献可能会被匿名化而非删除。",
  deleteConfirmLabel: "输入 DELETE 以确认",
  privacyPrefs: "隐私偏好",
  register: "创建账户",
  logout: "退出登录",
};

export const legalPagesZh = {
  privacyTitle: "隐私政策",
  privacyMetaDescription: "OpenFilament 如何处理账户邮箱、Stripe 付款、My Spools 与 Cookie。",
  cookiesTitle: "Cookie 政策",
  termsTitle: "服务条款",
  termsMetaDescription:
    "OpenFilament 条款：按现状提供服务、Cloud 不退款、不自动续订、到期后 30 天 Cloud 导出窗口。",
  securityTitle: "安全",
  trustTitle: "Trust center",
  placeholderNotice: "本页含明确标注的运营方占位信息。在替换之前它们会阻止正式发布。",
  effective: "生效日期",
  operator: "运营方",
  privacyContact: "隐私联系人",
  hosting: "托管",
  contact: "联系",
  openSourceRepository: "开源仓库",
  cookieSettingsHint: "你可随时通过 Cookie 设置更改分析与偏好 Cookie。同意版本：",
  sections: {
    privacy: [
      {
        heading: "账户 — 我们存储什么",
        paragraphs: [
          "创建账户只需邮箱和密码。我们保存该邮箱，便于你登录、接收付款收据以及重置密码。我们不索取真实姓名；系统会自动生成内部用户名。密码以 scrypt 哈希存储 — 绝不以明文保存。",
          "我们不会将你的邮箱用于营销。账户恢复与必要的服务通知（例如付款或安全相关）才是预期用途。",
        ],
      },
      {
        heading: "付款（Stripe）",
        paragraphs: [
          "可选的 My Spools Cloud 购买通过 Stripe Checkout 完成。你在 Stripe 托管的付款页面输入银行卡或钱包信息。Stripe 是付款处理方：OpenFilament 从不接收或存储完整卡号、CVC 或同等钱包密钥。",
          "我们仅保留交付 Cloud 访问与记账所需的信息：金额、货币、付款状态、Stripe 会话/付款标识、时间戳以及你的 Cloud 权益期。Stripe 按自身条款与隐私政策处理付款数据。",
          "Cloud 访问为一次性预付期（当前为 12 个月）。除非你自行发起新的 Checkout，否则不会自动续订，也不会进行会话外扣款。",
        ],
      },
      {
        heading: "我们还处理什么",
        items: [
          "身份验证会话（httpOnly Cookie）与安全日志。",
          "仅在你明确同步到 Cloud 时，才处理 My Spools Cloud 库存、私密备注与 QR/RFID 身份。",
          "本地 My Spools 保留在浏览器中，直到你同步或导出 — 登录本身不会上传本地线轴。",
          "你选择发布的公开社区贡献（校准、目录提示）。",
          "同意偏好，以及注重隐私的 Google Analytics 4（除非你拒绝非必要 Cookie）。",
        ],
      },
      {
        heading: "法律依据",
        items: [
          "合同 / 所请求服务：账户、Cloud、导出与下载。",
          "合法利益：安全、防滥用与服务完整性。",
          "分析 Cookie/存储默认开启直至你拒绝 — 可随时在 Cookie 设置中关闭。",
          "法定义务：在必须保留安全或会计记录时。",
        ],
      },
      {
        heading: "My Spools",
        paragraphs: [
          "本地 My Spools 免费，并保留在你的设备上。清除网站数据、丢失设备或更换浏览器可能导致其被删除。",
          "My Spools Cloud 是可选的付费托管，用于库存同步与备份。公开 QR 解析不会暴露私密备注、位置或账户标识。",
        ],
      },
      {
        heading: "你的权利与保留",
        paragraphs: [
          "你可以请求访问、更正、删除、限制、可携带与反对，并撤回同意。请使用账户导出/删除、Cookie 设置，或发送邮件给隐私联系人。你也可向本站所列监管机构投诉。",
          "软删除的 Cloud 线轴会按计划清理。付款与安全记录在会计或防欺诈需要时可保留更久。备份可能在备份到期前仍保留已删除数据。",
        ],
      },
      {
        heading: "国际传输与变更",
        paragraphs: [
          "应用与数据库托管于我们的欧盟 VPS，如上所示。若你启用分析，Google 可能在其保障措施下在 EEA 以外处理分析数据。Stripe 可能在其运营地区处理付款数据。重大政策变更会更新同意版本，并可能再次征求同意。",
        ],
      },
    ],
    terms: [
      {
        heading: "按现状提供的社区服务",
        paragraphs: [
          "OpenFilament 按现状及可用情况提供。目录数据、入门配置文件与社区校准并非打印安全保证。你仍需在自己的打印机上验证设置，并对打印结果负责。",
          "在法律允许的范围内，我们不保证不间断可用、无错误运行或适用于特定用途。My Spools Cloud 以测试版提供。",
        ],
      },
      {
        heading: "账户与免费使用",
        paragraphs: [
          "浏览、搜索、配置文件下载与 My Spools Local 均为免费。账户（邮箱与密码）对免费使用为可选，仅在你购买 My Spools Cloud 时需要，以便我们关联库存并恢复访问。",
        ],
      },
      {
        heading: "My Spools Cloud — 付款、不续订、不退款",
        paragraphs: [
          "Cloud 为可选预付数字服务：当前为 €19.99 / 12 个月，通过 Stripe Checkout 一次性付款。不会自动续订，也不会进行会话外扣款。访问在付费期结束时终止，除非你自行发起新的 Checkout。",
          "所有 Cloud 购买均为最终交易：不退款、不因买家反悔发起拒付，也不对未使用月份提供部分退款。Stripe 处理付款；OpenFilament 不存储卡号。",
          "Cloud 仅增加跨设备线轴同步与服务器端库存/备份。不会在 Local 之外解锁额外的目录、配置文件或 RFID/QR 功能。",
        ],
      },
      {
        heading: "Cloud 到期后 — 30 天导出期",
        paragraphs: [
          "当 Cloud 期限结束时，我们会再保留你的 Cloud 库存 30 天。在这 30 天内你仍可导出 Cloud 数据（JSON）。到期后的同步与写入权限遵循产品规则（只读 / 导出窗口）。",
          "这 30 天过后，Cloud 库存可能从我们的服务器永久删除。浏览器中的本地 My Spools 不受影响，且仍可免费使用。付款与安全记录在会计或防欺诈需要时可保留更久。",
        ],
      },
      {
        heading: "贡献",
        paragraphs: [
          "提交校准时，你接受提交时显示的贡献条款，并按项目的开放条款授权该贡献用于公开展示。贡献者邮箱保持私密。",
        ],
      },
      {
        heading: "责任",
        paragraphs: [
          "在适用法律允许的范围内，OpenFilament 及其运营方不对因使用免费工具或测试版 Cloud 服务而产生的间接、附带或后果性损害承担责任。根据荷兰或欧盟法律不可放弃的强制性消费者权利不受影响。",
        ],
      },
    ],
    cookies: [
      {
        heading: "必要存储",
        paragraphs: [
          "站点运行所需：语言（of_locale）、同意选择（of_consent）、登录会话（of_session，httpOnly）、CSRF 保护（of_csrf），以及 IndexedDB 中的本地 My Spools 数据。Service worker / Cache Storage 可保持 PWA shell 可离线使用。这些不用于广告。",
        ],
      },
      {
        heading: "可选分析",
        paragraphs: [
          "我们默认加载注重隐私的 Google Analytics 4，它可能设置如 _ga 等第一方 Cookie。拒绝非必要 Cookie（或在 Cookie 设置中关闭分析）即可停止。搜索、My Spools、账户、QR、RFID 与下载仍可完整使用。不使用营销 Cookie。",
        ],
      },
      {
        heading: "更改你的选择",
        paragraphs: [
          "可随时从页脚或隐私政策页打开 Cookie 设置。更改选择会立即更新存储，并在撤回同意时关闭分析。",
        ],
      },
    ],
    security: [
      {
        heading: "我们保护什么",
        items: [
          "使用 scrypt 密码哈希的账户凭据。",
          "会话令牌在静态时哈希，并以 httpOnly Cookie 发送到浏览器。",
          "带有服务端所有权检查的私密 My Spools。",
          "省略备注、位置与账户标识的公开 QR 投影。",
          "银行卡数据由 Stripe 处理 — 不存储在 OpenFilament 服务器上。",
        ],
      },
      {
        heading: "负责任披露",
        paragraphs: [
          "请将漏洞私下报告给已配置的安全联系人。不要公开披露密钥、针对真实用户的漏洞利用或生产凭据。在公开讨论前请给予合理的修复时间。",
        ],
      },
    ],
  },
};

export const supportZh = {
  title: "支持",
  metaDescription: "OpenFilament 是什么、你可以做什么，以及免费 My Spools 与付费 Cloud 同步（测试版）有何不同。",
  lead: "运营方向用户的简要说明：本站用途，以及 My Spools Local 与 Cloud 如何运作 — 包括付费 Cloud 仍为测试版。",
  productHeading: "OpenFilament 是什么",
  productBody: "OpenFilament 是浏览器优先的耗材目录与校准中心。查找耗材数据，为切片软件下载起步或实测配置，用 QR 或 RFID 识别线轴，并用 My Spools 可选地管理库存 — 核心产品无需安装桌面应用。",
  productItems: [
    "搜索品牌、材料与颜色；将厂商温度范围作为可靠的初始设置。",
    "下载切片预设（有实测社区配置则用实测，否则用基于厂商数据的起步配置）。",
    "打印 QR 标签；若有兼容硬件，可使用 RFID 流程。",
    "贡献校准，帮助他人打印更好。",
    "可选账户用于 Cloud 库存同步 — 浏览与 Local My Spools 无需付费即可使用。",
  ],
  mySpoolsHeading: "My Spools — 免费与付费",
  mySpoolsLocalTitle: "My Spools Local（免费）",
  mySpoolsLocalBody: "本设备上的完整库存：备注、烘干、QR/RFID 关联、导入/导出。无需账户。数据保留在浏览器中 — 若清除网站数据或更换设备，请导出备份。",
  mySpoolsCloudTitle: "My Spools Cloud（付费，测试版）",
  mySpoolsCloudBody: "可选预付托管（€19.99 / 12 个月，经 Stripe 一次性付款，不自动续订）。需要账户（邮箱 + 密码），以便我们关联 Cloud 库存并恢复访问。",
  mySpoolsDiffItems: [
    "免费 Local：在一台浏览器/设备上提供完整库存工具。",
    "付费 Cloud：仅额外提供跨设备线轴同步，以及我们 VPS 上的服务端库存/备份。",
    "Cloud 不会解锁更好的配置、目录权限、RFID/QR 功能，或其他 Local 已有的库存工具。",
    "付费期结束后，我们保留 Cloud 数据 30 天以便你仍可导出；之后可能删除。Local My Spools 在无 Cloud 时仍可完整使用。",
  ],
  betaNote:
    "My Spools Cloud 处于测试版。在我们加固同步与计费期间，可能仍有粗糙之处。付费产品的目的保持狭窄：线轴同步与库存备份 — 仅此而已。购买为最终交易（不退款），且不会自动续订。",
  contactHeading: "联系",
  contactBody: "关于隐私、账单或 Cloud 测试版的问题：请发邮件给我们。Cookie 选择请使用隐私政策页上的 Cookie 设置。",
};
