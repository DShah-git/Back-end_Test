import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'


declare global {
    var prisma: PrismaClient | undefined;
}

const adapter = new PrismaBetterSqlite3({
    url: 'file:dev.db'
})


export const prisma =
    globalThis.prisma ??
    new PrismaClient({
        adapter,
        log: ["query"]
    });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;