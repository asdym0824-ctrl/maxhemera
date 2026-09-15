export function formatToman(amount: number): string {
  if (amount >= 1_000_000_000) {
    const b = (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `${Number(b).toLocaleString('fa-IR')} میلیارد تومان`;
  }
  if (amount >= 1_000_000) {
    const m = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${Number(m).toLocaleString('fa-IR')} میلیون تومان`;
  }
  if (amount >= 1_000) {
    const k = (amount / 1_000).toFixed(0);
    return `${Number(k).toLocaleString('fa-IR')} هزار تومان`;
  }
  return `${amount.toLocaleString('fa-IR')} تومان`;
}

export function formatPriceWithSeparators(amount: number): string {
  return `${amount.toLocaleString('fa-IR')} تومان`;
}
