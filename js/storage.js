const StorageManager = (function() {
  const DB_NAME = 'ChangAnDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'imageOverrides';
  
  let db = null;
  let fallbackStorage = null;
  let useFallback = false;
  
  function init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.warn('[StorageManager] IndexedDB不可用，使用localStorage降级方案');
        useFallback = true;
        fallbackStorage = window.localStorage;
        resolve();
      };
      
      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('[StorageManager] IndexedDB初始化成功');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }
  
  async function set(key, value) {
    if (useFallback) {
      return setFallback(key, value);
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const data = {
        id: key,
        value: compressValue(value),
        timestamp: Date.now(),
        category: extractCategory(key)
      };
      
      const request = store.put(data);
      request.onsuccess = () => {
        cleanupOldRecords();
        resolve(true);
      };
      request.onerror = () => {
        console.warn('[StorageManager] IndexedDB写入失败，尝试降级');
        useFallback = true;
        fallbackStorage = window.localStorage;
        setFallback(key, value).then(resolve).catch(reject);
      };
    });
  }
  
  async function get(key) {
    if (useFallback) {
      return getFallback(key);
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(decompressValue(request.result.value));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        useFallback = true;
        fallbackStorage = window.localStorage;
        getFallback(key).then(resolve).catch(reject);
      };
    });
  }
  
  async function getAll() {
    if (useFallback) {
      return getAllFallback();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const result = {};
        request.result.forEach(item => {
          result[item.id] = decompressValue(item.value);
        });
        resolve(result);
      };
      request.onerror = () => {
        useFallback = true;
        fallbackStorage = window.localStorage;
        getAllFallback().then(resolve).catch(reject);
      };
    });
  }
  
  async function remove(key) {
    if (useFallback) {
      return removeFallback(key);
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        useFallback = true;
        fallbackStorage = window.localStorage;
        removeFallback(key).then(resolve).catch(reject);
      };
    });
  }
  
  async function clear() {
    if (useFallback) {
      return clearFallback();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        useFallback = true;
        fallbackStorage = window.localStorage;
        clearFallback().then(resolve).catch(reject);
      };
    });
  }
  
  async function getSize() {
    if (useFallback) {
      return JSON.stringify(fallbackStorage).length;
    }
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        let size = 0;
        request.result.forEach(item => {
          size += JSON.stringify(item).length;
        });
        resolve(size);
      };
      request.onerror = () => {
        resolve(JSON.stringify(fallbackStorage).length);
      };
    });
  }
  
  function cleanupOldRecords(maxRecords = 100) {
    if (useFallback) return;
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    index.getAll().onsuccess = (event) => {
      const records = event.target.result;
      if (records.length > maxRecords) {
        const sorted = records.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = sorted.slice(0, records.length - maxRecords);
        
        toDelete.forEach(record => {
          store.delete(record.id);
        });
        console.log(`[StorageManager] 清理了 ${toDelete.length} 条旧记录`);
      }
    };
  }
  
  function compressValue(value) {
    if (typeof value === 'string' && value.length > 100) {
      try {
        return LZString.compress(value);
      } catch (e) {
        return value;
      }
    }
    return JSON.stringify(value);
  }
  
  function decompressValue(compressed) {
    try {
      const decompressed = LZString.decompress(compressed);
      if (decompressed) return decompressed;
      return JSON.parse(compressed);
    } catch (e) {
      try {
        return JSON.parse(compressed);
      } catch {
        return compressed;
      }
    }
  }
  
  function extractCategory(key) {
    const parts = key.split('-');
    return parts[0] || 'default';
  }
  
  function setFallback(key, value) {
    try {
      const compressed = compressValue(value);
      fallbackStorage.setItem(key, compressed);
      cleanupFallback();
      return Promise.resolve(true);
    } catch (e) {
      console.error('[StorageManager] localStorage写入失败:', e);
      return Promise.reject(e);
    }
  }
  
  function getFallback(key) {
    const compressed = fallbackStorage.getItem(key);
    if (compressed) {
      return Promise.resolve(decompressValue(compressed));
    }
    return Promise.resolve(null);
  }
  
  function getAllFallback() {
    const result = {};
    for (let i = 0; i < fallbackStorage.length; i++) {
      const key = fallbackStorage.key(i);
      if (key && (key.startsWith('image-') || key.startsWith('archive-'))) {
        result[key] = decompressValue(fallbackStorage.getItem(key));
      }
    }
    return Promise.resolve(result);
  }
  
  function removeFallback(key) {
    fallbackStorage.removeItem(key);
    return Promise.resolve(true);
  }
  
  function clearFallback() {
    for (let i = fallbackStorage.length - 1; i >= 0; i--) {
      const key = fallbackStorage.key(i);
      if (key && (key.startsWith('image-') || key.startsWith('archive-'))) {
        fallbackStorage.removeItem(key);
      }
    }
    return Promise.resolve(true);
  }
  
  function cleanupFallback(maxKeys = 100) {
    const keys = [];
    for (let i = 0; i < fallbackStorage.length; i++) {
      const key = fallbackStorage.key(i);
      if (key && (key.startsWith('image-') || key.startsWith('archive-'))) {
        keys.push(key);
      }
    }
    
    if (keys.length > maxKeys) {
      keys.sort((a, b) => {
        const aMatch = a.match(/\d+/);
        const bMatch = b.match(/\d+/);
        return (aMatch ? parseInt(aMatch[0]) : 0) - (bMatch ? parseInt(bMatch[0]) : 0);
      });
      
      const toDelete = keys.slice(0, keys.length - maxKeys);
      toDelete.forEach(key => fallbackStorage.removeItem(key));
      console.log(`[StorageManager] 清理了 ${toDelete.length} 条localStorage旧记录`);
    }
  }
  
  return {
    init,
    set,
    get,
    getAll,
    remove,
    clear,
    getSize
  };
})();

const LZString = {
  compress: function (input) {
    if (input == null) return "";
    let output = "";
    let c, i = 0, len = input.length, L, R, E;
    const context_dictionary = {};
    const context_dictionaryToCreate = {};
    let context_data = [];
    let context_data_val = 0;
    let context_data_position = 0;
    let context_dictSize = 1;
    let context_numBits = 1;
    
    for (let ii = 0; ii < 256; ii++) {
      context_dictionary[String.fromCharCode(ii)] = ii;
    }
    
    for (c = input.charCodeAt(i); i < len; c = input.charCodeAt(++i)) {
      if (context_dictionary[String.fromCharCode(c)] !== undefined) {
        L = String.fromCharCode(c);
      } else {
        L = c;
      }
      if (context_dictionary[L] !== undefined) {
        R = L;
      } else {
        R = c;
      }
      E = L + String.fromCharCode(R);
      if (context_dictionary[E] !== undefined) {
        L = E;
      } else {
        context_data_val = (context_data_val << context_numBits) | context_dictionary[L];
        context_data_position += context_numBits;
        if (context_data_position >= 16) {
          context_data_position -= 16;
          output += String.fromCharCode((context_data_val >> 8) & 255, context_data_val & 255);
        }
        context_dictionary[E] = context_dictSize++;
        if (context_dictSize >= (1 << context_numBits)) {
          context_numBits++;
        }
        L = String.fromCharCode(R);
      }
    }
    
    context_data_val = (context_data_val << context_numBits) | context_dictionary[L];
    context_data_position += context_numBits;
    while (context_data_position > 0) {
      context_data_position -= 8;
      output += String.fromCharCode((context_data_val >> context_data_position) & 255);
    }
    
    return output;
  },
  
  decompress: function (input) {
    if (input == null || input === "") return "";
    let output = "";
    const context_dictionary = [];
    let i, c, L, R;
    let context_data = input.split("").map(function (e) { return e.charCodeAt(0); });
    let context_data_val = context_data[0];
    let context_data_position = 8;
    let context_dictSize = 1;
    let context_numBits = 1;
    
    for (i = 0; i < 256; i++) {
      context_dictionary[i] = String.fromCharCode(i);
    }
    
    c = context_data_val & ((1 << context_numBits) - 1);
    context_data_val = context_data_val >> context_numBits;
    context_data_position -= context_numBits;
    L = String.fromCharCode(c);
    output += L;
    
    while (context_data_position <= 8 * context_data.length - context_numBits) {
      c = context_data_val & ((1 << context_numBits) - 1);
      context_data_val = context_data_val >> context_numBits;
      context_data_position -= context_numBits;
      
      if (context_data_position < 0) {
        context_data_position += 8;
        context_data_val |= context_data[++i] << context_data_position;
      }
      
      if (c < context_dictSize) {
        R = context_dictionary[c];
      } else if (c === context_dictSize) {
        R = L + L.charAt(0);
      } else {
        return "";
      }
      
      output += R;
      context_dictionary[context_dictSize++] = L + R.charAt(0);
      if (context_dictSize >= (1 << context_numBits)) {
        context_numBits++;
      }
      L = R;
    }
    
    return output;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}