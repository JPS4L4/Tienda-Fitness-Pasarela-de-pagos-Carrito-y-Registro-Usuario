-- CreateTable
CREATE TABLE "StockAlert" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER,
    "requestedQuantity" INTEGER NOT NULL,
    "availableStock" INTEGER,
    "paymentProvider" TEXT,
    "paymentId" TEXT,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetryEvent" (
    "id" SERIAL NOT NULL,
    "paymentProvider" TEXT NOT NULL,
    "paymentId" TEXT,
    "reason" TEXT NOT NULL,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockAlert_productId_idx" ON "StockAlert"("productId");

-- CreateIndex
CREATE INDEX "StockAlert_paymentId_idx" ON "StockAlert"("paymentId");

-- CreateIndex
CREATE INDEX "StockAlert_createdAt_idx" ON "StockAlert"("createdAt");

-- CreateIndex
CREATE INDEX "RetryEvent_paymentId_idx" ON "RetryEvent"("paymentId");

-- CreateIndex
CREATE INDEX "RetryEvent_createdAt_idx" ON "RetryEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "StockAlert" ADD CONSTRAINT "StockAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
