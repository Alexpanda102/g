function openUrlLegacy(url) {
	 // open new about:blank window
      var win = window.open();
      if (!win) {
        alert("y did u block popups lil vro");
        return;
      }

      // inject iframe into new window
      var iframe = win.document.createElement('iframe');
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.src = url;
      win.document.body.style.margin = "0";
      win.document.body.appendChild(iframe);


function ensureScheme(url) {
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) return url;
      if (/^\/\//.test(url)) return url;
      return 'https://' + url;
}
	
	function getTabName(url) {
  try {
    const u = new URL(url);
    let path = u.pathname;

    if (path === "/" || path === "") {
      return u.hostname; // example.com
    }

    // remove trailing slash
    if (path.endsWith("/")) path = path.slice(0, -1);

    const parts = path.split("/");
    return parts[parts.length - 1] || u.hostname;
  } catch {
    return "New Tab";
  }
}

function getFavicon(url) {
  try {
    const u = new URL(url);
    return u.origin + "/favicon.ico";
  } catch {
    return "";
  }
}

function openUrl(url) {

  var win = window.open();
  if (!win) {
    alert("y did u block popups lil vro");
    return;
  }

  const tabName = getTabName(url);
  const favicon = getFavicon(url);

  // build new page
  win.document.write(`
    <!doctype html>
    <html>
    <head>
      <title>${tabName}</title>
      <link rel="icon" href="${favicon}">
      <style>
        html, body {
          margin: 0;
          height: 100%;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <iframe src="${url}"></iframe>
    </body>
    </html>
  `);

  win.document.close();
}}
