import { DbFactoryBase, DbOption, LocalStorage } from './db-factory-base';
import { DbModel } from './db-model';
import { DbRepository } from './db-repository';
import { UnitOfWork } from './unit-of-work';

export class DbFactory extends DbFactoryBase {

    public constructor(
        private m_LocalStorage: LocalStorage
    ) {
        super();
    }

    public db<T extends DbModel>(...opts: DbOption[]) {
        const dbReop = new DbRepository<T>(
            this.uow(),
            this.m_LocalStorage
        );
        opts.forEach(r => {
            r(dbReop);
        });
        return dbReop;
    }

    public uow() {
        return new UnitOfWork(this.m_LocalStorage);
    }
}