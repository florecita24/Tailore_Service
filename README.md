# Tailoré Integration Service

Layanan integrasi untuk e-commerce rental fashion yang mengintegrasikan **Catalog Service (Ooga)** dan **Order Service (Cimol)**.

[Tailoré Web](https://tailore-service.vercel.app/)

---

## 📋 Deskripsi

Service ini berfungsi sebagai **frontend integration layer** yang:
- Menyediakan UI untuk shopping experience yang lengkap
- Mengkoordinasikan proses checkout dengan **2-Phase Commit**
- Mengintegrasikan authentication antara kedua service
- Menangani cart management di client-side

### Analisis Layanan Kelompok (Point A)

**Catalog Service (Ooga)**:
- ✅ JWT auth & role-based access
- ✅ Product management dengan filter lengkap
- ✅ 2PC stock reservation
- ⚠️ Butuh image upload & bulk operations

**Order Service (Cimol)**:
- ✅ Order creation & invoice generation
- ✅ Transaction history (user & admin)
- ✅ Secret key authentication
- ⚠️ Butuh order status update & notifications

**Tanggapan**: Kedua service sudah bagus dengan clear separation of concerns. Rekomendasi: standardize error format & add API gateway.

---

## 🏗️ Arsitektur

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────┐
│  Tailoré Frontend       │ ◄─── Integration Service
│  (SPA - Port 3000)      │
└───┬─────────────┬───────┘
    │             │
    │ JWT         │ JWT + Secret
    ▼             ▼
┌──────────┐  ┌──────────┐
│  Ooga    │  │  Cimol   │
│ Catalog  │  │  Order   │
└──────────┘  └──────────┘
```

**Integration Strategy (Point B & C)**:
1. **Auth**: Single sign-on via Catalog JWT
2. **State**: Cart di localStorage, data di backend
3. **Transaction**: 2PC (reserve → order → commit)
4. **UI**: Unified experience untuk kedua service

---

## ✨ Fitur

### Frontend Integration Layer (Layanan Baru - Point C)
- ✅ Product catalog dengan search & filter
- ✅ Shopping cart management (localStorage)
- ✅ 2-Phase Commit checkout flow
- ✅ Order history tracking
- ✅ Admin dashboard (inventory & transactions)
- ✅ Responsive design (cherry/green theme)

### Untuk User
- Browse products dengan pagination
- Add to cart & adjust quantity
- Checkout dengan form lengkap
- View order history

### Untuk Admin
- Inventory statistics & management
- Stock adjustment
- View all transactions

---

## 🚀 Instalasi

### Prerequisites
- Node.js v14+
- npm/yarn

### Setup

```bash
# Clone repo
git clone <url>
cd Integrasi-Tailore-Service

# Install
npm install

# Run
npm start
```

Service berjalan di **http://localhost:3000**

---

## 📡 API Endpoints

### Catalog Service (Ooga)
**Base URL**: `https://ooga.queenifyofficial.site/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login & get JWT |
| GET | `/catalog/products` | List products |
| POST | `/catalog/reserve` | Reserve stock (2PC) |
| POST | `/catalog/commit` | Commit reservation |

### Order Service (Cimol)
**Base URL**: `https://cimol.queenifyofficial.site/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders/history` | User orders |
| GET | `/orders/transactions` | Admin: all orders |

---

## 🔗 Service Integration

| Service | URL | Function |
|---------|-----|----------|
| **Catalog (Ooga)** | https://ooga.queenifyofficial.site/api | Products, auth, stock |
| **Order (Cimol)** | https://cimol.queenifyofficial.site/api | Orders, invoices |

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

---

## 🔐 Authentication

- **Frontend → Catalog**: `Bearer <token>`
- **Frontend → Order**: `Bearer <token>` + `x-secret-key: rahasia123`

Login menggunakan Catalog Service, token digunakan untuk kedua service.

---

## 🎯 Transaction Flow (2-Phase Commit)

```
1. User checkout
   ↓
2. Reserve stock (Catalog)
   ↓
3. Create order (Order Service)
   ↓
4. Commit reservation (Catalog)
   ↓
5. Success / Rollback if failed
```

**Implementation**:
```javascript
try {
  // Phase 1: Reserve
  const reservation = await reserveStock(items);
  
  // Phase 2: Order
  const orders = await createOrders(items);
  
  // Phase 3: Commit
  await commitReservation(reservation.id);
} catch (error) {
  // Rollback
  await rollbackReservation(reservation.id);
}
```

---

## 📁 Struktur Project

```
Integrasi-Tailore-Service/
├── server.js           # Express server
├── package.json        # Dependencies
├── vercel.json         # Deployment config
├── README.md           # Documentation
└── public/
    └── index.html      # Frontend SPA
```

---

## 🛠️ Development

### Port Configuration
Default: **3000**  
Change via environment:
```bash
PORT=5000 npm start
```

### Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JS
- **Backend**: Node.js, Express (static server)
- **APIs**: RESTful with JWT
- **Deployment**: Vercel

---

## 🐛 Troubleshooting

**"Harap login dulu!"**
- Token invalid/expired
- Login ulang

**"Keranjang kosong!"**
- Cart kosong di localStorage
- Add products dulu

**Stock reservation failed**
- Product out of stock
- Catalog service down

**Order creation failed**
- Order service down
- Secret key salah

---

## 🌐 Deployment (Point D)

**Live URL**: [https://tailore-service.vercel.app](https://tailore-service.vercel.app)

```bash
# Deploy ke Vercel
vercel --prod
```

**Source Code**: [GitHub Repository]  
**Video Demo**: [YouTube Link - Coming Soon]

---

## 👥 Team

**Tailoré E-Commerce Project**  
Service-Oriented Architecture - 2026

**Integration Service by**: Florecita Natawirya  
**Catalog Service by**: [Nama Anggota 2]  
**Order Service by**: [Nama Anggota 3]

---

## 📝 Kesimpulan

Proyek ini berhasil mengintegrasikan Catalog & Order service dengan:
- ✅ 2-Phase Commit untuk data consistency
- ✅ JWT authentication & role-based access
- ✅ Client-side cart dengan localStorage
- ✅ Responsive UI dengan modern design
- ✅ Production deployment

**Future Work**: WebSocket notifications, payment gateway, mobile app.

---

**Last Updated**: January 7, 2026  
**Version**: 1.0.0
