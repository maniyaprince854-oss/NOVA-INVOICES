-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "billToName" TEXT NOT NULL,
    "billToCompany" TEXT,
    "billToAddress" TEXT,
    "billToCity" TEXT,
    "billToState" TEXT NOT NULL,
    "billToPincode" TEXT,
    "billToGstin" TEXT,
    "billToPan" TEXT,
    "billToMobile" TEXT,
    "placeOfSupply" TEXT NOT NULL,
    "taxMode" TEXT NOT NULL DEFAULT 'AUTO',
    "poNumber" TEXT,
    "transportName" TEXT,
    "vehicleNumber" TEXT,
    "lrNumber" TEXT,
    "dispatchFrom" TEXT,
    "paymentMode" TEXT,
    "notes" TEXT,
    "salesPerson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "discountTotal" REAL NOT NULL DEFAULT 0,
    "freight" REAL NOT NULL DEFAULT 0,
    "loadingCharges" REAL NOT NULL DEFAULT 0,
    "packingCharges" REAL NOT NULL DEFAULT 0,
    "otherCharges" REAL NOT NULL DEFAULT 0,
    "cgstTotal" REAL NOT NULL DEFAULT 0,
    "sgstTotal" REAL NOT NULL DEFAULT 0,
    "igstTotal" REAL NOT NULL DEFAULT 0,
    "roundOff" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL DEFAULT 0,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amountPaid", "balance", "billToAddress", "billToCity", "billToCompany", "billToGstin", "billToMobile", "billToName", "billToPan", "billToPincode", "billToState", "cgstTotal", "companyId", "createdAt", "customerId", "discountTotal", "dispatchFrom", "dueDate", "freight", "grandTotal", "id", "igstTotal", "invoiceDate", "invoiceNumber", "loadingCharges", "lrNumber", "notes", "otherCharges", "packingCharges", "paymentMode", "placeOfSupply", "poNumber", "roundOff", "salesPerson", "sgstTotal", "status", "subtotal", "transportName", "updatedAt", "vehicleNumber") SELECT "amountPaid", "balance", "billToAddress", "billToCity", "billToCompany", "billToGstin", "billToMobile", "billToName", "billToPan", "billToPincode", "billToState", "cgstTotal", "companyId", "createdAt", "customerId", "discountTotal", "dispatchFrom", "dueDate", "freight", "grandTotal", "id", "igstTotal", "invoiceDate", "invoiceNumber", "loadingCharges", "lrNumber", "notes", "otherCharges", "packingCharges", "paymentMode", "placeOfSupply", "poNumber", "roundOff", "salesPerson", "sgstTotal", "status", "subtotal", "transportName", "updatedAt", "vehicleNumber" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE TABLE "new_InvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "hsn" TEXT,
    "qty" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Pcs',
    "rate" REAL NOT NULL,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "taxPercent" REAL NOT NULL DEFAULT 0,
    "taxType" TEXT NOT NULL DEFAULT 'EXCLUSIVE',
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "amount" REAL NOT NULL,
    "total" REAL NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InvoiceItem" ("amount", "description", "discountPercent", "hsn", "id", "invoiceId", "productId", "qty", "rate", "sortOrder", "taxAmount", "taxPercent", "total", "unit") SELECT "amount", "description", "discountPercent", "hsn", "id", "invoiceId", "productId", "qty", "rate", "sortOrder", "taxAmount", "taxPercent", "total", "unit" FROM "InvoiceItem";
DROP TABLE "InvoiceItem";
ALTER TABLE "new_InvoiceItem" RENAME TO "InvoiceItem";
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hsn" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'Pcs',
    "purchasePrice" REAL NOT NULL DEFAULT 0,
    "sellingPrice" REAL NOT NULL DEFAULT 0,
    "gstPercent" REAL NOT NULL DEFAULT 18,
    "taxType" TEXT NOT NULL DEFAULT 'EXCLUSIVE',
    "stock" REAL NOT NULL DEFAULT 0,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("active", "category", "createdAt", "gstPercent", "hsn", "id", "name", "purchasePrice", "sellingPrice", "stock", "unit", "updatedAt") SELECT "active", "category", "createdAt", "gstPercent", "hsn", "id", "name", "purchasePrice", "sellingPrice", "stock", "unit", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_hsn_idx" ON "Product"("hsn");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
