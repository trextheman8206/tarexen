/**
 * Lee una variable de entorno limpiando lo que suele colarse al pegarla en un panel
 * de hosting: espacios, saltos de línea y comillas o paréntesis envolventes.
 */
export function envValue(name: string): string | undefined {
  let v = process.env[name]?.trim();
  if (!v) return undefined;
  const wrapped = /^(["'(])([\s\S]*)(["')])$/.exec(v);
  if (wrapped && (wrapped[1] === wrapped[3] || (wrapped[1] === "(" && wrapped[3] === ")"))) {
    v = wrapped[2].trim();
  }
  return v || undefined;
}
