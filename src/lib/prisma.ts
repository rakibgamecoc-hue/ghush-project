import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL ?? ""

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
