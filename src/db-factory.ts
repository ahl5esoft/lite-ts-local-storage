import { DbFactoryBase, DbModel, DbOption, DbRepository } from 'lite-ts-db';

import { UnitOfWork } from './unit-of-work';

export class LocalStorageDbFactory extends DbFactoryBase {
    public constructor(
        public localStorage: Storage,
    ) {
        super();
    }

    public db<T extends DbModel>(...opts: DbOption[]) {
        const dbReop = new DbRepository<T>(
            this.uow(),
        );
        opts.forEach(r => {
            r(this, dbReop);
        });
        return dbReop;
    }

    public uow() {
        return new UnitOfWork(this.localStorage);
    }
}