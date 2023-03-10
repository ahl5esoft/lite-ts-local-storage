import { DbFactoryBase, DbModel, DbOption, DbRepository } from 'lite-ts-db';

import { DbQuery } from './db-query';
import { UnitOfWork } from './unit-of-work';

export type LocalStorage = {
    getItem: (key: string) => string;
    setItem: (key: string, value: string) => void
};

export class LocalStorageDbFactory extends DbFactoryBase {
    public constructor(
        private m_LocalStorage: LocalStorage
    ) {
        super();
    }

    public db<T extends DbModel>(...opts: DbOption[]) {
        const dbReop = new DbRepository<T>(
            this.uow(),
        );
        dbReop.createQueryFunc = () => {
            return new DbQuery(dbReop.model, this.m_LocalStorage);
        };
        opts.forEach(r => {
            r(dbReop);
        });
        return dbReop;
    }

    public uow() {
        return new UnitOfWork(this.m_LocalStorage);
    }
}