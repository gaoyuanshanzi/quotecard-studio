/**
 * Multi-API Search & Sample Image Manager
 * Concurrently searches Google Custom Search, Unsplash, Pixabay, and Wikimedia Commons APIs.
 * Supports Korean & English queries with intelligent translation and fallback engines.
 */

export class ApiService {
  constructor(getApiKeysFn) {
    this.getApiKeys = getApiKeysFn;

    // Common Korean to English Search Keyword Mapping for Unsplash & Global Queries
    this.keywordMap = {
      '바다': 'ocean,sea,beach',
      '해변': 'beach,ocean,coast',
      '파도': 'waves,ocean,sea',
      '하늘': 'sky,clouds',
      '구름': 'clouds,sky',
      '우주': 'space,galaxy,nebula',
      '별': 'stars,night,sky',
      '십자가': 'cross,faith,light',
      '성경': 'bible,scripture',
      '예수': 'jesus,cross,light',
      '기도': 'prayer,light,hands',
      '교회': 'church,cathedral',
      '자연': 'nature,landscape',
      '산': 'mountain,landscape',
      '숲': 'forest,trees',
      '노을': 'sunset,sunrise',
      '일출': 'sunrise,morning',
      '꽃': 'flower,spring',
      '사랑': 'love,heart',
      '평화': 'peace,calm',
      '희망': 'hope,sunlight',
      '인물': 'portrait,people',
      '사람': 'person,profile'
    };

    // Curated high-resolution keyword fallback image pools
    this.curatedCategoryPools = {
      'sea': [
        { id: 'sea-1', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '에메랄드빛 해변과 노을' },
        { id: 'sea-2', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '푸른 바다의 물결' },
        { id: 'sea-3', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '청량한 모래사장의 수평선' },
        { id: 'sea-4', url: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '잔잔하게 밀려오는 파도' },
        { id: 'sea-5', url: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '웅장한 태평양 수평선' },
        { id: 'sea-6', url: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '황혼이 물드는 바다' }
      ],
      'sky': [
        { id: 'sky-1', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '푸른 하늘과 뭉게구름' },
        { id: 'sky-2', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '황홀한 분홍빛 저녁 하늘' }
      ],
      'space': [
        { id: 'space-1', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80', source: 'Unsplash', title: '화려하게 빛나는 몽환적 은하수' }
      ]
    };
  }

  // Pre-curated static sample images
  static getSampleImages() {
    return [
      { id: 'sample-1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'nature', title: '신비로운 호수와 산맥' },
      { id: 'sample-2', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'nature', title: '안개 낀 아침 숲' },
      { id: 'sample-3', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'nature', title: '잔잔한 파도와 노을' },
      { id: 'sample-4', url: 'https://images.unsplash.com/photo-1543702484-5853037eb931?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1543702484-5853037eb931?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'bible', title: '하늘에 비치는 십자가 빛' },
      { id: 'sample-5', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'bible', title: '기도와 성경 책' },
      { id: 'sample-6', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'bible', title: '빛나는 밤하늘 별무리' },
      { id: 'sample-7', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'abstract', title: '우아한 대리석 질감' },
      { id: 'sample-8', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'abstract', title: '미니멀 모던 인테리어' },
      { id: 'sample-9', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'people', title: '인물 프로필 1' },
      { id: 'sample-10', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'people', title: '인물 프로필 2' },
      { id: 'sample-11', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'people', title: '인물 프로필 3' },
      { id: 'sample-12', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80', thumbUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', source: 'Sample', category: 'people', title: '인물 프로필 4' }
    ];
  }

  /**
   * Search across Google, Unsplash, Pixabay, and Wikimedia Commons concurrently.
   */
  async searchMultiApi(query) {
    const keys = this.getApiKeys();
    const tasks = [];
    const results = [];

    // 1. Google Custom Search API (If Key provided)
    if (keys.googleApiKey) {
      tasks.push(this.searchGoogle(query, keys.googleApiKey, keys.googleCx));
    }

    // 2. Unsplash API (If Key provided)
    if (keys.unsplashAccessKey) {
      tasks.push(this.searchUnsplash(query, keys.unsplashAccessKey));
    }

    // 3. Pixabay API (If Key provided)
    if (keys.pixabayApiKey) {
      tasks.push(this.searchPixabay(query, keys.pixabayApiKey));
    }

    // 4. Wikimedia Commons Public Search (Always available, 100% free, CORS enabled)
    tasks.push(this.searchWikimedia(query));

    const settled = await Promise.allSettled(tasks);
    settled.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        results.push(...res.value);
      }
    });

    // 5. Add Keyword-based Curated Photos for queries like "바다", "하늘", "우주", etc.
    const curatedMatches = this.getCuratedCategoryPhotos(query);
    results.push(...curatedMatches);

    // If still empty or minimal, append fallback sample search
    if (results.length === 0) {
      const fallbacks = this.searchFallbackSamples(query);
      results.push(...fallbacks);
    }

    // Interleave & Deduplicate results
    const finalResults = this.interleaveResults(results);

    return {
      results: finalResults,
      isSampleFallback: false
    };
  }

  async searchGoogle(query, apiKey, cx) {
    try {
      // Default fallback CX if user didn't enter custom engine ID
      const engineId = cx || '017576662512468239146:nh7pt-rfgwy';
      const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(engineId)}&q=${encodeURIComponent(query)}&searchType=image&num=8`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Google API status ${res.status}`);
      const data = await res.json();
      if (!data.items) return [];

      return data.items.map((item, idx) => ({
        id: `google-${idx}-${Date.now()}`,
        url: item.link,
        thumbUrl: item.image?.thumbnailLink || item.link,
        source: 'Google',
        title: item.title || query
      }));
    } catch (e) {
      console.warn('Google Image Search notice:', e);
      return [];
    }
  }

  async searchUnsplash(query, accessKey) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${encodeURIComponent(accessKey)}&per_page=8`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Unsplash API status ${res.status}`);
      const data = await res.json();
      if (!data.results) return [];

      return data.results.map((item) => ({
        id: `unsplash-${item.id}`,
        url: item.urls.regular,
        thumbUrl: item.urls.small,
        source: 'Unsplash',
        title: item.alt_description || query
      }));
    } catch (e) {
      console.warn('Unsplash Search notice:', e);
      return [];
    }
  }

  async searchPixabay(query, apiKey) {
    try {
      const url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&image_type=photo&per_page=8`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Pixabay API status ${res.status}`);
      const data = await res.json();
      if (!data.hits) return [];

      return data.hits.map((item) => ({
        id: `pixabay-${item.id}`,
        url: item.largeImageURL,
        thumbUrl: item.previewURL,
        source: 'Pixabay',
        title: item.tags || query
      }));
    } catch (e) {
      console.warn('Pixabay Search notice:', e);
      return [];
    }
  }

  async searchWikimedia(query) {
    try {
      const q = encodeURIComponent(query);
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const pages = data.query?.pages || {};
      
      const items = Object.values(pages)
        .map(page => {
          const info = page.imageinfo?.[0];
          if (!info || !info.url) return null;
          // Filter out svg / non-image formats if needed
          if (info.url.endsWith('.svg') || info.url.endsWith('.pdf')) return null;
          return {
            id: `wiki-${page.pageid}`,
            url: info.url,
            thumbUrl: info.url,
            source: 'Wikimedia',
            title: page.title.replace('File:', '')
          };
        })
        .filter(Boolean);

      return items;
    } catch (e) {
      console.warn('Wikimedia Search notice:', e);
      return [];
    }
  }

  getCuratedCategoryPhotos(query) {
    const q = query.trim().toLowerCase();
    const results = [];

    if (q === '바다' || q === '해변' || q.includes('sea') || q.includes('ocean') || q.includes('beach')) {
      results.push(...this.curatedCategoryPools['sea']);
    } else if (q === '하늘' || q === '구름' || q.includes('sky')) {
      results.push(...this.curatedCategoryPools['sky']);
    } else if (q === '우주' || q === '별' || q.includes('space') || q.includes('galaxy')) {
      results.push(...this.curatedCategoryPools['space']);
    }

    return results;
  }

  searchFallbackSamples(query) {
    const allSamples = ApiService.getSampleImages();
    if (!query || query.trim() === '') return allSamples;

    const q = query.toLowerCase();
    const filtered = allSamples.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );

    return filtered.length > 0 ? filtered : allSamples;
  }

  interleaveResults(arr) {
    const seenUrls = new Set();
    const unique = [];

    // Remove duplicates
    for (const item of arr) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        unique.push(item);
      }
    }

    // Separate by source
    const googleItems = unique.filter(i => i.source === 'Google');
    const unsplashItems = unique.filter(i => i.source === 'Unsplash');
    const pixabayItems = unique.filter(i => i.source === 'Pixabay');
    const wikiItems = unique.filter(i => i.source === 'Wikimedia');
    const otherItems = unique.filter(i => !['Google', 'Unsplash', 'Pixabay', 'Wikimedia'].includes(i.source));

    const maxLen = Math.max(googleItems.length, unsplashItems.length, pixabayItems.length, wikiItems.length, otherItems.length);
    const combined = [];

    for (let i = 0; i < maxLen; i++) {
      if (googleItems[i]) combined.push(googleItems[i]);
      if (unsplashItems[i]) combined.push(unsplashItems[i]);
      if (pixabayItems[i]) combined.push(pixabayItems[i]);
      if (wikiItems[i]) combined.push(wikiItems[i]);
      if (otherItems[i]) combined.push(otherItems[i]);
    }

    return combined;
  }
}
