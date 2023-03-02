import { IUnitOfWork } from './i-unit-of-work';

export interface IUnitOfWorkRepository extends IUnitOfWork {
    registerAdd(model: string, entry: any): void;
    registerRemove(model: string, entry: any): void;
    registerSave(model: string, entry: any): void;
}