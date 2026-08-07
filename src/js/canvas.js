/**
 * HTML5 Canvas Quote Card Renderer
 * Handles real-time image composition, typography wrapping, profile clipping, and export.
 */

export class CanvasRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Default Canvas Size (1080 x 1080)
    this.width = 1080;
    this.height = 1080;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Cache loaded HTMLImageElement objects
    this.bgImageObj = null;
    this.speakerImageObj = null;

    // State parameters
    this.state = {
      quoteText: '너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요 (마태복음 5:14)',
      speakerName: '예수 그리스도',
      speakerTitle: '마태복음 5장 14절',
      fontFamily: "'Noto Serif KR', serif",
      fontSize: 38,
      textColor: '#ffffff',
      alignment: 'center', // 'left' | 'center' | 'right'
      hasShadow: true,
      hasStroke: false,
      overlayOpacity: 0.45,
      showSpeaker: true,
      speakerShape: 'circle', // 'circle' | 'square' | 'ring'
      speakerSize: 130,
      speakerPosY: 26, // Percentage from top
      aspectRatio: '1:1', // '1:1' | '4:5'
      bgUrl: '',
      speakerUrl: ''
    };
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState };
  }

  async loadImages(bgUrl, speakerUrl) {
    const promises = [];

    if (bgUrl && bgUrl !== this.state.bgUrl) {
      this.state.bgUrl = bgUrl;
      promises.push(this.loadImage(bgUrl).then(img => { this.bgImageObj = img; }));
    }

    if (speakerUrl && speakerUrl !== this.state.speakerUrl) {
      this.state.speakerUrl = speakerUrl;
      promises.push(this.loadImage(speakerUrl).then(img => { this.speakerImageObj = img; }));
    }

    await Promise.allSettled(promises);
  }

  loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn('Failed to load image cross-origin:', url);
        // Fallback placeholder image
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23334155"/><text x="50%" y="50%" font-size="20" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">QuoteCard Studio</text></svg>';
      };
      img.src = url;
    });
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background Image (Aspect Cover)
    if (this.bgImageObj) {
      this.drawCoverImage(ctx, this.bgImageObj, 0, 0, w, h);
    } else {
      // Default Gradient Background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Draw Dark Overlay for Text Legibility
    if (this.state.overlayOpacity > 0) {
      ctx.fillStyle = `rgba(15, 23, 42, ${this.state.overlayOpacity})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 3. Draw Speaker (Person) Profile Image if Enabled
    let textStartY = h * 0.45;

    if (this.state.showSpeaker && this.speakerImageObj) {
      const speakerSize = this.state.speakerSize * 1.5; // Scale for HD canvas
      const cx = w / 2;
      const cy = (h * (this.state.speakerPosY / 100));

      this.drawSpeakerProfile(ctx, this.speakerImageObj, cx, cy, speakerSize, this.state.speakerShape);

      // Adjust text position under speaker image if Y is top-aligned
      if (this.state.speakerPosY < 40) {
        textStartY = cy + (speakerSize / 2) + 60;
      }
    }

    // 4. Draw Decorative Opening Quote Icon
    this.drawQuoteMark(ctx, w / 2, textStartY - 40);

    // 5. Draw Main Quote Text
    ctx.save();
    ctx.fillStyle = this.state.textColor;
    ctx.textAlign = this.state.alignment;
    ctx.textBaseline = 'top';

    const fontSizePx = this.state.fontSize * 1.25; // HD canvas scaling factor
    ctx.font = `600 ${fontSizePx}px ${this.state.fontFamily}`;

    // Apply Shadow / Stroke
    if (this.state.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
    } else {
      ctx.shadowColor = 'transparent';
    }

    if (this.state.hasStroke) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
    }

    const maxWidth = w * 0.82;
    const lines = this.getWrappedLines(ctx, this.state.quoteText, maxWidth);
    const lineHeight = fontSizePx * 1.45;

    let startX = w / 2;
    if (this.state.alignment === 'left') startX = w * 0.09;
    if (this.state.alignment === 'right') startX = w * 0.91;

    let currentY = textStartY;
    lines.forEach(line => {
      if (this.state.hasStroke) ctx.strokeText(line, startX, currentY);
      ctx.fillText(line, startX, currentY);
      currentY += lineHeight;
    });

    // 6. Draw Speaker Name & Title
    if (this.state.speakerName || this.state.speakerTitle) {
      currentY += 40;

      // Decorative divider line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      if (this.state.alignment === 'center') {
        ctx.moveTo(w / 2 - 40, currentY);
        ctx.lineTo(w / 2 + 40, currentY);
      } else if (this.state.alignment === 'left') {
        ctx.moveTo(startX, currentY);
        ctx.lineTo(startX + 80, currentY);
      } else {
        ctx.moveTo(startX - 80, currentY);
        ctx.lineTo(startX, currentY);
      }
      ctx.stroke();

      currentY += 30;

      // Speaker Name
      if (this.state.speakerName) {
        ctx.font = `700 ${fontSizePx * 0.65}px ${this.state.fontFamily}`;
        if (this.state.hasStroke) ctx.strokeText(this.state.speakerName, startX, currentY);
        ctx.fillText(this.state.speakerName, startX, currentY);
        currentY += (fontSizePx * 0.7) + 8;
      }

      // Speaker Title
      if (this.state.speakerTitle) {
        ctx.font = `400 ${fontSizePx * 0.5}px ${this.state.fontFamily}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(this.state.speakerTitle, startX, currentY);
      }
    }

    ctx.restore();
  }

  drawCoverImage(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let renderW, renderH, renderX, renderY;

    if (imgRatio > canvasRatio) {
      renderH = h;
      renderW = h * imgRatio;
      renderX = x - (renderW - w) / 2;
      renderY = y;
    } else {
      renderW = w;
      renderH = w / imgRatio;
      renderX = x;
      renderY = y - (renderH - h) / 2;
    }
    ctx.drawImage(img, renderX, renderY, renderW, renderH);
  }

  drawSpeakerProfile(ctx, img, cx, cy, size, shape) {
    ctx.save();

    const r = size / 2;

    if (shape === 'circle' || shape === 'ring') {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, cx - r, cy - r, size, size);
      ctx.restore();

      // Draw Ring Border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.lineWidth = shape === 'ring' ? 8 : 4;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    } else {
      // Square / Rounded
      const rectX = cx - r;
      const rectY = cy - r;
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, size, size, 20);
      ctx.clip();
      ctx.drawImage(img, rectX, rectY, size, size);
      ctx.restore();

      // Border
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(rectX - 2, rectY - 2, size + 4, size + 4, 22);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }
  }

  drawQuoteMark(ctx, cx, cy) {
    ctx.save();
    ctx.font = '700 48px Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('“', cx, cy);
    ctx.restore();
  }

  getWrappedLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  downloadImage(format = 'png') {
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const filename = `quote-card.${format}`;
    const dataUrl = this.canvas.toDataURL(mimeType, 0.95);

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  async copyToClipboard() {
    try {
      this.canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
      });
      return true;
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      return false;
    }
  }
}
