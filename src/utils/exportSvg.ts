import fontUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';

const SIZE = 600;
const PNG_SCALE = 3; // 1800×1800 for high-res PNG

let fontBase64Cache: string | null = null;

async function getFontBase64(): Promise<string> {
  if (fontBase64Cache) return fontBase64Cache;
  const response = await fetch(fontUrl);
  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.readAsDataURL(blob);
  });
  fontBase64Cache = base64;
  return base64;
}

async function prepareStandaloneSvg(
  svgElement: SVGSVGElement,
): Promise<SVGSVGElement> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  clone.setAttribute('width', String(SIZE));
  clone.setAttribute('height', String(SIZE));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  clone.removeAttribute('class');
  clone.removeAttribute('role');
  clone.removeAttribute('aria-label');
  clone.removeAttribute('focusable');

  try {
    const base64 = await getFontBase64();
    const style = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style',
    );
    style.textContent = `
      @font-face {
        font-family: 'JetBrains Mono Variable';
        src: url(data:font/woff2;base64,${base64}) format('woff2');
        font-weight: 100 800;
      }
      text, tspan {
        font-family: 'JetBrains Mono Variable', monospace;
      }
    `;
    const fontDefs = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'defs',
    );
    fontDefs.appendChild(style);
    clone.insertBefore(fontDefs, clone.firstChild);
  } catch {
    // Font embedding failed — SVG will use system fallback
  }

  return clone;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportSvg(
  svgElement: SVGSVGElement,
  ownerName: string,
): Promise<void> {
  const clone = await prepareStandaloneSvg(svgElement);
  const svgString = new XMLSerializer().serializeToString(clone);
  const output = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
  const blob = new Blob([output], { type: 'image/svg+xml' });
  download(blob, `jardin-radial-${slugify(ownerName)}.svg`);
}

export async function exportPng(
  svgElement: SVGSVGElement,
  ownerName: string,
): Promise<void> {
  const clone = await prepareStandaloneSvg(svgElement);
  clone.setAttribute('width', String(SIZE * PNG_SCALE));
  clone.setAttribute('height', String(SIZE * PNG_SCALE));

  const svgString = new XMLSerializer().serializeToString(clone);
  // Use a data URI so the embedded font is resolved in the same context
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  const img = new Image();
  img.width = SIZE * PNG_SCALE;
  img.height = SIZE * PNG_SCALE;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE * PNG_SCALE;
      canvas.height = SIZE * PNG_SCALE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          download(blob, `jardin-radial-${slugify(ownerName)}.png`);
        }
        resolve();
      }, 'image/png');
    };
    img.onerror = () => {
      reject(new Error('Failed to render SVG to image'));
    };
    img.src = svgDataUrl;
  });
}
