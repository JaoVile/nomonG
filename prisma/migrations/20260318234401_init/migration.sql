-- CreateEnum
CREATE TYPE "public"."PoiType" AS ENUM ('atividade', 'servico', 'banheiro', 'entrada');

-- CreateTable
CREATE TABLE "public"."MapConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "overlayUrl" TEXT NOT NULL,
    "pixelWidth" INTEGER NOT NULL,
    "pixelHeight" INTEGER NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "west" DOUBLE PRECISION NOT NULL,
    "east" DOUBLE PRECISION NOT NULL,
    "south" DOUBLE PRECISION NOT NULL,
    "north" DOUBLE PRECISION NOT NULL,
    "baseRotationDeg" DOUBLE PRECISION NOT NULL DEFAULT -15,
    "baseRotationScale" DOUBLE PRECISION NOT NULL DEFAULT 1.45,
    "lockMapPosition" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Poi" (
    "id" TEXT NOT NULL,
    "mapConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."PoiType" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "contact" TEXT,
    "accentColor" TEXT,
    "badge" TEXT,
    "nodeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PoiAccessEvent" (
    "id" TEXT NOT NULL,
    "poiId" TEXT NOT NULL,
    "sessionId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoiAccessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapConfig_active_idx" ON "public"."MapConfig"("active");

-- CreateIndex
CREATE INDEX "Poi_mapConfigId_isActive_idx" ON "public"."Poi"("mapConfigId", "isActive");

-- CreateIndex
CREATE INDEX "Poi_name_idx" ON "public"."Poi"("name");

-- CreateIndex
CREATE INDEX "Poi_type_idx" ON "public"."Poi"("type");

-- CreateIndex
CREATE INDEX "PoiAccessEvent_poiId_createdAt_idx" ON "public"."PoiAccessEvent"("poiId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Poi" ADD CONSTRAINT "Poi_mapConfigId_fkey" FOREIGN KEY ("mapConfigId") REFERENCES "public"."MapConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PoiAccessEvent" ADD CONSTRAINT "PoiAccessEvent_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "public"."Poi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
