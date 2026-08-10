UPDATE rfid_schemes
SET
  encoding_version = 'ndef-cbor-v1',
  notes = 'OpenPrintTag (ISO 15693 + NDEF application/vnd.openprinttag + CBOR). UUID/field mapping and NDEF/CBOR encode ship in software; physical writes depend on browser and tag support. Spec: https://specs.openprinttag.org/ Catalog: https://openfilamentdatabase.org — see docs/OPENPRINTTAG.md. Not CFS.'
WHERE uuid = '88888888-8888-4888-8888-888888888802';
