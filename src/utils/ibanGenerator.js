// src/utils/ibanGenerator.js

// ➊ Rastgele 5 haneli banka/şube kodu (10000–99999 arası)
function generateRandomBranchCode() {
  return Math.floor(Math.random() * 90000 + 10000)
    .toString()
    .padStart(5, "0");
}

// ➋ Rastgele 1 haneli “banka içi kod” (0–9 arası)
function generateRandomBankInternalCode() {
  return Math.floor(Math.random() * 10).toString();
}

// ➌ Rastgele 16 haneli hesap numarası
function generateRandomAccountNumber() {
  let num = "";
  for (let i = 0; i < 16; i++) {
    num += Math.floor(Math.random() * 10).toString();
  }
  return num;
}

// ➍ Bir harfi sayısal karşılığa dönüştürür: A=10, B=11, … Z=35
function letterToNumber(ch) {
  return ch.charCodeAt(0) - 55; // 'A'.charCodeAt=65 → 65-55=10
}

// ➎ Harfleri sayıya (A→10 vs.), rakamları direkt bırakır; mod 97 için numeric string döner
function convertToNumericString(str) {
  let result = "";
  for (let char of str) {
    if (/[A-Z]/.test(char)) {
      result += letterToNumber(char);
    } else {
      result += char;
    }
  }
  return result;
}

// ➏ Türkiye IBAN kontrol rakamını hesaplar
function calculateIbanCheckDigits(countryCode, bban) {
  const moved = bban + countryCode + "00";
  const numericString = convertToNumericString(moved);
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const part = remainder + numericString.substring(i, i + 7);
    remainder = parseInt(part, 10) % 97;
  }
  const checkDigits = (98 - remainder).toString().padStart(2, "0");
  return checkDigits;
}

// ➐ Raw (boşluksuz) bir Türkiye IBAN oluşturur
function getRawIban() {
  const countryCode = "TR";
  const branchCode = generateRandomBranchCode();           // 5 hane
  const bankInternal = generateRandomBankInternalCode();   // 1 hane
  const accountNum = generateRandomAccountNumber();        // 16 hane
  const bban = branchCode + bankInternal + accountNum;     // 22 hane (TR hariç)

  const checkDigits = calculateIbanCheckDigits(countryCode, bban);
  return countryCode + checkDigits + bban;                  // 26 hane, örn: "TR478278690407764450974731"
}

// ➑ Raw IBAN'ı alıp “TR-2-2-4-4-4-4-4-2” formatına çevirir
export function formatTurkishIban(rawIban) {
  const iban = rawIban.replace(/\s+/g, "").toUpperCase();
  if (iban.length !== 26 || !iban.startsWith("TR")) {
    return rawIban;
  }
  const lengths = [4, 4, 4, 4, 4, 2];
  let idx = 0;
  const parts = [];

  for (let len of lengths) {
    parts.push(iban.substr(idx, len));
    idx += len;
  }
  return parts.join(" ");
}

/**
 * ➒ Bu fonksiyon çağrıldığında hem raw IBAN (boşluksuz) hem de
 *     formatlı IBAN (gruplandırılmış) dönen bir obje verir.
 */
export function generateRandomTurkishIban() {
  const rawIban = getRawIban();
  const formattedIban = formatTurkishIban(rawIban);
  return { raw: rawIban, formatted: formattedIban };
}
