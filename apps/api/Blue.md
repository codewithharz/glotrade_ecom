// src/models/
- User.ts (buyers/sellers)
- Product.ts (marketplace listings)
- Order.ts (transactions)
- Transaction.ts (blockchain transactions)
- Token.ts (ATH token interactions)

// src/controllers/
- auth.controller.ts
- market.controller.ts
- order.controller.ts
- user.controller.ts
- token.controller.ts

// src/routes/
- auth.routes.ts
- market.routes.ts
- order.routes.ts
- user.routes.ts
- token.routes.ts

// src/services/
- web3.service.ts (blockchain interactions)
- token.service.ts (ATH token operations)
- market.service.ts (marketplace logic)
- auth.service.ts (authentication)



Would you like me to continue with implementing the market and order controllers next? These would handle:

Market Controller:

Product listing management
Search and filtering
Category management
Price tracking

Order Controller:

Order creation and management
Payment processing
Order status updates
Shipping integration



# AfriTrade Hub Token Routes Testing Guide

## Base URL
```
http://localhost:8080/api/v1/tokens
```

## Authentication
Add to protected routes:
```
Headers:
Authorization: Bearer 0x2234567890123456789012345678901234567123
```

## 1. Public Routes

### Get Token Balance
```http
GET /balance/0x2234567890123456789012345678901234567123
```
Expected Response:
```json
{
    "status": "success",
    "data": {
        "available": 1000,
        "staked": 0,
        "delegated": 0,
        "total": 1000,
        "stakingTier": "bronze",
        "rewardMultiplier": 1,
        "lockPeriodEnd": null,
        "isStaking": false,
        "isDelegating": false,
        "isFrozen": false
    }
}
```

## 2. Staking Operations

### Stake Tokens
```http
POST /:address/stake
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
Body:
{
    "amount": 100,
    "lockPeriodDays": 30
}
```

### Unstake Tokens
```http
POST /:address/unstake
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
Body:
{
    "amount": 50
}
```

### Emergency Unstake
```http
POST /:address/emergency-unstake
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
Body:
{
    "amount": 50
}
```

### Get Rewards
```http
GET /:address/rewards
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
```

## 3. Delegation Operations

### Delegate Tokens
```http
POST /:address/delegate
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
Body:
{
    "toAddress": "0x3334567890123456789012345678901234567123",
    "amount": 100
}
```

### Get Delegation Info
```http
GET /:address/delegation-info
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
```

## 4. Vesting Operations

### Get Vesting Details
```http
GET /:address/vesting
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
```

### Set Vesting Schedule (Admin Only)
```http
POST /:address/vesting/schedule
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
Body:
{
    "startDate": "2024-12-07T00:00:00.000Z",
    "endDate": "2025-12-07T00:00:00.000Z",
    "totalAmount": 10000,
    "interval": "monthly"
}
```

## 5. Admin Operations

### Freeze Account
```http
POST /:address/freeze
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
Body:
{
    "reason": "Suspicious activity detected"
}
```

### Unfreeze Account
```http
POST /:address/unfreeze
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
```

### Set Reward Multiplier
```http
POST /:address/set-multiplier
Headers:
    Authorization: Bearer 0x2234567890123456789012345678901234567123
Body:
{
    "multiplier": 2
}
```

## Testing Flow

1. Initial Setup:
   - Check initial balance
   - Verify admin access

2. Staking Flow:
   ```
   1. Get initial balance
   2. Stake tokens
   3. Check updated balance
   4. Check rewards
   5. Try unstaking
   ```

3. Delegation Flow:
   ```
   1. Check initial balance
   2. Delegate tokens
   3. Check delegation info
   4. Verify recipient's balance
   ```

4. Vesting Flow:
   ```
   1. Set vesting schedule (admin)
   2. Check vesting details
   3. Wait and check vested amount
   ```

5. Admin Operations Flow:
   ```
   1. Freeze account
   2. Verify frozen status
   3. Try operations while frozen
   4. Unfreeze account
   5. Verify operations restored
   ```

## Common Error Cases to Test

1. Invalid Address Format
2. Insufficient Balance
3. Rate Limit Exceeded
4. Missing Authorization
5. Invalid Admin Access
6. Frozen Account Operations
7. Invalid Amount Values
8. Missing Required Fields

Would you like me to:
1. Create a Postman collection file?
2. Add more test cases?
3. Include environment variables setup?
4. Add response validation tests?




http://localhost:8080/api/v1/tokens/balance/0x2234567890123456789012345678901234567123

{

  "status": "success",

  "data": {

    "available": 1000,

    "staked": 0,

    "delegated": 0,

    "total": 1000,

    "stakingTier": "bronze",

    "rewardMultiplier": 1,

    "isStaking": false,

    "isDelegating": false,

    "isFrozen": false

  }

}

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/stake

{

    "amount": 100,

    "lockPeriodDays": 30

}

{

  "status": "success",

  "data": {

    "balance": 900,

    "stakedAmount": 100,

    "stakingTier": "bronze",

    "rewardMultiplier": 1,

    "lockPeriodEnd": "2025-01-06T17:35:44.620Z",

    "stakingStartDate": "2024-12-07T17:35:44.620Z",

    "projectedRewards": {

      "daily": 0.03287671232876712,

      "monthly": 0.9863013698630136,

      "yearly": 12

    }

  }

}

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/unstake

{

    "amount": 50

}

{

  "status": "fail",

  "message": "Tokens are locked until Sun Dec 22 2024 18:39:05 GMT+0100 (West Africa Standard Time)"

}

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/emergency-unstake

{

    "amount": 50

}

{

  "status": "success",

  "data": {

    "balance": 845,

    "stakedAmount": 150,

    "penaltyApplied": true,

    "message": "Emergency unstake completed with 10% penalty"

  }

}

this  "penaltyApplied": true, is not showing in db:

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/emergency-unstake

{

    "amount": 50

}

Too many staking operations, please try again later

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/rewards

{

  "status": "success",

  "data": {

    "pendingRewards": 0.0002315799086757991,

    "projectedDaily": 0.03287671232876712,

    "projectedMonthly": 0.9863013698630136,

    "projectedYearly": 12,

    "multiplier": 1,

    "stakingTier": "bronze",

    "totalRewardsClaimed": 0

  }

}

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/delegate

{

    "toAddress": "0x3334567890123456789012345678901234567123",

    "amount": 100

}

{

  "status": "success",

  "data": {

    "delegatedAmount": 0,

    "balance": 1000,

    "transactionCount": 0

  }

}

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/delegation-info

{

  "status": "success",

  "data": {

    "delegatedAmount": 200,

    "delegatedTo": "0x3334567890123456789012345678901234567123",

    "isDelegating": true,

    "lastActivityDate": "2024-12-07T17:49:47.120Z"

  }

}

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/vesting

{

  "status": "success",

  "data": {

    "isVesting": false,

    "message": "No vesting schedule found for this address"

  }

}

http://localhost:8080/api/v1/tokens/0x2234567890123456789012345678901234567123/vesting/schedule

{

    "startDate": "2024-12-07T17:55:00.000Z",

    "endDate": "2025-12-07T18:00:00.000Z",

    "totalAmount": 10000,

    "interval": "monthly"

}

{

  "status": "success",

  "data": {

    "holder": "0x2234567890123456789012345678901234567123",

    "vestingSchedule": {

      "startDate": "2024-12-07T17:55:00.000Z",

      "endDate": "2025-12-07T18:00:00.000Z",

      "totalAmount": 10000,

      "releasedAmount": 0,

      "interval": "monthly"

    },

    "message": "Vesting schedule set successfully"

  }

}

http://localhost:8080/api/v1/tokens/0x3334567890123456789012345678901234567123/freeze

{

    "reason": "Suspicious activity detected"

}

{

  "status": "success",

  "data": {

    "address": "0x3334567890123456789012345678901234567123",

    "frozen": true,

    "reason": "Suspicious activity detected",

    "timestamp": "2024-12-07T17:58:32.306Z"

  }

}

http://localhost:8080/api/v1/tokens/0x3334567890123456789012345678901234567123/unfreeze

{

  "status": "success",

  "data": {

    "address": "0x3334567890123456789012345678901234567123",

    "frozen": false,

    "timestamp": "2024-12-07T18:01:10.139Z"

  }

}

http://localhost:8080/api/v1/tokens/0x3334567890123456789012345678901234567123/set-multiplier

{

    "multiplier": 2

}

{

  "status": "success",

  "data": {

    "address": "0x3334567890123456789012345678901234567123",

    "newMultiplier": 2,

    "stakingTier": "bronze",

    "timestamp": "2024-12-07T18:01:59.917Z"

  }

}

