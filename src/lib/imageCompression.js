/**
 * imageCompression.js — Comprime imagens no navegador antes do upload,
 * usando Canvas (sem nenhuma biblioteca externa). Reduz o tamanho do
 * arquivo bastante sem perda visível de qualidade — importante porque
 * fotos direto do celular costumam vir enormes (5-10MB) e deixam o
 * site lento pra carregar pros clientes.
 */

const MAX_DIMENSION = 1600; // px — dimensão máxima (largura ou altura)
const JPEG_QUALITY = 0.82; // 0 a 1 — 0.82 é um bom equilíbrio qualidade/tamanho

/**
 * compressImage — recebe um File de imagem e devolve um Blob comprimido
 * em JPEG, redimensionado se for maior que MAX_DIMENSION.
 * Se o arquivo não for uma imagem, ou a compressão falhar por algum
 * motivo, devolve o arquivo original (nunca quebra o upload por causa disso).
 */
export async function compressImage(file) {
  if (!file.type.startsWith('image/')) return file;

  try {
    const imageBitmap = await createImageBitmap(file);

    let { width, height } = imageBitmap;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );

    if (!blob) return file;

    // Se por algum motivo a "compressão" saiu maior que o original
    // (raro, mas pode acontecer com imagens já muito otimizadas),
    // fica com o arquivo original.
    if (blob.size >= file.size) return file;

    return blob;
  } catch (err) {
    console.warn('Não foi possível comprimir a imagem, enviando original:', err);
    return file;
  }
}
