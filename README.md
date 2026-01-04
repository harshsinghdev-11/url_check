# Malicious URL Detection System

A high-performance URL detection service designed to identify malicious URLs with extreme speed and efficiency. This project demonstrates the power of **Bloom Filters** for probabilistic checking, offering a significant performance advantage over traditional database queries.

![Project Search](image.png)

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![Express](https://img.shields.io/badge/express-5.0-blue.svg)

## 🚀 Features

- **Ultra-Fast Detection**: Utilizes a custom **Bloom Filter** implementation (In-Memory) to check for malicious URLs in microseconds.
- **Performance Comparison**: Includes endpoints to benchmark Bloom Filter performance against a standard MongoDB index search (`/check` vs `/find`).
- **Rate Limiting**: Built-in protection against abuse using `express-rate-limit`.
- **Persistent State**: The Bloom Filter state is serialized and stored in MongoDB, allowing for easy reloading without rebuilding from scratch.
- **RESTful API**: Simple JSON endpoints for integration.
- **Web Interface**: Clean EJS-based frontend for manual URL testing.

## 🛠️ Architecture

The system uses a hybrid approach:
1.  **Initialization**: On server start, the `initBloomFilter` utility fetches the pre-calculated Bloom Filter bit array from MongoDB (`bloomfilterArray` collection) and loads it into memory.
2.  **Fast Path (`/check`)**: Incoming URLs are hashed (FNV-1a + MurmurHash2) and checked against the in-memory bitset. This is `O(k)` (where k is hash count), independent of the database size.
3.  **Slow Path (`/find`)**: A direct query to MongoDB serves as a baseline for performance comparison and handles definitive lookups if needed (though the current `/check` is the primary fast detector).

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/urldetection.git
    cd urldetection
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/urldetection
    ```
    *Note: Ensure you have a MongoDB instance running and populated with the necessary `bloomfilterArray` data.*

4.  **Run the server:**
    ```bash
    npm run start
    ```
    *Or for development:*
    ```bash
    node index.js
    ```

## 🔌 API Reference

### 1. Check URL (Bloom Filter) -> *Fast*
Checks if a URL is malicious using the in-memory Bloom Filter.

-   **Endpoint**: `GET /check`
-   **Query Param**: `url` (string)
-   **Response**:
    ```json
    {
      "message": "Malicious" | "Safe",
      "responseTime": "0.05 ms"
    }
    ```

### 2. Find URL (Database) -> *Slow*
Checks if a URL is malicious by querying MongoDB directly. Used for benchmarking.

-   **Endpoint**: `GET /find`
-   **Query Param**: `url` (string)
-   **Response**:
    ```json
    {
      "message": "Malicious" | "Safe",
      "responseTime": "15.20 ms"
    }
    ```

### 3. Test Data
Returns a sample of URLs from the database.
-   **Endpoint**: `GET /test`

### 4. Database Count
Returns the total number of malicious URLs tracked.
-   **Endpoint**: `GET /count`

## 🧩 Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js (v5)
-   **Database**: MongoDB & Mongoose
-   **Algorithm**: Custom Bloom Filter (FNV-1a + MurmurHash2)
-   **Templating**: EJS
-   **Security**: Rate Limiting

## 🤝 Contributing

Contributions are welcome! Please feel free to verify the Bloom Filter seeding process or optimize the hashing algorithms.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
