export type StoredValue = string;

export type ModelTypeOf<M> = M extends CreatedModel<infer T, any> ? T : never;

export interface CreateModelInterface<T, P> {
  $: {
    sample: () => T;
    toStore: { (e: T): StoredValue };
    fromStore: { (s: StoredValue): T };
    migrate: { (D: { _version: number } & P): T };
    version: number;
  };
}

interface modelMigrateInterface<T> {
  $migrate: {
    <X extends T>(opts: {
      sample: { (prev: T): X };
      migrate: { (prev: T): X };
      toStore?: { (e: X): StoredValue };
      fromStore?: { (s: StoredValue): X };
    }): CreateModelInterface<X, T> & modelMigrateInterface<X>;
  };
}

export type CreatedModel<T, P> = CreateModelInterface<T, P> &
  modelMigrateInterface<T>;

function curryMigrate<T, P>(model: CreateModelInterface<T, P>) {
  return function <X extends T>(opts: {
    sample: { (prevSample: T): X };
    migrate: { (prevData: T): X };
    toStore?: { (e: X): StoredValue };
    fromStore?: { (s: StoredValue): X };
  }): CreatedModel<X, T> {
    const version = model.$.version + 1;
    const migratedModel: CreateModelInterface<X, T> = {
      $: {
        ...model.$,
        sample: () => opts.sample(model.$.sample()),
        version,
        toStore: opts.toStore ?? ((e) => JSON.stringify(e)),
        fromStore: opts.fromStore ?? ((s) => JSON.parse(s) as X),
        migrate: (data) => {
          if (data._version < version) {
            if (data._version + 1 !== version) {
              console.warn(
                "Weird migration, version applied out of order? got %d, expected %d, applying %d",
                data._version,
                data._version + 1,
                version
              );
            }
            return {
              ...opts.migrate(data),
              _version: version,
            };
          }
          // need to cast here, typescript wise, this would never really happen,
          // but this whole migration library is meant to handle old data with
          // new code, and therefore, data could either be
          return data as X;
        },
      },
    };

    return {
      ...migratedModel,
      $migrate: curryMigrate(migratedModel),
    };
  };
}

export function createModel<T>(opts: {
  sample: () => T;
  toStore?: { (entry: T): StoredValue };
  fromStore?: { (storedEntry: StoredValue): T };
}): CreatedModel<T, {}> {
  const model: CreateModelInterface<T, {}> = {
    $: {
      sample: opts.sample,
      toStore: opts.toStore ?? JSON.stringify,
      fromStore: opts.fromStore ?? JSON.parse,
      migrate: (d) => {
        return { ...d, _version: 1 } as T;
      },
      version: 1,
    },
  };

  return {
    ...model,
    $migrate: curryMigrate(model),
  };
}
