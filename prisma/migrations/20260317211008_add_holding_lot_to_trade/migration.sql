-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "holding_lot_id" TEXT;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_holding_lot_id_fkey" FOREIGN KEY ("holding_lot_id") REFERENCES "HoldingLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
