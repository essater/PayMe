// src/utils/validators.js

// E-posta formatı kontrolü
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Şifre gücü kontrolü: En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermeli
export function isStrongPassword(password) {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  return strongRegex.test(password);
}

// Boşluk ya da boş değer kontrolü
export function isNotEmpty(value) {
  return value && value.trim().length > 0;
}

// Geçerli isim kontrolü (Türkçe karakterlere ve boşluklara izin verir)
export function isValidName(name) {
  return /^[A-Za-zÇĞİÖŞÜçğıöşü\s'-]+$/.test(name);
}

// Doğum tarihi kontrolü (GG.AA.YYYY formatında, geçerli tarih olmalı)
export function isValidBirthDate(birthStr) {
  const regex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!regex.test(birthStr)) return false;

  const [day, month, year] = birthStr.split('.').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
