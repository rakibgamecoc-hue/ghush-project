/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@prisma/client" {
  export type Decimal = any;
  export type BribeReport = {
    id: string;
    departmentCategory: string;
    serviceType: string;
    stateRegion: string;
    districtLocation: string;
    amountDemanded: Decimal | number;
    outcome: string;
    narrativeText: string;
    verificationStatus?: string;
    agreeVotes: number;
    disagreeVotes: number;
    createdAt: string | Date;
  };

  export class PrismaClient {
    constructor(...args: any[]);
    bribeReport: {
      create: (...args: any[]) => Promise<any>;
      findUnique: (...args: any[]) => Promise<any>;
      update: (...args: any[]) => Promise<any>;
      findMany: (...args: any[]) => Promise<any[]>;
      aggregate: (...args: any[]) => Promise<any>;
      count: (...args: any[]) => Promise<number>;
    };
    [key: string]: any;
  }

  export default PrismaClient;
}

declare module "prisma/config" {
  export function defineConfig(config: any): any;
}
