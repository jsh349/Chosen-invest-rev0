# mvp-data-model.md

## Purpose

Define the minimum data model for the Chosen-invest MVP.

This document covers:
- core MVP entities
- the minimum fields needed for Version 1
- relationships between entities
- boundaries between MVP data and future data

Do not treat this as a final database schema.
This is a product-level MVP data model.

---

## Data Model Rules

- Define only the minimum data needed for Version 1
- Do not add advanced entities before they are needed
- Keep the model understandable and expandable
- Separate user input data from derived summary data
- Separate real user-entered data from future simulated or AI-generated data

---

## MVP Data Scope

Version 1 needs data for:

- user identity
- manual asset input
- asset categorization
- dashboard summary
- asset allocation chart
- AI asset summary
- financial health cards

Version 1 does not require full support for:
- linked institutions
- transactions
- backtesting
- alerts
- goals
- reports
- advanced AI personalization

---

## Core Entities

### 1. User

Represents the account owner.

Minimum fields:
- `id`
- `email`
- `displayName`
- `createdAt`
- `updatedAt`

Notes:
- Version 1 only needs enough data to identify and separate each user's data
- advanced profile settings can come later

---

### 2. Asset

Represents one manually entered asset item.

Minimum fields:
- `id`
- `userId`
- `name`
- `category`
- `value`
- `currency`
- `createdAt`
- `updatedAt`

Recommended category examples:
- cash
- stock
- etf
- crypto
- retirement
- real_estate
- other

Notes:
- Version 1 uses manual input only
- this entity should remain simple
- liability is not required in the first MVP unless explicitly added later

---

### 3. AssetCategory

Represents the normalized category definition used for grouping and charting.

Minimum fields:
- `key`
- `label`
- `sortOrder`

Notes:
- can be static in Version 1
- does not need to be user-editable yet

---

### 4. PortfolioSummary

Represents derived summary data calculated from current user assets.

Minimum fields:
- `userId`
- `totalAssetValue`
- `assetCount`
- `categoryBreakdown`
- `generatedAt`

Notes:
- this is derived data, not primary input data
- can be computed on demand in Version 1
- may later become cached or persisted if needed

---

### 5. AllocationSlice

Represents one category slice used in the asset allocation chart.

Minimum fields:
- `category`
- `label`
- `value`
- `percentage`

Notes:
- this may be stored inside `PortfolioSummary.categoryBreakdown`
- can also be treated as a derived structure instead of a separate table/entity

---

### 6. AIAnalysisResult

Represents AI-generated summary text for the current portfolio state.

Minimum fields:
- `userId`
- `summaryText`
- `inputSnapshot`
- `generatedAt`

Notes:
- this is generated from current portfolio data
- Version 1 only needs a simple summary result
- no conversation history is required yet
- no personalized memory is required yet

---

### 7. FinancialHealthCard

Represents one diagnosis-style card shown on the dashboard.

Minimum fields:
- `key`
- `title`
- `status`
- `message`
- `score`
- `generatedAt`

Example card types:
- diversification
- concentration
- liquidity
- simplicity
- balance

Notes:
- these are derived insights, not raw user data
- cards can be generated from portfolio summary rules
- score format can remain simple in Version 1

---

## Relationships

### User → Asset
One user can have many assets.

### Asset → AssetCategory
Each asset belongs to one category.

### User → PortfolioSummary
One user has one current summary view at a time.

### PortfolioSummary → AllocationSlice
One summary contains multiple allocation slices.

### User → AIAnalysisResult
One user can have one current summary result for Version 1.

### User → FinancialHealthCard
One user can have multiple diagnosis cards in the current dashboard state.

---

## Source of Truth Rules

### Primary Input Data
- User
- Asset

These are the main source-of-truth entities for Version 1.

### Derived Data
- PortfolioSummary
- AllocationSlice
- AIAnalysisResult
- FinancialHealthCard

These should be generated from primary input data.

Do not treat derived data as primary user-edited data.

---

## Version 1 Calculation Boundary

Version 1 calculations should stay simple.

Allowed:
- total asset value
- asset count
- category grouping
- category percentage
- simple AI explanation
- simple diagnosis scoring

Not required yet:
- transaction history
- realized/unrealized gains
- tax logic
- benchmark comparison
- return history
- performance attribution
- forecast engine

---

## Suggested Type Shapes

### User
```ts
type User = {
  id: string
  email: string
  displayName?: string
  createdAt: string
  updatedAt: string
}