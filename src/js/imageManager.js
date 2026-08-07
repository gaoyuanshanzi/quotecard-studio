/**
 * Image Manager Module
 * Coordinates image selection for both Background and Speaker Image slots.
 * Handles local file upload, API search results grid, sample gallery tabs, and selection state.
 */

import { ApiService } from './api.js';

export class ImageManager {
  constructor(apiService, onImageSelectCallback) {
    this.apiService = apiService;
    this.onImageSelect = onImageSelectCallback;

    // Active state
    this.targetSlot = 'bg'; // 'bg' | 'speaker'
    this.activeMethod = 'search'; // 'search' | 'sample' | 'upload'
    this.activeCategory = 'all';

    // Currently selected image data
    this.selectedBgUrl = ApiService.getSampleImages()[0].url; // Default sample
    this.selectedSpeakerUrl = ApiService.getSampleImages()[8].url; // Default portrait sample

    this.initDOM();
    this.attachEventListeners();
    this.renderSamples();
  }

  initDOM() {
    // Target slot tab buttons
    this.targetSlotBgBtn = document.getElementById('targetSlotBg');
    this.targetSlotSpeakerBtn = document.getElementById('targetSlotSpeaker');

    // Method tab buttons
    this.methodTabSearch = document.getElementById('methodTabSearch');
    this.methodTabSample = document.getElementById('methodTabSample');
    this.methodTabUpload = document.getElementById('methodTabUpload');

    // Views
    this.viewSearch = document.getElementById('viewSearch');
    this.viewSample = document.getElementById('viewSample');
    this.viewUpload = document.getElementById('viewUpload');

    // Inputs & Grid
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
    this.imageFileInput = document.getElementById('imageFileInput');
    this.thumbnailGrid = document.getElementById('thumbnailGrid');
    this.searchResultCount = document.getElementById('searchResultCount');
    this.galleryTitle = document.getElementById('galleryTitle');
  }

  attachEventListeners() {
    // 1. Target slot switching
    this.targetSlotBgBtn?.addEventListener('click', () => this.setTargetSlot('bg'));
    this.targetSlotSpeakerBtn?.addEventListener('click', () => this.setTargetSlot('speaker'));

    // 2. Method tab switching
    this.methodTabSearch?.addEventListener('click', () => this.setMethod('search'));
    this.methodTabSample?.addEventListener('click', () => this.setMethod('sample'));
    this.methodTabUpload?.addEventListener('click', () => this.setMethod('upload'));

    // 3. Search button & Enter key
    this.searchBtn?.addEventListener('click', () => this.handleSearch());
    this.searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // 4. Sample Category Filter buttons
    document.querySelectorAll('.sample-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-category');
        this.filterSamplesCategory(cat, e.currentTarget);
      });
    });

    // 5. Local File Upload
    this.imageFileInput?.addEventListener('change', (e) => this.handleFileUpload(e));
  }

  setTargetSlot(slot) {
    this.targetSlot = slot;
    if (slot === 'bg') {
      this.targetSlotBgBtn.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-sm transition-all flex items-center justify-center gap-1.5';
      this.targetSlotSpeakerBtn.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5';
    } else {
      this.targetSlotSpeakerBtn.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-sm transition-all flex items-center justify-center gap-1.5';
      this.targetSlotBgBtn.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5';
    }
  }

  setMethod(method) {
    this.activeMethod = method;

    // Reset tabs UI
    [this.methodTabSearch, this.methodTabSample, this.methodTabUpload].forEach(tab => {
      tab.className = 'px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1';
    });

    this.viewSearch.classList.add('hidden');
    this.viewSample.classList.add('hidden');
    this.viewUpload.classList.add('hidden');

    if (method === 'search') {
      this.methodTabSearch.className = 'px-3 py-1.5 text-xs font-semibold text-blue-600 border-b-2 border-blue-600 transition-all flex items-center gap-1';
      this.viewSearch.classList.remove('hidden');
      this.galleryTitle.textContent = '인터넷 검색 결과 (클릭 시 적용)';
    } else if (method === 'sample') {
      this.methodTabSample.className = 'px-3 py-1.5 text-xs font-semibold text-blue-600 border-b-2 border-blue-600 transition-all flex items-center gap-1';
      this.viewSample.classList.remove('hidden');
      this.galleryTitle.textContent = '추천 샘플 이미지 (클릭 시 적용)';
      this.renderSamples();
    } else if (method === 'upload') {
      this.methodTabUpload.className = 'px-3 py-1.5 text-xs font-semibold text-blue-600 border-b-2 border-blue-600 transition-all flex items-center gap-1';
      this.viewUpload.classList.remove('hidden');
      this.galleryTitle.textContent = '최근 사용한 이미지 (클릭 시 적용)';
    }
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    this.thumbnailGrid.innerHTML = `
      <div class="col-span-4 py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Multi-API 동시 이미지 검색 중...</span>
      </div>
    `;

    try {
      const { results, isSampleFallback } = await this.apiService.searchMultiApi(query);
      this.renderGridItems(results, isSampleFallback);
    } catch (e) {
      console.error('Search error:', e);
      this.thumbnailGrid.innerHTML = `<div class="col-span-4 py-6 text-center text-xs text-red-500">검색 중 오류가 발생했습니다.</div>`;
    }
  }

  renderSamples() {
    const samples = ApiService.getSampleImages();
    let filtered = samples;
    if (this.activeCategory !== 'all') {
      filtered = samples.filter(s => s.category === this.activeCategory);
    }
    this.renderGridItems(filtered, false);
  }

  filterSamplesCategory(cat, btnElement) {
    this.activeCategory = cat;
    document.querySelectorAll('.sample-cat-btn').forEach(b => {
      b.className = 'sample-cat-btn px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium';
    });
    btnElement.className = 'sample-cat-btn px-3 py-1 rounded-lg bg-blue-600 text-white font-medium';
    this.renderSamples();
  }

  handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      this.applyImageSelection(dataUrl);

      // Prepend to thumbnail grid for quick re-selection
      const newItem = {
        id: `upload-${Date.now()}`,
        url: dataUrl,
        thumbUrl: dataUrl,
        source: 'Upload',
        title: file.name
      };
      
      this.prependUploadThumbnail(newItem);
    };
    reader.readAsDataURL(file);
  }

  prependUploadThumbnail(item) {
    const card = this.createThumbnailCard(item);
    this.thumbnailGrid.prepend(card);
  }

  renderGridItems(items, isSampleFallback = false) {
    this.thumbnailGrid.innerHTML = '';
    this.searchResultCount.textContent = `${items.length}개 표시 중`;

    if (items.length === 0) {
      this.thumbnailGrid.innerHTML = `<div class="col-span-4 py-6 text-center text-xs text-slate-400">검색 결과가 없습니다.</div>`;
      return;
    }

    items.forEach(item => {
      const card = this.createThumbnailCard(item);
      this.thumbnailGrid.appendChild(card);
    });
  }

  createThumbnailCard(item) {
    const div = document.createElement('div');
    div.className = 'group relative aspect-square rounded-lg overflow-hidden bg-slate-200 cursor-pointer border border-slate-300 hover:border-blue-500 shadow-sm hover:shadow-md transition-all';

    // Source Badge Color Mapping
    let badgeBg = 'bg-slate-800 text-white';
    if (item.source === 'Google') badgeBg = 'bg-blue-600 text-white';
    else if (item.source === 'Unsplash') badgeBg = 'bg-slate-900 text-white';
    else if (item.source === 'Pixabay') badgeBg = 'bg-emerald-600 text-white';
    else if (item.source === 'Sample') badgeBg = 'bg-amber-600 text-white';
    else if (item.source === 'Upload') badgeBg = 'bg-purple-600 text-white';

    div.innerHTML = `
      <img src="${item.thumbUrl || item.url}" alt="${item.title || 'thumbnail'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
      
      <!-- Source Badge -->
      <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeBg} shadow-sm">
        ${item.source}
      </span>

      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span class="text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded shadow">적용하기</span>
      </div>
    `;

    div.addEventListener('click', () => {
      this.applyImageSelection(item.url);
    });

    return div;
  }

  applyImageSelection(url) {
    if (this.targetSlot === 'bg') {
      this.selectedBgUrl = url;
    } else {
      this.selectedSpeakerUrl = url;
    }

    if (typeof this.onImageSelect === 'function') {
      this.onImageSelect({
        slot: this.targetSlot,
        url: url
      });
    }
  }

  getSelectedBgUrl() {
    return this.selectedBgUrl;
  }

  getSelectedSpeakerUrl() {
    return this.selectedSpeakerUrl;
  }
}
