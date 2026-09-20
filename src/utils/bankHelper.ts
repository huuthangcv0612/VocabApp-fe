const VIETNAMESE_BANK_MAP: Record<string, string> = {
  '970407': 'Techcombank',
  '970415': 'VietinBank',
  '970436': 'Vietcombank',
  '970418': 'BIDV',
  '970422': 'MBBank',
  '970405': 'Agribank',
  '970423': 'TPBank',
  '970432': 'VPBank',
  '970403': 'Sacombank',
  '970437': 'HDBank',
  '970416': 'ACB',
  '970441': 'VIB',
  '970443': 'SHB',
  '970431': 'Eximbank',
  '970425': 'ABBANK',
  '970428': 'Nam A Bank',
  '970414': 'OceanBank',
  '970429': 'SCB',
  '970440': 'SeABank',
  '970400': 'Saigonbank',
  '970427': 'VietBank',
  '970433': 'BVBank (Bản Việt)',
  '970426': 'MSB',
  '970412': 'PVcomBank',
  '970406': 'DongA Bank',
  '970419': 'NCB',
  '970438': 'BaoViet Bank',
  '970448': 'OCB',
  '970449': 'LPBank (LienVietPostBank)',
  '970452': 'KienLongBank',
  '970430': 'PGBank',
  '970454': 'VietA Bank',
  '970421': 'VRB',
  '970457': 'Wooribank',
  '970458': 'Shinhan Bank',
  '970468': 'Cake by VPBank',
  '971005': 'Timo',
  '971011': 'ViettelMoney',
  '971000': 'VNPT Money',
}

export const getBankDisplayName = (bankInput?: unknown): string => {
  if (!bankInput) return 'Techcombank'
  let strInput = String(bankInput).trim()
  if (!strInput) return 'Techcombank'

  // If input matches a known BIN code
  if (VIETNAMESE_BANK_MAP[strInput]) {
    return VIETNAMESE_BANK_MAP[strInput]
  }

  // Check if input contains a BIN code
  for (const [bin, name] of Object.entries(VIETNAMESE_BANK_MAP)) {
    if (strInput.includes(bin)) {
      return name
    }
  }

  // Strip parentheses and digits if present
  strInput = strInput.replace(/\s*\(\d+\)\s*/g, '').trim()

  return strInput
}
