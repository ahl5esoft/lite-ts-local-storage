import { ok, strictEqual } from 'assert';
import { DbFactoryBase, IDbRepository, IUnitOfWork } from 'lite-ts-db';
import { Mock, mockAny } from 'lite-ts-mock';

import { LocalStorageRandSeedService as Self } from './rand-seed-service';

describe('src/rand-seed-service.ts', () => {
    describe('.get(uow: IUnitOfWork, len: number, offset?: number)', () => {
        it('ok', async () => {
            const self = new Self(null, 'test', [0, 1]);

            Reflect.set(self, 'findSeeds', () => {
                return [...'123456798'];
            });

            const res = await self.get(null, 2, 4);
            strictEqual(res, 56);
        });
    });

    describe('.use(uow: IUnitOfWork, len: number, offset?: number)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual, '', null);

            Reflect.set(self, 'findSeeds', () => {
                return [...'123456789'];
            });

            const entry = {
                seed: {}
            };
            Reflect.set(self, 'm_Entries', [entry]);

            const mockDbRepo = new Mock<IDbRepository<any>>();
            mockDbFactory.expectReturn(
                r => r.db(mockAny, mockAny),
                mockDbRepo.actual
            );

            mockDbRepo.expected.save({
                seed: {
                    ['']: '3456789'
                }
            });

            const res = await self.use(null, 2);
            strictEqual(res, 12);
        });
    });

    describe('.findSeeds(uow: IUnitOfWork)[private]', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual, '', [1, 8]);

            const mockDbRepo = new Mock<IDbRepository<any>>();
            mockDbFactory.expectReturn(
                r => r.db(mockAny, mockAny),
                mockDbRepo.actual
            );

            Reflect.set(self, 'm_Entries', []);

            mockDbRepo.expected.add({
                id: '',
                seed: {}
            });

            mockDbRepo.expected.save(mockAny);

            const func = Reflect.get(self, 'findSeeds').bind(self) as (uow: IUnitOfWork) => Promise<string[]>;
            const res = await func(null);
            ok(res?.length >= 8);
        });
    });
});