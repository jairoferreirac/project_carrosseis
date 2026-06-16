import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportNodeAsPng(node: HTMLElement, filename: string) {
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}

export async function exportNodesAsPdf(nodes: HTMLElement[], filename: string) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [900, 900] });

  for (const [index, node] of nodes.entries()) {
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
    if (index > 0) pdf.addPage([900, 900], 'portrait');
    pdf.addImage(dataUrl, 'PNG', 0, 0, 900, 900);
  }

  pdf.save(filename);
}
