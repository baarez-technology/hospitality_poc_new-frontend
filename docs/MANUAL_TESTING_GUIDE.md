# Glimmora PMS — Manual Frontend Testing Guide

> **Login**: `admin@glimmora.com` / `admin123`
> **Frontend**: `http://localhost:5173`
> **Backend**: `http://localhost:8000` (must be running)

---

## Important: Navigation Note

Several Sprint 7-9 pages are registered in the router but **not yet visible in the sidebar**.
You must navigate to them via **direct URL** (paste into browser address bar).
Pages accessible from sidebar are marked with (Sidebar). Others are marked with (URL Only).

---

## Pre-Test Setup

1. Start backend: `cd glimmora-backend && uvicorn app.main:app --reload --port 8000`
2. Start frontend: `cd glimmora-frontend && npm run dev`
3. Open `http://localhost:5173` and login as admin
4. Verify admin dashboard loads at `/admin`

---

## SPRINT 1 — Hotel Config, Business Date & Taxes

### T1.1 — Business Date Badge (Sidebar)
1. Login as admin
2. Look at the **top bar** — an amber badge should show the current business date (e.g., "2026-03-01")
3. If no business date is configured, it may show today's date

### T1.2 — Tax Configuration (Sidebar)
1. Go to `/admin/settings` → **Property** tab → **Taxes & Fees** sub-tab
2. Verify tax categories are listed (or empty state if none exist)
3. Click **"Seed India GST"** button (if available) to populate default GST slabs
4. Verify categories appear: Accommodation, Food & Beverage, etc.
5. Expand a category → verify tax slabs show (e.g., 0-1000 = 0%, 1001-2500 = 12%, etc.)
6. Verify CGST/SGST split percentages are displayed

### T1.3 — Room Types (Sidebar)
1. In Settings → Property → **Room Types** sub-tab
2. Verify room types are listed with base_price
3. Edit a room type base_price → Save → verify it persists on refresh

---

## SPRINT 2 — Night Audit & Room Charge Posting

### T2.1 — Night Audit Page (URL Only)
1. Navigate to **`/admin/night-audit`**
2. Verify the page loads showing:
   - Current Business Date card with the date
   - Audit cutoff time (e.g., 03:00) with an "Edit" link
   - Pre-Audit Checklist (pending departures count, next business date)
3. Click **"Edit"** next to cutoff → change the time → Save → verify it updates

### T2.2 — Run Night Audit
**Prerequisites**: At least 1 booking must be in "checked_in" status
1. On Night Audit page, click **"Run Night Audit"**
2. Confirm the modal appears listing what will happen (4 steps)
3. Click **"Confirm & Run"**
4. Wait for audit to complete
5. Verify **Audit Results** section appears with:
   - Success banner (green)
   - Metrics grid: New Business Date, Charges Posted, Revenue, Occupancy
   - Detail rows: In-house count, arrivals, departures
6. If errors occurred: verify Charge Posting Errors section shows (red box)
7. Verify the business date badge in topbar advanced by 1 day

---

## SPRINT 3 — Corporate Accounts & AR Ledger

### T3.1 — Corporate Accounts (URL Only)
1. Navigate to **`/admin/corporate-accounts`**
2. Page loads with table (may be empty)
3. Click **"Add Account"** → fill in:
   - Company Name: "Test Corp"
   - Contact Name: "John Doe"
   - Email: "john@testcorp.com"
   - Credit Limit: 50000
4. Click **Create** → verify toast "Account created"
5. Verify new row appears in table
6. Click **Edit** icon → change credit limit to 100000 → Save
7. Click **Delete** icon → confirm → verify row removed

### T3.2 — AR Ledger (URL Only)
1. Navigate to **`/admin/ar-ledger`**
2. Page loads showing AR accounts (linked to corporate accounts)
3. If a corporate account exists with AR balance:
   - Click on an account row → verify postings/transactions are shown
   - Check aging report section (30/60/90 day buckets)

### T3.3 — BTC (Bill to Company) Settlement
**Prerequisites**: Corporate account exists, booking with open folio
1. Go to `/admin/bookings` → find a checked-in booking
2. Open the booking → click **"Payment"** from dropdown menu
3. In FolioDrawer, with a balance > 0, click **"Settle & Pay"**
4. In the dropdown, click **"Bill to Company (BTC)"** (only shown if corporate accounts exist)
5. Select a corporate account from dropdown
6. Click **"Confirm BTC Settlement"**
7. Verify toast "Folio settled via BTC — charges posted to AR"
8. Navigate to `/admin/ar-ledger` → verify new posting appears

---

## SPRINT 4 — Billing UI Enhancements

### T4.1 — Per-Night Charge Breakdown in Folio
1. Go to `/admin/bookings` → find a checked-in booking (multi-night preferred)
2. Open FolioDrawer via **"Payment"** action
3. In **Charges** tab, look for a "By Date" toggle
4. Toggle to "By Date" view → verify room charges are grouped per night with date headers
5. Each room charge row should show CGST and SGST tax columns

### T4.2 — Avg Rate/Night KPI
1. In the same FolioDrawer, look at the **Summary Card** (top of drawer)
2. Verify 4th KPI shows "Avg Rate/Night" = sum(room_charges) / nights
3. This KPI only appears when room charges exist

### T4.3 — Checkout Gate (Folio Balance Check)
1. Find a checked-in booking with **unpaid balance** on the folio
2. From BookingsTable, click **"Check Out"** from dropdown
3. Verify a **CheckoutDialog** appears (NOT a plain window.confirm)
4. Dialog should show per-folio balances with "Open Folio" button
5. Click **"Open Folio"** → verify FolioDrawer opens
6. Close FolioDrawer → try checkout again with **"Force Checkout"** option if available

---

## SPRINT 5 — Pre-Auth Holds, Invoice & Reinstate

### T5.1 — Pre-Authorization Holds Page (URL Only)
1. Navigate to **`/admin/preauth-holds`**
2. Page loads with table (may be empty)
3. Click **"New Hold"** → enter:
   - Booking ID: (a valid checked-in booking ID)
   - Leave Hold Amount blank (auto-calculated from config)
   - Card Last 4: 1234
   - Card Brand: Visa
4. Click **"Create Hold"** → verify toast "Hold created"
5. Verify new row appears with status "authorized", auth code (AUTH-XXXXXXXX), and amount
6. Verify **"Capture"** and **"Release"** buttons appear for authorized holds

### T5.2 — Capture a Hold
1. On an authorized hold, click **"Capture"**
2. Capture modal shows auth code and max amount
3. Enter capture amount (<=hold amount) → click **"Capture"**
4. Verify toast "Hold captured" and status changes to "captured"

### T5.3 — Release a Hold
1. On another authorized hold, click **"Release"**
2. Confirm the dialog → verify toast "Hold released"
3. Status changes to "released", action buttons disappear

### T5.4 — Pre-Auth Holds Filtering
1. Use the **Status** dropdown filter → select "Authorized" → verify only authorized holds show
2. Use the **Search** box → type a booking ID → verify filtering works

### T5.5 — Print / Copy of Folio
1. Open FolioDrawer on any booking with a folio
2. In the footer, find the **Printer icon** button
3. Click it → verify toast shows "Original generated" (first time) or "Copy of Folio (#N)" (subsequent)

### T5.6 — Reinstate No-Show / Cancelled Booking
1. Go to `/admin/bookings`
2. Find a booking with status **"No Show"** or **"Cancelled"**
   - (If none exist: find a confirmed booking with past arrival date → Mark No Show first)
3. Click the three-dot menu → verify **"Reinstate"** button appears (blue, RotateCcw icon)
4. Click **"Reinstate"** → confirm dialog
5. Verify toast "booking reinstated" and status changes to "CONFIRMED"

### T5.7 — Rate Check Report (URL Only)
1. Navigate to **`/admin/rate-check`**
2. Page loads showing a table of checked-in bookings with rate comparison
3. Verify **Summary Cards**: Checked-In count, Matches, Discounts, Surcharges, Avg Variance
4. Table columns: Booking#, Guest, Room, Type, Nights, Actual Rate, Std Rate, Variance, %, Flag
5. Flag badges: green "match", amber "discount", red "surcharge"
6. Use **Flag Filter** dropdown → select "discount" → verify only discount rows show
7. Use **Search** → type a guest name → verify filtering works
8. Click **"Refresh"** button → verify data reloads

---

## SPRINT 6 — Booking, Guest & Room Enhancements

### T6.1 — Booking Date Range Filters
1. Go to `/admin/bookings`
2. Check if date range filter inputs exist in the filters bar
3. Set an arrival date range → verify bookings filter correctly

### T6.2 — VIP Levels (1-5)
1. Go to `/admin/guests` → find or create a guest
2. Open guest profile → look for VIP level field (1-5 scale)
3. Set VIP level to 3 → Save
4. Go back to Bookings → verify VIP crown icon appears next to the guest name

### T6.3 — ETA/ETD on Bookings
1. Go to `/admin/bookings` → switch to **"Arrivals"** tab
2. Verify an **ETA** column appears with time values
3. Switch to **"Departures"** tab → verify **ETD** column appears

### T6.4 — Room Status Filters in Assign Modal
1. Find an unassigned booking → click **"Assign Room"** from dropdown
2. In the Assign Room modal, verify room status filters are available
3. Filter by available/clean rooms → verify list updates

---

## SPRINT 7A — Payment Methods & Transaction Codes

### T7.1 — UPI/NEFT/NetBanking Payment Methods
1. Open FolioDrawer for a booking with balance
2. Click **"Settle & Pay"** → verify dropdown includes:
   - Card, Cash, Bank Transfer, **UPI**, **NEFT**, **Net Banking**
3. Click **"UPI"** → confirm → verify settlement succeeds

### T7.2 — Transaction Codes Page (URL Only)
1. Navigate to **`/admin/transaction-codes`**
2. Page loads (may be empty initially)
3. Click **"Seed Defaults"** → verify toast "Default codes seeded"
4. Verify table populates with ~36 transaction codes (1000=Room, 2000=Minibar, etc.)
5. Verify columns: Code, Name, Type (badge), Category, Department, Adj. Code, Active, Sort
6. Use **Type filter** → select "payment" → verify only payment codes show
7. Use **Search** → type "Room" → verify filtering works
8. Click **"Add Code"** → fill:
   - Code: 9999
   - Name: Test Code
   - Type: charge
   - Category: test
9. Click **Create** → verify row appears
10. Click **Edit** icon → change name → **Update** → verify change persists
11. Click **Delete** icon → confirm → verify row removed

---

## SPRINT 7B — Cashier Sessions

### T7.3 — Cashier Sessions Page (URL Only)
1. Navigate to **`/admin/cashier-sessions`**
2. Page loads with summary cards at top (Open Sessions, Total Cash, Flagged)
3. Click **"Open Session"** → enter Opening Balance: 5000 → **Open**
4. Verify toast "Session opened" and new row appears with status "open" (green)
5. Click **"Record Cash"** action → enter Amount: 1500, Type: cash_in, Notes: "Guest payment"
6. Verify toast "Cash recorded"
7. Click **"Close Session"** → enter Closing Balance: 6400 → **Close**
8. Verify:
   - Status changes to "closed" (gray)
   - Variance column shows difference (Expected: 6500, Actual: 6400, Variance: -100)
   - If variance > threshold, "variance_flagged" status appears (red)

### T7.3a — Cashier Session Filters
1. Use **Status** filter → select "open" → verify only open sessions show
2. Use **Status** filter → select "closed" → verify only closed sessions show

---

## SPRINT 7C — Room Moves

### T7.4 — Room Moves Page (URL Only)
**Prerequisites**: At least 1 checked-in booking
1. Navigate to **`/admin/room-moves`**
2. Page loads with table (may be empty) and "Schedule Move" button
3. Click **"Schedule Move"** → fill:
   - Booking ID: (a checked-in booking's ID)
   - To Room ID: (a valid room ID)
   - Move Date: tomorrow's date
   - Reason: "Guest request"
4. Click **Create** → verify toast "Room move scheduled" and row appears
5. Verify columns: Booking#, Guest, From Room, To Room, Date, Reason, Status ("scheduled")
6. Click **"Execute"** button → verify status changes to "completed"
7. Schedule another move → click **"Cancel"** → verify status changes to "cancelled"
8. Use **Status filter** → select "completed" → verify only completed moves show

---

## SPRINT 7D — Paymaster Accounts

### T7.5 — Paymaster Accounts Page (URL Only)
1. Navigate to **`/admin/paymaster`**
2. Page loads with accounts table
3. Click **"New Account"** → fill:
   - Account Name: "Disputed Charges"
   - Account Type: "disputed"
   - Notes: "Holding disputed minibar charges"
4. Click **Create** → verify toast and row appears
5. Click on the account row → **detail drawer** opens showing:
   - Account info
   - Postings table (initially empty)
6. In the drawer, look for **"Transfer to Booking"** button → click:
   - Enter Booking ID: (valid booking)
   - Amount: 500
   - Notes: "Resolved dispute"
   - Click **Transfer**
7. Look for **"Write Off"** button → click:
   - Enter Amount: 100
   - Reason: "Uncollectable"
   - Click **Write Off**
8. Verify postings list updates with each action

---

## SPRINT 7E — Cross-Booking Transfer (FolioDrawer)

### T7.6 — Cross-Booking Transfer
**Prerequisites**: 2 bookings with folios, source booking has charges
1. Open FolioDrawer for the source booking (via Bookings → Payment action)
2. In the footer, find the **ArrowRightLeft icon** button (Transfer to Another Booking)
3. Click it → **Cross-Booking Transfer Modal** opens
4. Enter the target booking ID
5. Check 1-2 charge items from the checklist
6. Add optional notes
7. Click **"Transfer N Items"**
8. Verify toast "Charges transferred to booking #X"
9. Open the target booking's FolioDrawer → verify the transferred charges appear there

---

## SPRINT 7F — Guest Bill & Audit

### T7.7 — Guest Bill Modal
**Prerequisites**: A checked-in booking with charges
1. Go to `/admin/bookings` → find a checked-in booking
2. Click three-dot menu → click **"Guest Bill"** (Receipt icon)
3. **GuestBillModal** opens showing:
   - Guest name and booking number
   - Room and stay dates
   - **Charges table**: Date, Description, Folio, Amount, Tax
   - **Payments table**: Date, Method, Reference, Amount
   - **Summary**: Total Charges, Total Tax, Total Payments, Balance Due
4. Click **Print icon** (top right) → browser print dialog opens
5. Click **Close** → modal closes

### T7.8 — Audit Logs Page (URL Only)
1. Navigate to **`/admin/audit-logs`**
2. Page loads with search bar, filters, and table
3. Verify table columns: Timestamp, User, Action, Entity Type, Entity ID, Old Value, New Value, IP
4. JSON cells (Old/New Value) should be expandable/collapsible
5. Use **Entity Type** dropdown filter → select a type → verify filtering
6. Use **Action** filter → verify filtering
7. Click **"Export CSV"** → verify a CSV file downloads
8. Use **Search** bar → type a user email → verify results filter

---

## SPRINT 8A — POS Closure

### T8.1 — POS Closure Page (URL Only)
1. Navigate to **`/admin/pos-closure`**
2. Page loads with business date selector and outlet cards
3. If no outlets exist, click **"Seed Defaults"** → verify 6 outlet cards appear
4. Each outlet card shows: Name, Location, Status badge (pending=amber)
5. For each outlet:
   - Enter Closing Revenue amount
   - Enter Open Checks count (0 if all closed)
   - Add Discrepancy Notes if needed
   - Click **"Confirm"**
6. Verify status badge changes to "confirmed" (green border)
7. After confirming ALL outlets, the page should show all-green state
8. Change the business date → verify a fresh set of pending closures loads

---

## SPRINT 8B — Audit Pack (Sign-Off Chain)

### T8.2 — Audit Pack Page (URL Only)
**Prerequisites**: Night audit must have been run at least once
1. Navigate to **`/admin/audit-pack`**
2. Enter a valid audit date or audit ID in the input field
3. Verify 3-tab layout loads:

**Sign-Off Chain Tab:**
4. Three cards displayed: Duty Manager → General Manager → Finance Controller
5. First pending role shows **"Approve"** and **"Reject"** buttons
6. Click **"Approve"** on Duty Manager → enter comments → confirm
7. Verify Duty Manager card shows "Approved" status with timestamp
8. GM card now becomes actionable → click **"Approve"**
9. Finance Controller card becomes actionable → click **"Approve"**
10. Verify all 3 cards show green "Approved" status

**Pre-Audit Report Tab:**
11. Click "Pre-Audit Report" tab
12. Verify sections load: Room inventory, occupancy snapshot, POS closures, cashier sessions

**Post-Audit Report Tab:**
13. Click "Post-Audit Report" tab
14. Verify sections load: Audit summary, revenue breakdown, payments by method

**Export:**
15. Click **"Export CSV/PDF"** button → verify file downloads

---

## SPRINT 8C — Multi-Room Booking

### T8.3 — Multi-Room Booking Page (URL Only)
1. Navigate to **`/admin/multi-room`**
2. Page has two sections: **Create** and **View Group**

**Create Multi-Room Booking:**
3. In the guest search field, type a guest name → select from autocomplete dropdown
4. Set check-in and check-out dates
5. In the rooms section, first row shows room type dropdown + adults/children fields
6. Click **"Add Room"** → a second room row appears
7. Add a third room
8. Select room types for each
9. Select payment method
10. Click **"Create Booking"** → verify toast "Multi-room booking created"
11. Note the parent booking ID returned

**View Group:**
12. In the "View Group" section, enter the parent booking ID → click **Search**
13. Verify linked bookings table shows all 3 rooms with:
    - Booking#, Room Type, Room#, Status, Adults, Children, Price
14. Click **"Add Room"** to add another room to the group
15. Click **"Cancel"** on one of the individual room bookings
16. Verify that room's status changes to "cancelled" but others remain unaffected

---

## SPRINT 9 — All Frontend Pages

### T9.1 — Verify All Sprint 9 Pages Load Without Crash
Navigate to each URL and verify the page renders:

| # | URL | Expected |
|---|-----|----------|
| 1 | `/admin/audit-logs` | AuditLogs table loads |
| 2 | `/admin/cashier-sessions` | CashierSessions with summary cards |
| 3 | `/admin/room-moves` | RoomMoves table loads |
| 4 | `/admin/pos-closure` | POS Closure card grid |
| 5 | `/admin/paymaster` | Paymaster accounts table |
| 6 | `/admin/audit-pack` | Audit Pack input + tabs |
| 7 | `/admin/multi-room` | Multi-room create + view |
| 8 | `/admin/transaction-codes` | Transaction codes table |
| 9 | `/admin/preauth-holds` | Pre-auth holds table |
| 10 | `/admin/rate-check` | Rate check report table + summary |

### T9.2 — Sidebar Navigation Verification
1. In sidebar, verify **Finance & Audit** category exists with items:
   Night Audit, POS Closure, Audit Pack, Cashier Sessions, Corporate Accounts, AR Ledger, Paymaster, Transaction Codes, Pre-Auth Holds
2. Verify **Operations** category includes: Room Moves
3. Verify **Analytics** category includes: Rate Check
4. Verify **System** category includes: Audit Logs, Multi-Room
5. Click each sidebar item → verify correct page loads

> **Note**: If sidebar still uses hardcoded nav (Sidebar.tsx), these items may not appear.
> In that case, verify via direct URL navigation only. See "Known Issue" at bottom.

---

## EARLIER BUG FIXES — Regression Checks

### R1 — Room Doesn't Disappear After Start Cleaning (BUG-002)
1. Go to `/admin/housekeeping` (housekeeper view)
2. Start cleaning on a room → verify room stays in the list (doesn't vanish)

### R2 — AI Recommended Rooms Clickable (BUG-008)
1. Go to Bookings → find unassigned booking → open Assign Room modal
2. If AI recommendations appear, verify they are **clickable** and selecting one works

### R3 — Technician Assignment Persists (BUG-030)
1. Go to `/admin/maintenance` → create or edit a work order
2. Assign a technician + set estimated completion → Save
3. Reopen the work order → verify technician and estimated completion are still set

### R4 — Guest Notes Save Correctly
1. Go to `/admin/guests` → open a guest profile
2. Add a note → Save → refresh the page → verify note persists

### R5 — Payment Validation Before Checkout
1. Find a checked-in booking with unpaid balance
2. Try to check out → verify CheckoutDialog blocks checkout showing balance info
3. Verify "Force Checkout" option exists but requires explicit confirmation

### R6 — Voice Recorder Delete Button
1. Open any page with voice recorder (if available)
2. Record something → verify **Delete** button appears alongside Save/Cancel

---

## FOLIO DRAWER — Comprehensive Test

### F1 — Full Folio Workflow
1. Create a new booking → check in
2. Open FolioDrawer via **"Payment"** action
3. If no folio → click **"Initialize Folio"**
4. **Post a charge**: Click "Post Charge" → add a minibar charge (100 INR) → Save
5. Verify charge appears in Charges tab with tax columns (CGST/SGST)
6. **Adjust charge**: Click adjust icon → change amount → Save → verify adjustment line appears
7. **Void charge**: Click void icon → confirm → verify charge shows as voided
8. Switch to **Payments** tab → post a cash payment (200 INR) → verify balance updates
9. Switch to **Statement** tab → verify chronological view of all transactions
10. Switch to **Routing** tab → add a routing rule → verify it appears
11. **Settle folio**: Click "Settle & Pay" → select Cash → confirm → verify folio status changes
12. **Print**: Click printer icon → verify "Original generated" toast

### F2 — Cross-Booking Transfer
1. Open FolioDrawer on booking with charges
2. Click transfer icon (ArrowRightLeft) in footer
3. Enter target booking ID + select charges + confirm
4. Verify charges moved to target booking

---

## RBAC — Permission Checks

### P1 — Admin Has Full Access
1. Login as admin@glimmora.com → verify all sidebar categories visible
2. Navigate to Settings → verify full access to all tabs

### P2 — Receptionist Restricted Access
1. Create/login as a receptionist user
2. Verify:
   - Dashboard: visible
   - Bookings: can view + edit
   - Guests: can view + edit
   - Rooms: view only
   - Staff: hidden
   - Housekeeping: hidden
   - Settings: hidden
3. Try navigating to `/admin/settings` → should show Access Denied or redirect

### P3 — Housekeeper Restricted Access
1. Login as housekeeper
2. Verify only Rooms (view), Housekeeping (view+edit), Maintenance (view+edit) accessible

---

## STAFF ONBOARDING — Test Flow

### S1 — Create Staff with Temp Password
1. Go to `/admin/staff` → Add new staff member
2. Fill in work email + personal email + role
3. Save → verify temp password is generated (14 chars, 72h expiry)
4. Logout → login with new staff work email + temp password
5. Verify redirect to **`/set-password`** (forced password reset page)
6. Set new password → verify redirect to admin dashboard

---

## NIGHT AUDIT FULL FLOW — End-to-End

### E1 — Complete Night Audit Cycle
1. Ensure at least 1 checked-in booking exists
2. Go to `/admin/pos-closure` → seed defaults if needed → confirm all outlets
3. Go to `/admin/cashier-sessions` → close all open sessions
4. Go to `/admin/night-audit`:
   - Pre-Audit Checklist should show 0 pending departures (or handle them first)
   - Click "Run Night Audit" → confirm
5. After audit completes:
   - Business date advanced
   - Room charges posted
   - Revenue shown in metrics
6. Go to `/admin/audit-pack` → enter audit date
7. Sign off as Duty Manager → GM → Finance Controller
8. Export the report

---

## Known Issues & Notes

1. **Sidebar drift**: The active `Sidebar.tsx` has hardcoded nav categories that may not include all Sprint 7-9 pages. The `adminNav.ts` file has the complete list but is used by `NewSidebar.tsx` (not currently active). Sprint 7-9 pages may only be reachable via direct URL.

2. **Backend must be running**: All pages make API calls on load. Pages will show error toasts or loading spinners indefinitely if backend is down.

3. **Seeding required**: Transaction Codes, POS Outlets, and Tax Slabs need to be seeded before testing related features. Use the "Seed Defaults" / "Seed India GST" buttons on their respective pages.

4. **Test data dependencies**: Many tests require existing bookings in specific statuses. Create test bookings first:
   - Confirmed booking (for check-in tests)
   - Checked-in booking (for folio, guest bill, checkout, room move, pre-auth tests)
   - No-show/cancelled booking (for reinstate test)
   - Multi-night booking (for per-night charge breakdown test)

5. **`payment_status = "paid"` is optimistic**: Set at booking creation for card payments. Does NOT mean money was actually collected. Use `deposit_amount` for real payment tracking.

---

## Quick URL Reference

| Feature | URL |
|---------|-----|
| Dashboard | `/admin` |
| Bookings | `/admin/bookings` |
| Guests | `/admin/guests` |
| Rooms | `/admin/rooms` |
| Staff | `/admin/staff` |
| Housekeeping | `/admin/housekeeping` |
| Maintenance | `/admin/maintenance` |
| Night Audit | `/admin/night-audit` |
| POS Closure | `/admin/pos-closure` |
| Audit Pack | `/admin/audit-pack` |
| Cashier Sessions | `/admin/cashier-sessions` |
| Corporate Accounts | `/admin/corporate-accounts` |
| AR Ledger | `/admin/ar-ledger` |
| Paymaster | `/admin/paymaster` |
| Transaction Codes | `/admin/transaction-codes` |
| Pre-Auth Holds | `/admin/preauth-holds` |
| Room Moves | `/admin/room-moves` |
| Multi-Room | `/admin/multi-room` |
| Audit Logs | `/admin/audit-logs` |
| Rate Check | `/admin/rate-check` |
| Settings | `/admin/settings` |
| Set Password | `/set-password` |

---

## Test Summary Checklist

| Sprint | Area | Test IDs | Count |
|--------|------|----------|-------|
| 1 | Config, Taxes | T1.1-T1.3 | 3 |
| 2 | Night Audit | T2.1-T2.2 | 2 |
| 3 | Corporate & AR | T3.1-T3.3 | 3 |
| 4 | Billing UI | T4.1-T4.3 | 3 |
| 5 | Pre-Auth, Reinstate | T5.1-T5.7 | 7 |
| 6 | Bookings/Guests/Rooms | T6.1-T6.4 | 4 |
| 7 | Payments, Sessions, Moves | T7.1-T7.8 | 8 |
| 8 | POS, Audit Pack, Multi-Room | T8.1-T8.3 | 3 |
| 9 | Page Load + Nav | T9.1-T9.2 | 2 |
| Regression | Bug Fixes | R1-R6 | 6 |
| Folio | Full Workflow | F1-F2 | 2 |
| RBAC | Permissions | P1-P3 | 3 |
| Staff | Onboarding | S1 | 1 |
| E2E | Night Audit Cycle | E1 | 1 |
| **Total** | | | **48** |
