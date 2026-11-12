# Patch for user.service.ts

## Fix line in `remove()`
Replace:
```ts
data: { deletedAt: new Date(), status: 'DELETED' }
```
With:
```ts
data: { deletedAt: new Date(), status: UserStatus.DELETED }
```

## Fix in `list()` — escape search
Replace:
```ts
if (q.search) where.OR = [{ email: { contains: q.search } }, { name: { contains: q.search } }];
```
With:
```ts
if (q.search) {
  const s = q.search.slice(0, 100);
  where.OR = [{ email: { contains: s } }, { name: { contains: s } }];
}
```
