# ![Version](https://img.shields.io/badge/version-1.4.0-green.svg)

## 安装
```
npm install lite-ts-local-storage
```

## 使用

```typescript
import { DbFactory, modelDbOption, uowDbOption} from 'lite-ts-local-storage';

class User{
    public static ctor = 'User';

    public id:string;
    public name:string;
    public age:number;
}
const dbFactory = new LocalStorageDbFactory(localStorage);
const uow = dbFactory.uow();
const db = dbFactory.db<User>(
    modelDbOption(User),
    uowDbOption(uow)
);

// 添加用户
await db.add({
    id:'1',
    age:1,
    name:'张三'
});

// 删除实体
await db.remove({
    id:'1',
    age:1,
    name:'张三1'
});
// 更新实体
await db.remove({
    id:'1',
    age:2,
    name:'张三'
});
await uow.commit();

// 获取数量
const count = await db.query().count(r => r.age == 1);
// 获取实体
const entries = await db.query().toArray({
    where: r => r.age == 1
});
```
