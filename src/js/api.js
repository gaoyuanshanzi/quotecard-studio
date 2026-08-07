/**
 * Multi-API Search & Sample Image Manager
 * Fetches images concurrently from Google Custom Search, Unsplash, and Pixabay APIs
 * Provides fallback curated sample images when API keys are not set.
 */

export class ApiService {
  constructor(getApiKeysFn) {
    this.getApiKeys = getApiKeysFn;
  }

  // Pre-curated high-resolution fallback sample images
  static getSampleImages() {
    return [
      // Nature / Sunset / Mountains
      {
        id: 'sample-1',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'nature',
        title: '신비로운 호수와 산맥'
      },
      {
        id: 'sample-2',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'nature',
        title: '안개 낀 아침 숲'
      },
      {
        id: 'sample-3',
        url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'nature',
        title: '잔잔한 파도와 노을'
      },

      // Bible / Faith / Cross / Light
      {
        id: 'sample-4',
        url: 'https://images.unsplash.com/photo-1543702484-5853037eb931?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1543702484-5853037eb931?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'bible',
        title: '하늘에 비치는 십자가 빛'
      },
      {
        id: 'sample-5',
        url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'bible',
        title: '기도와 성경 책'
      },
      {
        id: 'sample-6',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'bible',
        title: '빛나는 밤하늘 별무리'
      },

      // Abstract / Minimal / Architecture
      {
        id: 'sample-7',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'abstract',
        title: '우아한 대리석 질감'
      },
      {
        id: 'sample-8',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'abstract',
        title: '미니멀 모던 인테리어'
      },

      // People / Portraits
      {
        id: 'sample-9',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'people',
        title: '인물 프로필 1'
      },
      {
        id: 'sample-10',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'people',
        title: '인물 프로필 2'
      },
      {
        id: 'sample-11',
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'people',
        title: '인물 프로필 3'
      },
      {
        id: 'sample-12',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        source: 'Sample',
        category: 'people',
        title: '인물 프로필 4'
      }
    ];
  }

  /**
   * Search simultaneously across Google, Unsplash, Pixabay APIs
   */
  async searchMultiApi(query) {
    const keys = this.getApiKeys();
    const tasks = [];
    const results = [];

    // 1. Google Custom Search API
    if (keys.googleApiKey && keys.googleCx) {
      tasks.push(this.searchGoogle(query, keys.googleApiKey, keys.googleCx));
    }

    // 2. Unsplash API
    if (keys.unsplashAccessKey) {
      tasks.push(this.searchUnsplash(query, keys.unsplashAccessKey));
    }

    // 3. Pixabay API
    if (keys.pixabayApiKey) {
      tasks.push(this.searchPixabay(query, keys.pixabayApiKey));
    }

    // If no keys provided or configured, return filtered sample images + public unsplash endpoint
    if (tasks.length === 0) {
      return {
        results: this.searchFallbackSamples(query),
        isSampleFallback: true
      };
    }

    const settled = await Promise.allSettled(tasks);
    settled.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        results.push(...res.value);
      }
    });

    // Shuffle/interleave API results so all sources get fair representation
    const interleaved = this.interleaveResults(results);

    return {
      results: interleaved.length > 0 ? interleaved : this.searchFallbackSamples(query),
      isSampleFallback: interleaved.length === 0
    };
  }

  async searchGoogle(query, apiKey, cx) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(query)}&searchType=image&num=6`;
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
      console.warn('Google Image Search failed:', e);
      return [];
    }
  }

  async searchUnsplash(query, accessKey) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${encodeURIComponent(accessKey)}&per_page=6`;
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
      console.warn('Unsplash Search failed:', e);
      return [];
    }
  }

  async searchPixabay(query, apiKey) {
    try {
      const url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&image_type=photo&per_page=6`;
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
      console.warn('Pixabay Search failed:', e);
      return [];
    }
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
    // Interleave items by source to create a balanced grid
    const googleItems = arr.filter(i => i.source === 'Google');
    const unsplashItems = arr.filter(i => i.source === 'Unsplash');
    const pixabayItems = arr.filter(i => i.source === 'Pixabay');

    const maxLen = Math.max(googleItems.length, unsplashItems.length, pixabayItems.length);
    const combined = [];

    for (let i = 0; i < maxLen; i++) {
      if (googleItems[i]) combined.push(googleItems[i]);
      if (unsplashItems[i]) combined.push(unsplashItems[i]);
      if (pixabayItems[i]) combined.push(pixabayItems[i]);
    }
    return combined;
  }
}
