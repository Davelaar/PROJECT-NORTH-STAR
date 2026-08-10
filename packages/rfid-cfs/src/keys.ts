/**
 * Community-documented Creality CFS AES-128 keys.
 * Sources: talyguryn/rfid-tool-for-spool-tags, deusrex2k Proxmark CFS helper,
 * flamebarke/creality_rfid (verified vectors). Not affiliated with Creality.
 */

/** Data key (d_key) — encrypts/decrypts the 48-byte payload (AES-128-ECB). */
export const CFS_DATA_KEY_HEX = "484043466B526E7A404B4174424A7032";

/** UID key (u_key) — derives MIFARE Sector 1 Key A from tag UID. */
export const CFS_UID_KEY_HEX = "713362755e74316e71665a2870662431";

/** ASCII forms of the same keys (public reverse-engineering docs). */
export const CFS_DATA_KEY_ASCII = "H@CFkRnz@KAtBJp2";
export const CFS_UID_KEY_ASCII = "q3bu^t1nqfZ(pf$1";

export const CFS_PAYLOAD_LENGTH = 48;
export const CFS_BLOCK_SIZE = 16;
export const CFS_SECTOR = 1;
export const CFS_DATA_BLOCKS = [4, 5, 6] as const;
export const CFS_TRAILER_BLOCK = 7;
export const CFS_ACCESS_BYTES_HEX = "ff078069";
export const CFS_DEFAULT_KEY_B_HEX = "ffffffffffff";
