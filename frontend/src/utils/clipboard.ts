/**
 * Copy the given text to clipboard.
 * Tries the modern Clipboard API first; on failure, falls back to execCommand.
 * Returns true if the text was successfully copied.
 */
export async function copyText(text: string): Promise<boolean> {
  // Try Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to fallback
    }
  }

  // Fallback to textarea + execCommand
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }
  document.body.removeChild(textarea);
  return success;
}
