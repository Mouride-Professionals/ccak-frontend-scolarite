const fcfaFormatter = new Intl.NumberFormat("fr-SN", {
  style: "currency",
  currency: "XOF",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatFCFA(value: number | null | undefined): string {
  if (value == null) return "—";
  return fcfaFormatter.format(value);
}

export function formatPhone(value: string | null | undefined): string {
  if (!value) return "—";
  const d = value.replace(/\D/g, "");
  const local = d.startsWith("221") && d.length === 12 ? d.slice(3) : d;
  if (local.length === 9)
    return `+221 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
  return value;
}

export function parsePhone(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\s/g, ""); // "+221 78 120 14 55" → "+221781201455"
}

// Formats a partial or full phone value as the user leaves an input field.
// Handles any messy input: "781201455", "+221781201455", "+221 78 120 14 55".
// Returns "" when no local digits are present (field was left empty/prefix-only).
export function formatPhoneInput(value: string): string {
  const d = value.replace(/\D/g, "");
  const local = d.startsWith("221") ? d.slice(3) : d;
  if (!local) return "";
  const l = local.slice(0, 9);
  let result = `+221 ${l.slice(0, 2)}`;
  if (l.length > 2) result += ` ${l.slice(2, 5)}`;
  if (l.length > 5) result += ` ${l.slice(5, 7)}`;
  if (l.length > 7) result += ` ${l.slice(7, 9)}`;
  return result;
}
