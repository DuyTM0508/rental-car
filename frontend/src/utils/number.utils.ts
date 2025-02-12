export function formatCurrency(num) {
  return num?.toLocaleString("it-IT", { style: "currency", currency: "VND" });
}
