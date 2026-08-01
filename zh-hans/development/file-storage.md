# 文件原生存储

本指南介绍 Marinara Engine 的本地持久化架构。想了解面向用户的文件夹结构，见[数据保存在哪里](../data/where-data-is-stored.md)。

## 唯一数据源

Marinara 把应用数据行以 JSON 快照的形式保存在 `DATA_DIR/storage` 下：

```text
storage/
├── manifest.json
└── tables/
    ├── chats.json
    ├── messages.json
    ├── characters.json
    └── ...
```

`FILE_STORAGE_DIR` 可以覆盖 `storage` 目录的位置。每个表文件里是一个 JSON 数组。`manifest.json` 记录存储格式版本、保存时间、后端标识，以及每张已注册表的行数。

## 运行时模型

`packages/server/src/db/file-backed-store.ts` 在启动时把各表快照载入内存。服务器通过 `db/file-query.ts` 暴露的文件原生操作读取和修改这些行。`db/file-schema.ts` 为 `db/schema/` 里的定义提供互不冲突的表元数据和列元数据。

`select`、`insert`、`update`、`delete` 这套链式 API 让存储服务的代码保持精简，同时不依赖任何外部数据库或 ORM。支持的过滤条件和排序方式都是显式的表达式对象，因此存储层从不解析查询字符串。

表通过 `fileTable(..., { uniqueBy: [...] })` 声明自然键。插入和更新会先拿完整的候选变更去校验主键和已声明的自然键，然后才改动内存中的行，所以约束一旦不满足，表就保持原样。如果唯一性只对部分行成立，规则里可以带一个 `when` 谓词。

下载来的能力包可能自带一套文件表实例。存储层先比对对象标识，再按已注册的表名解析这些实例，让能力包自己的存储代码也能安全地使用 Engine 的表。

## 持久化与恢复

写入会把受影响的表标记为脏数据。短暂的防抖会把相邻的改动合并起来，同时有一个安全定时器定期把待处理的工作刷盘。优雅关闭时会等待进行中的写入完成，再把这期间又发生改动的行一并落盘。

每份快照都先写进临时文件，刷盘，再原子重命名。替换之前，上一份健康的快照会被刷新为一个 `.bak` 文件。启动时如果主文件读不出来，会尽可能从备份恢复。两份都不可用时，Marinara 会给损坏的文件加上时间戳后缀隔离起来，只让这一张表空着启动，界面因此仍然打得开，可以继续做恢复操作。

## 事务

事务采用写时复制快照，作用域由 `AsyncLocalStorage` 界定。只有当某个事务第一次改动某张表时，这张表才会被克隆。回调抛出异常时，只回滚该事务改过的表，无关的并发写入不受影响。

## 新增一张表

要新增需要持久化的数据时：

1. 在 `packages/server/src/db/schema/` 里用 `fileTable` 和文件原生的列构造器定义这张表。
2. 从 `db/schema/index.ts` 导出它。
3. 用 `uniqueBy` 表选项声明自然键。
4. 把表名注册到 `FILE_BACKED_TABLES`。
5. 需要时在 `file-backed-store.ts` 里定义级联或置空的关联关系。
6. 如果某个文本字段存的是结构化 JSON，在 `services/mari-db/mari-db.service.ts` 里补上 JSON 列的元数据。
7. 确认档案的备份和恢复行为正常。
8. 运行 `pnpm check` 和相关的存储回归测试。

表定义、关联元数据、档案的可移植性、Mari DB 校验这四处要在同一次改动里保持一致。
