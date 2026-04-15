/*
  Warnings:

  - The `status` column on the `shipments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[trackingNumber]` on the table `shipments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED');

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "carrier" VARCHAR(100),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" VARCHAR(100),
DROP COLUMN "status",
ADD COLUMN     "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");
