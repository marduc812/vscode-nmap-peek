import React from "react";

const FPView = (props: { fp: string }) => {

  const fptext = props.fp.split(":", 2)[1] + props.fp.substring(props.fp.indexOf(":") + 1);

  return (
    <div className="my-2 ml-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fingerprint</h4>
      <div className="overflow-auto max-h-48 bg-[#0f1117] rounded-md border border-[rgba(255,255,255,0.06)] scripts-scrollbar p-2">
        <p className="text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">{sanitizeAndFormat(fptext)}</p>
      </div>
    </div>
  );
};

const sanitizeAndFormat = (input: string): string => {

  const decodeXML = (text: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.documentElement.textContent || "";
  };

  const decoded = decodeXML(input);

  // Escape HTML to prevent XSS
  const escapeHTML = (text: string): string =>
    text.replace(/[&<>"']/g, (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char)
    );

  const sanitized = escapeHTML(decoded);

  // Replace % with new lines for readability
  let formatted = sanitized.replace(/%/g, "\n");

  // Replace escaped spaces (\x20) with actual spaces
  formatted = formatted.replace(/\\x20/g, " ");

  // Ensure proper line breaks around common delimiters like `\r\n`
  formatted = formatted.replace(/\\r\\n/g, "\n");

  return formatted;
};

export default FPView;
