# GDIP API Reference

Complete API documentation for the Glotrade Distribution/Trusted Insured Partners platform.

**Base URL:** `http://localhost:5000/api/gdip` (development)

**Authentication:** All endpoints require JWT Bearer token in Authorization header.

---

## Partner Endpoints

### 1. Purchase TPIA

Create a new TPIA investment block.

**Endpoint:** `POST /tpia/purchase`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "commodityType": "Rice",
  "profitMode": "TPM",
  "quantity": 3
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| commodityType | string | Yes | Type of commodity (Rice, Sugar, Wheat, Corn, Soybeans) |
| profitMode | string | No | TPM (compounding) or EPS (withdrawal). Default: TPM |
| quantity | number | No | Number of TPIA blocks to purchase (1-10). Default: 1 |
| purchasePrice | number | No | Investment amount per block. Default: 1000000 |

**Response (201):**
```json
{
  "success": true,
  "message": "Successfully purchased TPIA-1",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "tpiaId": "TPIA-1",
    "tpiaNumber": 1,
    "partnerId": "507f1f77bcf86cd799439012",
    "partnerName": "ABC Company",
    "partnerEmail": "partner@example.com",
    "gdcId": "507f1f77bcf86cd799439013",
    "gdcNumber": 10,
    "positionInGDC": 1,
    "purchasePrice": 1000000,
    "currentValue": 1000000,
    "totalProfitEarned": 0,
    "compoundedValue": 0,
    "profitMode": "TPM",
    "status": "pending",
    "cyclesCompleted": 0,
    "insuranceCertificateNumber": "TPIA-1-8472619305847",
    "insuranceStatus": "pending",
    "commodityType": "Rice",
    "commodityQuantity": 0,
    "commodityUnit": "bags",
    "purchasedAt": "2025-12-25T14:00:00.000Z",
    "createdAt": "2025-12-25T14:00:00.000Z",
    "updatedAt": "2025-12-25T14:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Unauthorized (invalid/missing token)
- `400` - Missing commodity type
- `500` - Insufficient wallet balance / Server error

---

### 2. Get Portfolio

Retrieve complete portfolio summary and all TPIAs.

**Endpoint:** `GET /portfolio`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTPIAs": 5,
      "totalInvested": 5000000,
      "currentValue": 5475000,
      "totalProfitEarned": 475000,
      "activeCycles": 2,
      "tpiasByStatus": {
        "pending": 0,
        "active": 5,
        "matured": 0,
        "suspended": 0
      },
      "tpiasByMode": {
        "TPM": 3,
        "EPS": 2
      },
      "gdcs": 1
    },
    "tpias": [
      {
        "_id": "...",
        "tpiaId": "TPIA-1",
        "tpiaNumber": 1,
        "gdcNumber": 10,
        "purchasePrice": 1000000,
        "currentValue": 1095000,
        "totalProfitEarned": 95000,
        "profitMode": "TPM",
        "status": "active",
        "cyclesCompleted": 1
      }
      // ... more TPIAs
    ]
  }
}
```

---

### 3. Get All TPIAs

Retrieve all TPIAs owned by the partner.

**Endpoint:** `GET /tpias`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "tpiaId": "TPIA-1",
      "tpiaNumber": 1,
      "partnerName": "ABC Company",
      "gdcNumber": 10,
      "positionInGDC": 1,
      "purchasePrice": 1000000,
      "currentValue": 1095000,
      "totalProfitEarned": 95000,
      "profitMode": "TPM",
      "status": "active",
      "cyclesCompleted": 1,
      "insuranceCertificateNumber": "TPIA-1-8472619305847",
      "commodityType": "Rice",
      "purchasedAt": "2025-12-25T14:00:00.000Z"
    }
    // ... more TPIAs
  ]
}
```

---

### 4. Get TPIA Details

Retrieve detailed information for a specific TPIA including GDC, insurance, and current cycle.

**Endpoint:** `GET /tpia/:tpiaId`

**Headers:**
```
Authorization: Bearer {token}
```

**Parameters:**
| Field | Type | Location | Description |
|-------|------|----------|-------------|
| tpiaId | string | Path | TPIA MongoDB ObjectId |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tpia": {
      "_id": "...",
      "tpiaId": "TPIA-1",
      "tpiaNumber": 1,
      "partnerName": "ABC Company",
      "gdcId": "...",
      "gdcNumber": 10,
      "positionInGDC": 1,
      "purchasePrice": 1000000,
      "currentValue": 1095000,
      "totalProfitEarned": 95000,
      "compoundedValue": 95000,
      "profitMode": "TPM",
      "status": "active",
      "cyclesCompleted": 1,
      "insuranceCertificateNumber": "TPIA-1-8472619305847",
      "commodityType": "Rice",
      "commodityQuantity": 10,
      "commodityUnit": "bags"
    },
    "gdc": {
      "_id": "...",
      "gdcId": "GDC-10",
      "gdcNumber": 10,
      "currentFill": 10,
      "capacity": 10,
      "isFull": true,
      "status": "active",
      "cyclesCompleted": 1,
      "totalProfitGenerated": 950000,
      "averageROI": 9.5
    },
    "insurance": {
      "_id": "...",
      "certificateNumber": "TPIA-1-8472619305847",
      "provider": "Default Insurance Provider",
      "coverageAmount": 1000000,
      "status": "active",
      "effectiveDate": "2025-12-25T14:00:00.000Z",
      "expiryDate": "2026-12-25T14:00:00.000Z"
    },
    "currentCycle": {
      "_id": "...",
      "cycleId": "CYCLE-2",
      "cycleNumber": 2,
      "startDate": "2026-02-02T00:00:00.000Z",
      "endDate": "2026-03-11T00:00:00.000Z",
      "status": "active",
      "targetProfitRate": 5
    }
  }
}
```

---

### 5. Get GDC Details

Retrieve GDC information with all TPIAs and recent cycles.

**Endpoint:** `GET /gdc/:gdcId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "gdc": {
      "_id": "...",
      "gdcId": "GDC-10",
      "gdcNumber": 10,
      "capacity": 10,
      "currentFill": 10,
      "isFull": true,
      "status": "active",
      "totalCapital": 10000000,
      "totalProfitGenerated": 950000,
      "averageROI": 9.5,
      "cyclesCompleted": 1,
      "primaryCommodity": "Rice"
    },
    "tpias": [
      // Array of 10 TPIAs in this GDC
    ],
    "recentCycles": [
      // Last 10 trade cycles
    ]
  }
}
```

---

### 6. Switch Profit Mode

Change TPIA profit distribution mode between TPM and EPS.

**Endpoint:** `PUT /tpia/:tpiaId/profit-mode`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "profitMode": "EPS"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| profitMode | string | Yes | TPM or EPS |

**Response (200):**
```json
{
  "success": true,
  "message": "Profit mode switched to EPS",
  "data": {
    "_id": "...",
    "tpiaId": "TPIA-1",
    "profitMode": "EPS"
    // ... full TPIA object
  }
}
```

---

### 7. Get TPIA Cycles

Retrieve trade cycle history for a specific TPIA.

**Endpoint:** `GET /tpia/:tpiaId/cycles`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 10 | Number of cycles to return |

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "cycleId": "CYCLE-2",
      "cycleNumber": 2,
      "gdcNumber": 10,
      "startDate": "2026-02-02T00:00:00.000Z",
      "endDate": "2026-03-11T00:00:00.000Z",
      "status": "active",
      "totalCapital": 10950000,
      "targetProfitRate": 5,
      "totalProfitGenerated": 0
    },
    {
      "_id": "...",
      "cycleId": "CYCLE-1",
      "cycleNumber": 1,
      "gdcNumber": 10,
      "startDate": "2025-12-26T00:00:00.000Z",
      "endDate": "2026-02-01T00:00:00.000Z",
      "status": "completed",
      "totalCapital": 10000000,
      "targetProfitRate": 5,
      "actualProfitRate": 9.5,
      "totalProfitGenerated": 950000,
      "roi": 9.5,
      "profitDistributed": true
    }
  ]
}
```

---

### 8. Get Forming GDC

Retrieve the cluster that is currently being filled.

**Endpoint:** `GET /forming-gdc`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694d6632cebc33169c82f382",
    "gdcNumber": 10,
    "capacity": 10,
    "currentFill": 4,
    "isFull": false,
    "status": "forming"
  }
}
```

---

## Admin Endpoints

All admin endpoints require admin role in addition to authentication.

### 8. Create Trade Cycle

Manually create a new trade cycle for a GDC.

**Endpoint:** `POST /admin/cycle/create`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "gdcId": "507f1f77bcf86cd799439013",
  "commodityType": "Rice",
  "commodityQuantity": 100,
  "purchasePrice": 9500000,
  "startDate": "2025-12-26T00:00:00.000Z"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gdcId | string | Yes | GDC MongoDB ObjectId |
| commodityType | string | Yes | Commodity type |
| commodityQuantity | number | Yes | Quantity to trade |
| purchasePrice | number | Yes | Commodity purchase cost |
| startDate | string | No | ISO date. Default: now |

**Response (201):**
```json
{
  "success": true,
  "message": "Trade cycle created successfully",
  "data": {
    "_id": "...",
    "cycleId": "CYCLE-1",
    "cycleNumber": 1,
    "gdcId": "...",
    "gdcNumber": 10,
    "tpiaIds": [...],
    "tpiaCount": 10,
    "startDate": "2025-12-26T00:00:00.000Z",
    "endDate": "2026-02-01T00:00:00.000Z",
    "duration": 37,
    "status": "scheduled",
    "totalCapital": 10000000,
    "targetProfitRate": 5,
    "commodityType": "Rice",
    "commodityQuantity": 100,
    "purchasePrice": 9500000
  }
}
```

---

### 9. Complete Trade Cycle

Mark a cycle as complete with profit/loss results.

**Endpoint:** `POST /admin/cycle/:cycleId/complete`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "salePrice": 10500000,
  "tradingCosts": 50000
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| salePrice | number | Yes | Revenue from commodity sale |
| tradingCosts | number | No | Additional costs. Default: 0 |

**Response (200):**
```json
{
  "success": true,
  "message": "Trade cycle completed successfully",
  "data": {
    "_id": "...",
    "cycleId": "CYCLE-1",
    "status": "processing",
    "salePrice": 10500000,
    "tradingCosts": 50000,
    "totalProfitGenerated": 950000,
    "actualProfitRate": 9.5,
    "roi": 9.5,
    "performanceRating": "excellent"
  }
}
```

---

### 10. Distribute Profits

Distribute cycle profits to TPIA holders based on their profit modes.

**Endpoint:** `POST /admin/cycle/:cycleId/distribute`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profits distributed successfully"
}
```

**Side Effects:**
- TPM TPIAs: `currentValue` and `compoundedValue` increased
- EPS TPIAs: Wallet credited, transaction created
- All TPIAs: `totalProfitEarned` and `cyclesCompleted` updated
- GDC: `cyclesCompleted` and `totalProfitGenerated` updated
- Cycle: `status` changed to "completed", `profitDistributed` set to true

---

### 11. Get All GDCs

Retrieve all GDCs (admin view).

**Endpoint:** `GET /admin/gdcs`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "...",
      "gdcId": "GDC-10",
      "gdcNumber": 10,
      "capacity": 10,
      "currentFill": 10,
      "isFull": true,
      "status": "active",
      "totalCapital": 10000000,
      "cyclesCompleted": 5,
      "averageROI": 7.2
    }
    // ... more GDCs
  ]
}
```

---

### 12. Get All TPIAs

Retrieve all TPIAs (admin view) with optional status filter.

**Endpoint:** `GET /admin/tpias`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| status | string | Filter by status (pending/active/matured/suspended) |

**Response (200):**
```json
{
  "success": true,
  "count": 150,
  "data": [
    // Array of all TPIAs
  ]
}
```

---

### 13. Get All Cycles

Retrieve all trade cycles (admin view) with optional status filter.

**Endpoint:** `GET /admin/cycles`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| status | string | Filter by status (scheduled/active/processing/completed/failed/cancelled) |

**Response (200):**
```json
{
  "success": true,
  "count": 75,
  "data": [
    // Array of all trade cycles
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden (Admin endpoints):**
```json
{
  "error": "Admin access required"
}
```

**400 Bad Request:**
```json
{
  "error": "Missing required fields"
}
```

**404 Not Found:**
```json
{
  "error": "TPIA not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to purchase TPIA"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:
- 100 requests per minute per user
- 1000 requests per minute for admin

---

## Webhooks (Future)

Planned webhook events:
- `tpia.purchased` - New TPIA created
- `cycle.completed` - Trade cycle finished
- `profit.distributed` - Profits sent to partners
- `gdc.filled` - GDC reached capacity

---

## Changelog

### v1.0.0 (2025-12-25)
- Initial release
- 13 endpoints (7 partner + 6 admin)
- Full CRUD for TPIAs, GDCs, and Cycles
- Automated profit distribution

---

**Support:** For API issues, contact technical support or check logs.
