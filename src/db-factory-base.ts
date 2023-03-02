import { DbModel } from './db-model';
import { IDbRepository } from './i-db-repository';
import { IUnitOfWork } from './i-unit-of-work';

export type DbOption = (dbRepo: IDbRepository<DbModel>) => void;

export type LocalStorage = {
    getItem: (key: string) => string;
    setItem: (key: string, value: string) => void
};

export abstract class DbFactoryBase {
    public static ctor = 'DbFactoryBase';

    public abstract db<T extends DbModel>(...opts: DbOption[]): IDbRepository<T>;
    public abstract uow(): IUnitOfWork;
}