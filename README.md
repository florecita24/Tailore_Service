# Tailoré Integration Service

Layanan integrasi yang menghubungkan **Catalog Service (Ooga)** dan **Order Service (Cimol)** untuk sistem e-commerce Tailoré.

[Tailoré Web](https://tailore-flori.queenifyofficial.site/)

## 📋 Deskripsi

Service ini berfungsi sebagai **middleware/orchestrator** yang:
- Mengoordinasikan proses checkout antara Catalog dan Order service
- Mengimplementasikan **2-Phase Commit** untuk transaksi yang konsisten
- Menyediakan frontend untuk shopping experience yang lengkap
- Menangani stock reservation dan commit process

## 🏗️ Arsitektur

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────┐
│  Integration Service    │ ◄─── Service ini
│  (Port 5001)            │
└───┬─────────────┬───────┘
    │             │
    │             │ HTTPS
    ▼             ▼
┌──────────┐  ┌──────────┐
│  Ooga    │  │  Cimol   │
│ Catalog  │  │  Order   │
└──────────┘  └──────────┘
```

## ✨ Fitur

### 1. **Checkout Process (2-Phase Commit)**
- ✅ Reserve stock di Catalog Service
- ✅ Create order di Order Service  
- ✅ Commit stock untuk finalisasi
- ✅ Rollback handling (jika diperlukan)

### 2. **Order History**
- Filter orders berdasarkan customer name
- Proxy ke Order Service dengan filtering

### 3. **Frontend Interface**
- Product catalog dengan filter & search
- Shopping cart management
- Login/logout functionality
- Order history view

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js v14 atau lebih tinggi
- NPM atau Yarn

### Instalasi

1. Clone repository
```bash
git clone <repository-url>
cd Tailore_Service
```

2. Install dependencies
```bash
npm install
```

3. Jalankan service
```bash
npm start
```

Service akan berjalan di **http://localhost:5001**

## 📡 API Endpoints

### 1. POST `/api/checkout`
Memproses checkout dengan 2-phase commit.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerName": "John Doe",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Transaksi Berhasil!",
  "invoices": ["#ORD-123", "#ORD-124"]
}
```

**Response Error (401/400/500):**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

### 2. GET `/api/orders/:customerName`
Mendapatkan order history berdasarkan nama customer.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "customer_name": "John Doe",
      "product_id": 1,
      "quantity": 2,
      "total_price": 500000,
      "created_at": "2026-01-05T10:00:00Z"
    }
  ]
}
```

## 🔗 Connected Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Catalog (Ooga)** | https://ooga.queenifyofficial.site/api | Product & inventory management |
| **Order (Cimol)** | https://cimol.queenifyofficial.site/api | Order processing |

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "axios": "^1.6.0",
  "cors": "^2.8.5"
}
```

## 🔐 Authentication

- **Frontend → Integration Service**: Bearer token dari Catalog Service
- **Integration Service → Order Service**: Secret key (`x-secret-key: rahasia123`)

## 🎯 Transaction Flow

```
1. User clicks "Checkout"
   ↓
2. Frontend sends POST /api/checkout
   ↓
3. Integration Service:
   ├─→ Reserve stock (Ooga)
   ├─→ Create orders (Cimol)
   └─→ Commit stock (Ooga)
   ↓
4. Return order IDs to user
```

## 📁 Struktur Project

```
Tailore_Service/
├── server.js           # Main server file
├── package.json        # Dependencies
├── .gitignore          # Git ignore rules
├── README.md           # Dokumentasi ini
└── public/
    └── index.html      # Frontend application
```

## 🛠️ Development

### Port Configuration
Default port: **5001**  
Dapat diubah melalui environment variable:
```bash
PORT=3000 npm start
```

### Logging
Service menggunakan console logging untuk tracking:
- 🛒 Checkout requests
- 🔒 Stock reservations
- 💾 Order creations
- ✅ Stock commits
- ❌ Errors

## 🐛 Troubleshooting

### Error: "Harap login dulu!"
- Pastikan token authentication valid
- Token harus dikirim di header `Authorization: Bearer <token>`

### Error: "Keranjang kosong!"
- Pastikan items array tidak kosong
- Minimal 1 item di cart

### Error: Stock reservation failed
- Cek apakah Catalog Service (Ooga) online
- Pastikan product_id valid
- Cek ketersediaan stock

### Error: Order creation failed
- Cek apakah Order Service (Cimol) online
- Pastikan secret key valid

## 👥 Team

**Tailoré E-Commerce Project**  
Integration Service by: Florecita Natawirya
