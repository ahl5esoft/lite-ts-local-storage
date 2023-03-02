import { LocalStorage } from './db-factory-base';
import { DbModel } from './db-model';
import { DbQueryOption, IDbQuery } from './i-db-query';


export class DbQuery<T extends DbModel> implements IDbQuery<T> {
    public constructor(
        private m_Model: string,
        private m_LocalStorage: LocalStorage
    ) { }

    public async count(where?: (entry: T) => boolean) {
        const entries = await this.toArray({ where });
        return entries.length;
    }

    public async toArray(opt?: DbQueryOption<(entry: T) => boolean>) {
        const v = this.m_LocalStorage.getItem(this.m_Model)
        let entries = v ? JSON.parse(v) as T[] : [];
        if (opt?.where)
            entries = entries.filter(opt.where);
        return entries;
    }
}