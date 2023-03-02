import { DbModel } from './db-model';
import { IDbQuery } from './i-db-query';

export interface IDbRepository<T extends DbModel> {
    add(entry: T): Promise<void>;
    query(): IDbQuery<T>;
    remove(entry: T): Promise<void>;
    save(entry: T): Promise<void>;
}