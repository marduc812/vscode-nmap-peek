import React from "react";

const FPView = (props: { fp: string }) => {

  const fptext = props.fp.split(":", 2)[1] + props.fp.substring(props.fp.indexOf(":") + 1);


  return (
    <div className="flex flex-col ml-5 mb-5">
      <h4 className="text-white font-bold">Fingerprinting</h4>
      <div className="overflow-auto h-40 bg-gray-800 m-2 border rounded-md border-gray-700 max-w-full scripts-scrollbar">
        <div className="w-full">
          <p className="text-gray-300 ml-2">{sanitizeAndFormat(fptext)}</p>
        </div>
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
