import { DbFactoryBase, DbModel, IRandSeedService, IUnitOfWork, uowDbOption } from 'lite-ts-db';

import { modelDbOption } from './model-db-option';

class RandSeed extends DbModel {
    public static ctor = 'RandSeed';

    public seed: { [scene: string]: string };
}

export class LocalStorageRandSeedService implements IRandSeedService {
    private m_Entries: Promise<RandSeed[]>;
    protected get entries() {
        this.m_Entries ??= new Promise<RandSeed[]>(async (s, f) => {
            try {
                const entries = await this.m_DbFactory.db<RandSeed>(
                    modelDbOption(RandSeed),
                ).query().toArray();
                s(entries);
            } catch (ex) {
                f(ex);
            }
        });
        return this.m_Entries;
    }

    public constructor(
        private m_DbFactory: DbFactoryBase,
        private m_Scene: string,
        private m_Range = [256, 512],
    ) { }

    public async get(uow: IUnitOfWork, len: number, offset?: number) {
        const seeds = await this.findSeeds(uow);
        offset ??= 0;
        if (len + offset >= seeds.length)
            throw new Error('种子已达最大值');

        return parseInt(
            seeds.splice(offset, len).join('')
        ) || 0;
    }

    public async use(uow: IUnitOfWork, len: number) {
        const seeds = await this.findSeeds(uow);
        if (len >= seeds.length)
            throw new Error('种子已达最大值');

        const seed = parseInt(
            seeds.splice(0, len).join('')
        ) || 0;
        const entries = await this.entries;
        entries[0].seed[this.m_Scene] = seeds.join('');
        await this.m_DbFactory.db<RandSeed>(
            modelDbOption(RandSeed),
            uowDbOption(uow),
        ).save(entries[0]);
        return seed;
    }

    private async findSeeds(uow: IUnitOfWork) {
        const db = this.m_DbFactory.db<RandSeed>(
            modelDbOption(RandSeed),
            uowDbOption(uow),
        );
        const entries = await this.entries;
        if (!entries.length) {
            entries.push({
                id: '',
                seed: {}
            });
            await db.add(entries[0]);
        }

        entries[0].seed[this.m_Scene] ??= '';
        if (entries[0].seed[this.m_Scene].length < this.m_Range[0]) {
            while (entries[0].seed[this.m_Scene].length < this.m_Range[1])
                entries[0].seed[this.m_Scene] += Math.random().toString(10).substring(2);

            await db.save(entries[0]);
        }

        return [...entries[0].seed[this.m_Scene]];
    }
}