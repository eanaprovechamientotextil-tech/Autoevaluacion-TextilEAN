function getDateSegment(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getRandomAlphanumeric(length: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(randomValues)
    .map((value) => alphabet[value % alphabet.length])
    .join("");
}

export function generateRequestNumber(date = new Date()): string {
  const dateSegment = getDateSegment(date);
  const randomSegment = getRandomAlphanumeric(6);

  return `SOL-${dateSegment}-${randomSegment}`;
}
