export default function html(prerenderd?: string) {
  return `
  <!DOCTYPE HTML>
  <html lang="en">
    <head>
      <title>Zerok Test</title>
    </head>
    <body>
      <div id="root">${prerenderd || ""}
      </div>
    </body>
  </html>
  `;
}
