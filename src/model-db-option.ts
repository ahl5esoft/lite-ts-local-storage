import { DbModel, DbOption, DbRepository } from 'lite-ts-db';
import { ioc } from 'lite-ts-ioc';

import { LocalStorageDbFactory } from './db-factory';
import { DbQuery } from './db-query';

export function modelDbOption<T>(typer: new () => T): DbOption {
    return (dbFactory: LocalStorageDbFactory, dbRepo: DbRepository<DbModel>) => {
        dbRepo.model = ioc.getKey(typer);
        dbRepo.createQueryFunc = () => {
            return new DbQuery(dbFactory.localStorage, dbRepo.model);
        };
    };
}