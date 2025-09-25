-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "libraryName" TEXT NOT NULL DEFAULT 'Robert Aboagye Mensah Community Library',
    "libraryAddress" TEXT,
    "libraryEmail" TEXT,
    "libraryPhone" TEXT,
    "maxBorrowDays" INTEGER NOT NULL DEFAULT 14,
    "maxBooksPerMember" INTEGER NOT NULL DEFAULT 5,
    "overdueFinePerDay" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "notifications" JSONB NOT NULL DEFAULT '{"email":true,"sms":false,"overdue":true,"reservations":true}',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_personId_idx" ON "public"."attendance"("personId");

-- CreateIndex
CREATE INDEX "attendance_memberId_idx" ON "public"."attendance"("memberId");

-- CreateIndex
CREATE INDEX "attendance_checkInTime_idx" ON "public"."attendance"("checkInTime");

-- CreateIndex
CREATE INDEX "attendance_isVisitor_idx" ON "public"."attendance"("isVisitor");

-- CreateIndex
CREATE INDEX "books_status_idx" ON "public"."books"("status");

-- CreateIndex
CREATE INDEX "books_category_idx" ON "public"."books"("category");

-- CreateIndex
CREATE INDEX "books_createdAt_idx" ON "public"."books"("createdAt");

-- CreateIndex
CREATE INDEX "borrowings_status_idx" ON "public"."borrowings"("status");

-- CreateIndex
CREATE INDEX "borrowings_personId_idx" ON "public"."borrowings"("personId");

-- CreateIndex
CREATE INDEX "borrowings_memberId_idx" ON "public"."borrowings"("memberId");

-- CreateIndex
CREATE INDEX "borrowings_createdAt_idx" ON "public"."borrowings"("createdAt");

-- CreateIndex
CREATE INDEX "persons_status_idx" ON "public"."persons"("status");

-- CreateIndex
CREATE INDEX "persons_personType_idx" ON "public"."persons"("personType");

-- CreateIndex
CREATE INDEX "persons_createdAt_idx" ON "public"."persons"("createdAt");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "public"."reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_personId_idx" ON "public"."reservations"("personId");

-- CreateIndex
CREATE INDEX "reservations_memberId_idx" ON "public"."reservations"("memberId");

-- CreateIndex
CREATE INDEX "reservations_createdAt_idx" ON "public"."reservations"("createdAt");
