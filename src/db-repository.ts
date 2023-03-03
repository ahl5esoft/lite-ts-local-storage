import { DbModel, DbOption, IDbRepository, IUnitOfWork } from 'lite-ts-db';

import { DbQuery } from './db-query';
import { IUnitOfWorkRepository } from './i-unit-of-work-repository';
import { LocalStorage } from './db-factory';

export function modelDbOption(model: any): DbOption {
    return dbRepo => {
        (dbRepo as DbRepository<any>).model = typeof model == 'string' ? model : model.ctor;
    };
}

export function uowDbOption(uow: IUnitOfWork): DbOption {
    return dbRepo => {
        (dbRepo as DbRepository<any>).uow = uow as IUnitOfWorkRepository;
    };
}

export class DbRepository<T extends DbModel> implements IDbRepository<T> {
    private m_IsTx: boolean;

    public set uow(v: IUnitOfWorkRepository) {
        this.m_IsTx = true;
        this.m_Uow = v;
    }

    private m_Model: string;
    public set model(v: string) {
        this.m_Model = v;
    }

    public constructor(
        private m_Uow: IUnitOfWorkRepository,
        private m_LocalStorage: LocalStorage
    ) { }

    public async add(entry: T) {
        this.m_Uow.registerAdd(this.m_Model, entry);
        if (this.m_IsTx)
            return;

        await this.m_Uow.commit();
    }

    public query() {
        return new DbQuery<T>(this.m_Model, this.m_LocalStorage);
    }

    public async remove(entry: T) {
        this.m_Uow.registerRemove(this.m_Model, entry);
        if (this.m_IsTx)
            return;

        await this.m_Uow.commit();
    }

    public async save(entry: T) {
        this.m_Uow.registerSave(this.m_Model, entry);
        if (this.m_IsTx)
            return;

        await this.m_Uow.commit();
    }
}