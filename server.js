const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('🔧 Tailore Integration Service Starting...'); 


// URL WEBSITE YANG SUDAH ONLINE
const CATALOG_URL = 'https://ooga.queenifyofficial.site/api';
const ORDER_URL = 'https://cimol.queenifyofficial.site/api';

console.log('📡 Connected APIs:');
console.log('   - Catalog API:', CATALOG_URL);
console.log('   - Order API:', ORDER_URL);

// --- API CHECKOUT (Jembatan ke Ooga & Cimol) ---
app.post('/api/checkout', async (req, res) => {
    const { items, customerName } = req.body;
    const userToken = req.headers.authorization; 

    console.log('\n🛒 === CHECKOUT REQUEST RECEIVED ===');
    console.log('Customer:', customerName);
    console.log('Items count:', items?.length);
    console.log('Items:', JSON.stringify(items, null, 2));
    console.log('Token:', userToken ? 'Present' : 'Missing');

    // Cek Token Login dari Ooga
    if (!userToken) {
        console.log('❌ No token provided');
        return res.status(401).json({ success: false, message: "Harap login dulu!" });
    }
    if (!items || items.length === 0) {
        console.log('❌ Cart is empty');
        return res.status(400).json({ success: false, message: "Keranjang kosong!" });
    }

    const createdOrderIds = [];
    let currentStep = '';

    try {
        console.log(`\n📦 Processing ${items.length} items for: ${customerName}`);

        // STEP 1: Loop ke Ooga (Kunci Stok)
        currentStep = 'RESERVE_STOCK';
        console.log('\n🔒 STEP 1: Reserving stock...');
        for (const item of items) {
            console.log(`  - Product ${item.productId}: Fetching price...`);
            const productRes = await axios.get(`${CATALOG_URL}/catalog/products/${item.productId}`);
            item.price = productRes.data.data.retail_price; 
            item.totalPrice = item.price * item.quantity;
            console.log(`  - Product ${item.productId}: Price = ${item.price}, Total = ${item.totalPrice}`);

            console.log(`  - Product ${item.productId}: Reserving ${item.quantity} units...`);
            await axios.post(
                `${CATALOG_URL}/inventory/stock/${item.productId}/reserve`,
                { quantity: parseInt(item.quantity) },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            console.log(`  ✅ Stock reserved for product ${item.productId}`);
        }

        // STEP 2: Loop ke Cimol (Simpan Order)
        currentStep = 'CREATE_ORDER';
        console.log('\n💾 STEP 2: Creating orders in Cimol...');
        for (const item of items) {
            const orderData = {
                customer_name: customerName,
                product_id: item.productId,
                quantity: parseInt(item.quantity),
                total_price: item.totalPrice
            };
            
            console.log(`  - Creating order:`, JSON.stringify(orderData, null, 2));
            
            const orderRes = await axios.post(
                `${ORDER_URL}/orders`,
                orderData,
                { headers: { 'x-secret-key': 'rahasia123' } }
            );
            
            console.log(`  - Order response:`, JSON.stringify(orderRes.data, null, 2));
            
            const orderId = orderRes.data.order_id || orderRes.data.data?.id || orderRes.data.id;
            if (orderId) {
                createdOrderIds.push(orderId);
                console.log(`  ✅ Order created with ID: ${orderId}`);
            } else {
                console.log(`  ⚠️ Order created but no ID returned:`, orderRes.data);
            }
        }

        // STEP 3: Loop ke Ooga (Commit Stok/Finalisasi)
        currentStep = 'COMMIT_STOCK';
        console.log('\n✅ STEP 3: Committing stock...');
        for (const item of items) {
            console.log(`  - Committing ${item.quantity} units for product ${item.productId}...`);
            await axios.post(
                `${CATALOG_URL}/inventory/stock/${item.productId}/commit`,
                { quantity: parseInt(item.quantity) },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            console.log(`  ✅ Stock committed for product ${item.productId}`);
        }

        console.log('\n🎉 CHECKOUT SUCCESS!');
        console.log('Created order IDs:', createdOrderIds);

        res.status(200).json({
            success: true,
            message: "Transaksi Berhasil!",
            invoices: createdOrderIds.map(id => `#ORD-${id}`)
        });

    } catch (error) {
        console.error(`\n❌ CHECKOUT FAILED at step: ${currentStep}`);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Full error:', error);
        
        // Rollback jika ada error (release reserved stock)
        // Note: Implementasi rollback bisa ditambahkan di sini jika diperlukan
        
        res.status(500).json({
            success: false,
            message: "Transaksi Gagal. Silakan coba lagi.",
            error: error.response?.data?.message || error.message
        });
    }
});

// --- API GET ORDERS BY CUSTOMER (Proxy to Cimol with filter) ---
app.get('/api/orders/:customerName', async (req, res) => {
    const { customerName } = req.params;
    
    try {
        console.log(`📋 Fetching orders for: ${customerName}`);
        
        // Get all orders from Cimol
        const ordersRes = await axios.get(`${ORDER_URL}/orders`, {
            headers: { 'x-secret-key': 'rahasia123' }
        });
        
        console.log(`📦 Total orders from Cimol: ${ordersRes.data.data?.length || 0}`);
        
        // Filter orders by customer name
        const filteredOrders = ordersRes.data.data?.filter(order => 
            order.customer_name === customerName
        ) || [];
        
        console.log(`✅ Filtered orders for ${customerName}: ${filteredOrders.length}`);
        
        res.status(200).json({
            success: true,
            data: filteredOrders
        });
        
    } catch (error) {
        console.error("❌ Failed to fetch orders:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(50));
    console.log('🚀 Tailore Integration Service READY!');
    console.log('📍 URL: http://localhost:' + PORT);
    console.log('='.repeat(50));
    console.log('');
});