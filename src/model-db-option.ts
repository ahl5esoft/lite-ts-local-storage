import { DbModel, DbOption, DbRepository } from 'lite-ts-db';

import { LocalStorageDbFactory } from './db-factory';
import { DbQuery } from './db-query';

export function modelDbOption<T>(typer: new () => T): DbOption {
    return (dbFactory: LocalStorageDbFactory, dbRepo: DbRepository<DbModel>) => {
        dbRepo.createQueryFunc = () => {
            return new DbQuery(dbFactory.localStorage, (typer as any).ctor ?? typer.name);
        };
    };
}