interface IDbQueryOption<T> {
    skip: number;
    take: number;
    where: T;
    order: string[];
    orderByDesc: string[];
}

interface IDbQuery<T> {
    count(where?: any): Promise<number>;
    toArray(v?: Partial<IDbQueryOption<any>>): Promise<T[]>;
}

interface IDbRepository<T> {
    add(entry: T): Promise<void>;
    remove(entry: T): Promise<void>;
    save(entry: T): Promise<void>;
    query(): IDbQuery<T>;
}

interface IUnitOfWork {
    commit(): Promise<void>;
    registerAfter(action: () => Promise<void>, key?: string): void;
}

declare class DbModel {
    readonly id: string;
}
type DbOption = (dbRepo: IDbRepository<DbModel>) => void;
declare abstract class DbFactoryBase {
    abstract db<T extends DbModel>(...opts: DbOption[]): IDbRepository<T>;
    abstract uow(): IUnitOfWork;
}




type DbQueryOption<T> = Partial<{
    skip: number;
    take: number;
    where: T;
    order: string[];
    orderByDesc: string[];
}>;
declare class DbQuery<T extends DbModel> implements IDbQuery<T> {
    private m_Model;
    private m_LocalStorage;
    constructor(m_Model: string, m_LocalStorage: LocalStorage);
    count(where?: (entry: T) => boolean): Promise<number>;
    toArray(opt?: DbQueryOption<(entry: T) => boolean>): Promise<T[]>;
}


interface IUnitOfWorkRepository extends IUnitOfWork {
    registerAdd(model: string, entry: any): void;
    registerRemove(model: string, entry: any): void;
    registerSave(model: string, entry: any): void;
}

declare function modelDbOption(model: any): DbOption;
declare function uowDbOption(uow: IUnitOfWork): DbOption;
declare class DbRepository<T extends DbModel> implements IDbRepository<T> {
    private m_Uow;
    private m_LocalStorage;
    private m_IsTx;
    set uow(v: IUnitOfWorkRepository);
    private m_Model;
    set model(v: string);
    constructor(m_Uow: IUnitOfWorkRepository, m_LocalStorage: LocalStorage);
    add(entry: T): Promise<void>;
    query(): DbQuery<T>;
    remove(entry: T): Promise<void>;
    save(entry: T): Promise<void>;
}

declare class UnitOfWork implements IUnitOfWorkRepository {
    private m_LocalStorage;
    private m_AfterActions;
    private m_Operation;
    constructor(m_LocalStorage: LocalStorage);
    commit(): Promise<void>;
    registerAdd(model: string, entry: any): void;
    registerAfter(action: () => Promise<void>): void;
    registerRemove(model: string, entry: any): void;
    registerSave(model: string, entry: any): void;
}

type LocalStorage = {
    getItem: (key: string) => string;
    setItem: (key: string, value: string) => void;
};
declare class LocalStorageDbFactory extends DbFactoryBase {
    private m_LocalStorage;
    constructor(m_LocalStorage: LocalStorage);
    db<T extends DbModel>(...opts: DbOption[]): DbRepository<T>;
    uow(): UnitOfWork;
}

