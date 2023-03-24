import { DbModel, IDbQuery } from 'lite-ts-db';

export type DbQueryOption<T> = Partial<{
    skip: number;
    take: number;
    where: T;
    order: string[];
    orderByDesc: string[];
}>;

export class DbQuery<T extends DbModel> implements IDbQuery<T> {
    public constructor(
        private m_LocalStorage: Storage,
        private m_Model: string,
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