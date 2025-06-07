

export function capitalizeTR(str) {
  if (!str || typeof str !== 'string') return '';
  
  const lower = str.toLocaleLowerCase('tr-TR');
  const first = lower.charAt(0).toLocaleUpperCase('tr-TR');
  return first + lower.slice(1);
}

export function capitalizeFullNameTR(fullName) {
  return fullName
    .split(' ')
    .map(word => capitalizeTR(word))
    .join(' ');
}