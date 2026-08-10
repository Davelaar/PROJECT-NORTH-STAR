/**
 * Browser capability detection for progressive enhancement.
 * Prefer feature detection over user-agent sniffing.
 */

export type BrowserCapabilities = {
  pwaInstall: boolean;
  camera: boolean;
  webUsb: boolean;
  webSerial: boolean;
  webHid: boolean;
  webNfc: boolean;
  fileSystemAccess: boolean;
  download: boolean;
  print: boolean;
};

export function detectBrowserCapabilities(
  globalObj: typeof globalThis = globalThis,
): BrowserCapabilities {
  const nav = (globalObj as { navigator?: Navigator }).navigator;
  const win = globalObj as Window & typeof globalThis;

  const hasWindow = typeof win !== "undefined" && typeof (win as Window).document !== "undefined";

  return {
    pwaInstall: Boolean(
      hasWindow &&
        (("BeforeInstallPromptEvent" in win) || (nav && "standalone" in nav)),
    ),
    camera: Boolean(nav?.mediaDevices?.getUserMedia),
    webUsb: Boolean(nav && "usb" in nav),
    webSerial: Boolean(nav && "serial" in nav),
    webHid: Boolean(nav && "hid" in nav),
    webNfc: Boolean(nav && "NDEFReader" in win),
    fileSystemAccess: Boolean(
      hasWindow && "showDirectoryPicker" in win && "showSaveFilePicker" in win,
    ),
    download: hasWindow,
    print: Boolean(hasWindow && typeof win.print === "function"),
  };
}

export type CapabilityAction =
  | "download_profile"
  | "save_to_slicer_folder"
  | "print_qr"
  | "scan_qr_camera"
  | "enter_qr_code"
  | "rfid_webusb"
  | "rfid_webserial"
  | "rfid_planned"
  | "manual_identify";

export function availableIdentificationActions(
  caps: BrowserCapabilities,
): CapabilityAction[] {
  const actions: CapabilityAction[] = ["print_qr", "manual_identify", "enter_qr_code"];
  if (caps.camera) actions.push("scan_qr_camera");
  if (caps.webUsb) actions.push("rfid_webusb");
  else if (caps.webSerial) actions.push("rfid_webserial");
  else actions.push("rfid_planned");
  return actions;
}

export function slicerSaveMode(
  caps: BrowserCapabilities,
): "save_to_folder" | "download_only" {
  return caps.fileSystemAccess ? "save_to_folder" : "download_only";
}
