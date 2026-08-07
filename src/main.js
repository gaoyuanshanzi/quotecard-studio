/**
 * Main Application Orchestrator
 * Connects Auth, Storage, Image Search, and HTML5 Canvas Engine.
 */

import { AuthManager } from './js/auth.js';
import { StorageManager } from './js/storage.js';
import { ApiService } from './js/api.js';
import { ImageManager } from './js/imageManager.js';
import { CanvasRenderer } from './js/canvas.js';

class App {
  constructor() {
    this.exportFormat = 'png'; // 'png' | 'jpg'
    this.init();
  }

  init() {
    // 1. Initialize Auth Gate
    this.authManager = new AuthManager(() => this.onAuthenticated());
  }

  onAuthenticated() {
    // Initialize Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // 2. Initialize Canvas Engine
    this.canvasRenderer = new CanvasRenderer('quoteCanvas');

    // 3. Initialize API Service & Storage
    this.apiService = new ApiService(() => StorageManager.getApiKeys());

    // 4. Initialize Image Manager
    this.imageManager = new ImageManager(this.apiService, (selection) => {
      this.handleImageSelected(selection);
    });

    // 5. Restore Saved API Keys
    this.restoreApiKeys();

    // 6. Bind DOM Controls & Realtime Event Listeners
    this.bindDomEvents();

    // 7. Initial Canvas Render
    this.syncCanvasWithControls();
  }

  restoreApiKeys() {
    const keys = StorageManager.getApiKeys();
    const gKey = document.getElementById('googleApiKey');
    const gCx = document.getElementById('googleCx');
    const uKey = document.getElementById('unsplashAccessKey');
    const pKey = document.getElementById('pixabayApiKey');
    const badge = document.getElementById('apiStatusBadge');

    if (gKey) gKey.value = keys.googleApiKey || '';
    if (gCx) gCx.value = keys.googleCx || '';
    if (uKey) uKey.value = keys.unsplashAccessKey || '';
    if (pKey) pKey.value = keys.pixabayApiKey || '';

    const activeCount = [keys.googleApiKey, keys.unsplashAccessKey, keys.pixabayApiKey].filter(Boolean).length;
    if (badge) {
      if (activeCount > 0) {
        badge.textContent = `API Key ${activeCount}개 활성`;
        badge.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700';
      } else {
        badge.textContent = '샘플/무료 모드';
        badge.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600';
      }
    }
  }

  bindDomEvents() {
    // 1. Quote Textarea & Character Count
    const quoteTextarea = document.getElementById('quoteText');
    const charCounter = document.getElementById('charCounter');
    const speakerNameInput = document.getElementById('speakerName');
    const speakerTitleInput = document.getElementById('speakerTitle');

    const updateText = () => {
      const len = quoteTextarea.value.length;
      if (charCounter) charCounter.textContent = `${len} / 100`;

      this.canvasRenderer.updateState({
        quoteText: quoteTextarea.value,
        speakerName: speakerNameInput.value,
        speakerTitle: speakerTitleInput.value
      });
      this.canvasRenderer.render();
    };

    quoteTextarea?.addEventListener('input', updateText);
    speakerNameInput?.addEventListener('input', updateText);
    speakerTitleInput?.addEventListener('input', updateText);

    // 2. Font Family & Size Slider
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeVal = document.getElementById('fontSizeVal');

    fontFamilySelect?.addEventListener('change', (e) => {
      this.canvasRenderer.updateState({ fontFamily: e.target.value });
      this.canvasRenderer.render();
    });

    fontSizeSlider?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (fontSizeVal) fontSizeVal.textContent = `${val}px`;
      this.canvasRenderer.updateState({ fontSize: parseInt(val, 10) });
      this.canvasRenderer.render();
    });

    // 3. Text Alignment Buttons
    const alignLeft = document.getElementById('alignLeft');
    const alignCenter = document.getElementById('alignCenter');
    const alignRight = document.getElementById('alignRight');

    const setAlign = (align, activeBtn) => {
      [alignLeft, alignCenter, alignRight].forEach(b => {
        b.className = 'flex-1 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center';
      });
      activeBtn.className = 'flex-1 py-1.5 text-xs font-medium rounded-lg bg-white text-blue-600 shadow-sm transition-all flex items-center justify-center';

      this.canvasRenderer.updateState({ alignment: align });
      this.canvasRenderer.render();
    };

    alignLeft?.addEventListener('click', () => setAlign('left', alignLeft));
    alignCenter?.addEventListener('click', () => setAlign('center', alignCenter));
    alignRight?.addEventListener('click', () => setAlign('right', alignRight));

    // 4. Color Picker & Swatches
    const textColorPicker = document.getElementById('textColorPicker');
    textColorPicker?.addEventListener('input', (e) => {
      this.canvasRenderer.updateState({ textColor: e.target.value });
      this.canvasRenderer.render();
    });

    document.querySelectorAll('button[data-color]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.currentTarget.getAttribute('data-color');
        if (textColorPicker) textColorPicker.value = color;
        this.canvasRenderer.updateState({ textColor: color });
        this.canvasRenderer.render();
      });
    });

    // 5. Shadow, Stroke, Overlay
    const toggleShadow = document.getElementById('toggleShadow');
    const toggleStroke = document.getElementById('toggleStroke');
    const overlayOpacitySlider = document.getElementById('overlayOpacitySlider');
    const overlayOpacityVal = document.getElementById('overlayOpacityVal');

    toggleShadow?.addEventListener('change', (e) => {
      this.canvasRenderer.updateState({ hasShadow: e.target.checked });
      this.canvasRenderer.render();
    });

    toggleStroke?.addEventListener('change', (e) => {
      this.canvasRenderer.updateState({ hasStroke: e.target.checked });
      this.canvasRenderer.render();
    });

    overlayOpacitySlider?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (overlayOpacityVal) overlayOpacityVal.textContent = `${val}%`;
      this.canvasRenderer.updateState({ overlayOpacity: parseInt(val, 10) / 100 });
      this.canvasRenderer.render();
    });

    // 6. Collapsible API Key Panel Toggle
    const toggleApiPanel = document.getElementById('toggleApiPanel');
    const apiPanelContent = document.getElementById('apiPanelContent');
    const apiChevron = document.getElementById('apiChevron');
    const saveApiKeysBtn = document.getElementById('saveApiKeysBtn');

    toggleApiPanel?.addEventListener('click', () => {
      const isHidden = apiPanelContent.classList.contains('hidden');
      if (isHidden) {
        apiPanelContent.classList.remove('hidden');
        if (apiChevron) apiChevron.style.transform = 'rotate(180deg)';
      } else {
        apiPanelContent.classList.add('hidden');
        if (apiChevron) apiChevron.style.transform = 'rotate(0deg)';
      }
    });

    saveApiKeysBtn?.addEventListener('click', () => {
      const keys = {
        googleApiKey: document.getElementById('googleApiKey')?.value.trim() || '',
        googleCx: document.getElementById('googleCx')?.value.trim() || '',
        unsplashAccessKey: document.getElementById('unsplashAccessKey')?.value.trim() || '',
        pixabayApiKey: document.getElementById('pixabayApiKey')?.value.trim() || ''
      };
      StorageManager.saveApiKeys(keys);
      this.restoreApiKeys();
      this.showToast('API 키가 성공적으로 저장되었습니다!');
    });

    // 7. Speaker Image Options
    const toggleSpeakerImage = document.getElementById('toggleSpeakerImage');
    const speakerShapeCircle = document.getElementById('speakerShapeCircle');
    const speakerShapeSquare = document.getElementById('speakerShapeSquare');
    const speakerShapeRing = document.getElementById('speakerShapeRing');
    const speakerSizeSlider = document.getElementById('speakerSizeSlider');
    const speakerSizeVal = document.getElementById('speakerSizeVal');
    const speakerPosYSlider = document.getElementById('speakerPosYSlider');

    toggleSpeakerImage?.addEventListener('change', (e) => {
      this.canvasRenderer.updateState({ showSpeaker: e.target.checked });
      this.canvasRenderer.render();
    });

    const setShape = (shape, activeBtn) => {
      [speakerShapeCircle, speakerShapeSquare, speakerShapeRing].forEach(b => {
        b.className = 'px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 font-medium';
      });
      activeBtn.className = 'px-3 py-1 text-xs rounded-lg bg-blue-600 text-white font-medium';
      this.canvasRenderer.updateState({ speakerShape: shape });
      this.canvasRenderer.render();
    };

    speakerShapeCircle?.addEventListener('click', () => setShape('circle', speakerShapeCircle));
    speakerShapeSquare?.addEventListener('click', () => setShape('square', speakerShapeSquare));
    speakerShapeRing?.addEventListener('click', () => setShape('ring', speakerShapeRing));

    speakerSizeSlider?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (speakerSizeVal) speakerSizeVal.textContent = `${val}px`;
      this.canvasRenderer.updateState({ speakerSize: parseInt(val, 10) });
      this.canvasRenderer.render();
    });

    speakerPosYSlider?.addEventListener('input', (e) => {
      this.canvasRenderer.updateState({ speakerPosY: parseInt(e.target.value, 10) });
      this.canvasRenderer.render();
    });

    // 8. Aspect Ratio Buttons
    const ratioSquare = document.getElementById('ratioSquare');
    const ratioStory = document.getElementById('ratioStory');

    ratioSquare?.addEventListener('click', () => {
      ratioSquare.className = 'px-2.5 py-1 rounded-lg bg-white text-blue-600 font-bold shadow-sm';
      ratioStory.className = 'px-2.5 py-1 rounded-lg text-slate-600 font-medium hover:text-slate-900';
      this.canvasRenderer.setDimensions(1080, 1080);
      this.canvasRenderer.render();
    });

    ratioStory?.addEventListener('click', () => {
      ratioStory.className = 'px-2.5 py-1 rounded-lg bg-white text-blue-600 font-bold shadow-sm';
      ratioSquare.className = 'px-2.5 py-1 rounded-lg text-slate-600 font-medium hover:text-slate-900';
      this.canvasRenderer.setDimensions(1080, 1350);
      this.canvasRenderer.render();
    });

    // 9. Export Controls (Format Toggle & Download/Copy)
    const formatPNG = document.getElementById('formatPNG');
    const formatJPG = document.getElementById('formatJPG');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    const filenamePreview = document.getElementById('filenamePreview');

    formatPNG?.addEventListener('click', () => {
      this.exportFormat = 'png';
      formatPNG.className = 'px-3 py-1 rounded-lg bg-white text-blue-600 font-bold shadow-sm';
      formatJPG.className = 'px-3 py-1 rounded-lg text-slate-600 font-medium hover:text-slate-900';
      if (filenamePreview) filenamePreview.textContent = 'quote-card.png';
    });

    formatJPG?.addEventListener('click', () => {
      this.exportFormat = 'jpg';
      formatJPG.className = 'px-3 py-1 rounded-lg bg-white text-blue-600 font-bold shadow-sm';
      formatPNG.className = 'px-3 py-1 rounded-lg text-slate-600 font-medium hover:text-slate-900';
      if (filenamePreview) filenamePreview.textContent = 'quote-card.jpg';
    });

    downloadBtn?.addEventListener('click', () => {
      this.canvasRenderer.downloadImage(this.exportFormat);
      this.showToast(`이미지 다운로드 완료 (${this.exportFormat.toUpperCase()})`);
    });

    copyBtn?.addEventListener('click', async () => {
      const ok = await this.canvasRenderer.copyToClipboard();
      if (ok) {
        this.showToast('클립보드에 이미지 복사 완료!');
      } else {
        this.showToast('클립보드 복사 실패 (브라우저 권한을 확인해주세요)');
      }
    });
  }

  async handleImageSelected({ slot, url }) {
    const bgUrl = slot === 'bg' ? url : this.imageManager.getSelectedBgUrl();
    const speakerUrl = slot === 'speaker' ? url : this.imageManager.getSelectedSpeakerUrl();

    await this.canvasRenderer.loadImages(bgUrl, speakerUrl);
    this.canvasRenderer.render();
    this.showToast(slot === 'bg' ? '배경 이미지가 적용되었습니다' : '인물 이미지가 적용되었습니다');
  }

  async syncCanvasWithControls() {
    const bgUrl = this.imageManager.getSelectedBgUrl();
    const speakerUrl = this.imageManager.getSelectedSpeakerUrl();

    await this.canvasRenderer.loadImages(bgUrl, speakerUrl);
    this.canvasRenderer.render();
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
