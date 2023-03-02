import { DbModel } from './db-model';

export type DbQueryOption<T> = Partial<{
    skip: number;
    take: number;
    where: T;
    order: string[];
    orderByDesc: string[];
}>;

export interface IDbQuery<T extends DbModel> {
    count(where?: any): Promise<number>;
    toArray(opt?: DbQueryOption<any>): Promise<T[]>;
}