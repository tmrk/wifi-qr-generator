// Export helpers. PDF and DOCX libraries are loaded on demand.

const serialize = (svg) => new XMLSerializer().serializeToString(svg);

const withXmlHeader = (svg, sep) => {
  const s = serialize(svg);
  return s.startsWith('<?xml') ? s : `<?xml version="1.0" standalone="no"?>${sep}${s}`;
};

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const loadSvgImage = (svg, sep) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(withXmlHeader(svg, sep));
  });

const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png')
  );

// White-background PNG. Without a size it uses the SVG's own size.
export const svgToPngBlob = async (svg, size) => {
  const image = await loadSvgImage(svg, '\r\n');
  const canvas = document.createElement('canvas');
  canvas.width = size || image.width;
  canvas.height = size || image.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas);
};

export const downloadSVG = async (svg) => {
  saveBlob(new Blob([serialize(svg)], { type: 'image/svg+xml' }), 'wifi-qr.svg');
};

export const downloadPNG = async (svg) => {
  saveBlob(await svgToPngBlob(svg), 'wifi-qr.png');
};

export const downloadDOCX = async (svg, { ssid, password, hasPassword }) => {
  const { Document, Packer, Paragraph, TextRun, ImageRun } = await import('docx');
  const png = await svgToPngBlob(svg, 512);
  const data = new Uint8Array(await png.arrayBuffer());
  const line = (text) => new Paragraph({ children: [new TextRun({ text, bold: true })] });
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          line(`SSID: ${ssid}`),
          ...(hasPassword ? [line(`Password: ${password}`)] : []),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [new ImageRun({ data, transformation: { width: 512, height: 512 }, type: 'png' })],
          }),
        ],
      },
    ],
  });
  saveBlob(await Packer.toBlob(doc), 'wifi-qr.docx');
};

export const downloadPDF = async (svg, { ssid, password, hasPassword, labels }) => {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  // svg2pdf embeds the SVG as vector graphics.
  await svg2pdf(svg, pdf, { x: 40, y: 100, width: 256, height: 256 });
  pdf.setFontSize(16);
  pdf.text(`${labels.networkName}: ${ssid}`, 40, 40);
  if (hasPassword) pdf.text(`${labels.password}: ${password}`, 40, 70);
  pdf.save('wifi-qr.pdf');
};

export const EXPORTERS = {
  svg: downloadSVG,
  png: downloadPNG,
  docx: downloadDOCX,
  pdf: downloadPDF,
};

// Share the PNG through the Web Share API. Returns false if unsupported.
export const canShareFiles = () => {
  try {
    if (!navigator.share || !navigator.canShare) return false;
    return navigator.canShare({ files: [new File([''], 'wifi-qr.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
};

export const sharePNG = async (svg, title) => {
  const blob = await svgToPngBlob(svg);
  await navigator.share({ files: [new File([blob], 'wifi-qr.png', { type: 'image/png' })], title });
};
