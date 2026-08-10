export {
  OPT_NS,
  uuidv5Parts,
  deriveBrandUuid,
  deriveMaterialUuid,
  derivePackageUuid,
  deriveInstanceUuid,
} from "./uuid.js";
export {
  mapCatalogToOpenPrintTagMain,
  type OpenPrintTagMainFields,
} from "./map.js";
export {
  OPENPRINTTAG_MIME,
  buildOpenPrintTagNdefRecord,
  encodeOpenPrintTagNdef,
  encodeOpenPrintTagPayload,
} from "./encode.js";
