/** Short, sortable, collision-safe id (timestamp prefix + random suffix). */
export function createId(): string {
  const time = Date.now().toString(36);
  const rand = crypto.getRandomValues(new Uint8Array(9)).reduce(
    (acc, b) => acc + b.toString(36).padStart(2, "0"),
    ""
  );
  return `${time}${rand}`;
}
