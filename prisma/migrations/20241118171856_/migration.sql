-- CreateTable
CREATE TABLE "SMSMessage" (
    "id" TEXT NOT NULL,
    "messageSid" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "dateSent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SMSMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SMSMessage_messageSid_key" ON "SMSMessage"("messageSid");
