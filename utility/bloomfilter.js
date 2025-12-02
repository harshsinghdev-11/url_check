class BloomFilter {
    constructor(size, hashCount) {
        this.size = size;
        this.hashCount = hashCount;
        this.bits = new Uint8Array(Math.ceil(size / 8));
    }

    // --- FNV-1a ---
    fnv1a(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;  // unsigned
    }

    // --- MurmurHash2 (fast non-crypto) ---
    murmur2(str) {
        let seed = 0x9747b28c;
        let hash = seed ^ str.length;
        let m = 0x5bd1e995;
        let r = 24;

        for (let i = 0; i < str.length; i++) {
            let k = str.charCodeAt(i);
            k = Math.imul(k, m);
            k ^= k >>> r;
            k = Math.imul(k, m);

            hash = Math.imul(hash, m);
            hash ^= k;
        }

        hash ^= hash >>> 13;
        hash = Math.imul(hash, m);
        hash ^= hash >>> 15;

        return hash >>> 0;
    }

    // ----- Insert element -----
    add(str) {
        const h1 = this.fnv1a(str) % this.size;
        let h2 = this.murmur2(str) % this.size;
        if (h2 === 0) h2 = 1;

        for (let i = 0; i < this.hashCount; i++) {
            const finalHash = (h1 + i * h2) % this.size;
            this._setBit(finalHash);
        }
    }

    // ----- Check membership -----
    contains(str) {
        const h1 = this.fnv1a(str) % this.size;
        let h2 = this.murmur2(str) % this.size;
        if (h2 === 0) h2 = 1;

        for (let i = 0; i < this.hashCount; i++) {
            const finalHash = (h1 + i * h2) % this.size;
            if (!this._getBit(finalHash)) {
                return false;
            }
        }
        return true;
    }

    // ----- Helpers -----
    _setBit(pos) {
        const byteIndex = pos >> 3;
        const bitIndex = pos & 7;
        this.bits[byteIndex] |= (1 << bitIndex);
    }

    _getBit(pos) {
        const byteIndex = pos >> 3;
        const bitIndex = pos & 7;
        return (this.bits[byteIndex] & (1 << bitIndex)) !== 0;
    }
}

export default BloomFilter;
