// src/utils/cardGenerators.js

/** 16 haneli (gruplar halinde 4’erli) basit bir kart numarası üretir */
export function generateRandomCardNumber() {
  // 16 haneli sayıyı gruplar halinde “1234 5678 9012 3456” formatında döndürüyoruz
  let digits = "";
  for (let i = 0; i < 16; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  // 4’erli bloklara ayırıp birleştir
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}
export function generateExpiryDateFromNowPlusFiveYears() {
  const now = new Date();
  const expYear = now.getFullYear() + 5;
  const expMonth = now.getMonth() + 1; // getMonth(): 0–11 arası, bu yüzden +1
  const monthString = expMonth.toString().padStart(2, "0");
  const yearString  = expYear.toString(); // Örn: "2030"
  return { month: monthString, year: yearString };
}

/** 3 haneli rastgele CVV üret */
export function generateRandomCvv() {
  const cvv = Math.floor(Math.random() * 900) + 100; 
  return cvv.toString();
}
