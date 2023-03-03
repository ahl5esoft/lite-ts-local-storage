import { DbModel } from 'lite-ts-db';

import { LocalStorage } from './db-factory';
import { IUnitOfWorkRepository } from './i-unit-of-work-repository';

export class UnitOfWork implements IUnitOfWorkRepository {
    /**
     * 提交后执行的函数
     */
    private m_AfterActions: (() => Promise<void>)[] = [];

    private m_Operation: {
        [model: string]: ((idOfEntry: { [id: string]: DbModel }) => void)[];
    } = {};

    public constructor(
        private m_LocalStorage: LocalStorage
    ) { }

    public async commit() {
        Object.entries(this.m_Operation).forEach(([k, v]) => {
            const s = this.m_LocalStorage.getItem(k);
            const idOfEntry: { [id: string]: DbModel } = (
                (s ? JSON.parse(s) : []) as DbModel[]
            ).reduce((memo, r) => {
                memo[r.id] = r;
                return memo;
            }, {});
            v.forEach(r => {
                r(idOfEntry);
            });
            this.m_LocalStorage.setItem(
                k,
                JSON.stringify(
                    Object.values(idOfEntry),
                ),
            );
        });

        for (const r of this.m_AfterActions)
            await r();
        this.m_AfterActions = [];
    }

    public registerAdd(model: string, entry: any) {
        this.registerSave(model, entry);
    }

    public registerAfter(action: () => Promise<void>) {
        this.m_AfterActions.push(action);
    }

    public registerRemove(model: string, entry: any) {
        this.m_Operation[model] ??= [];
        this.m_Operation[model].push(idOfEntry => {
            delete idOfEntry[entry.id];
        });
    }

    public registerSave(model: string, entry: any) {
        this.m_Operation[model] ??= [];
        this.m_Operation[model].push(idOfEntry => {
            idOfEntry[entry.id] = entry;
        });
    }
}