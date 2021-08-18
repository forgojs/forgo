export default function html(prerendered?: string) {
  return `
  <!DOCTYPE HTML>
  <html lang="en">
    <head>
      <title>Zerok Test</title>
    </head>
    <body>
      <div id="root">${prerendered || ""}</div>
    </body>
  </html>
  `;
}
