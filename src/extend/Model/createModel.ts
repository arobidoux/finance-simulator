import { CreatedModel } from "./CreatedModel";
import { CreateModelInterface } from "./CreateModelInterface";
import { StoredValue } from "./StoredValue";
import { VersionizedData } from "./VersionizedData";

type MaybeVersionizedData<T> = { _version?: number } & T;

function curryMigrate<T, P>(model: CreateModelInterface<T, P>) {
  return function <X extends T>(opts: {
    sample: { (prevSample: T): X };
    migrate: { (prevData: T): X };
    toStore?: { (e: X): StoredValue };
    fromStore?: { (s: StoredValue): X };
  }): CreatedModel<X, T> {
    const version = model.$.version + 1;
    const migrate = (
      data: { _version?: number } & (P | T)
    ): VersionizedData<X> => {
      // bypass for good data
      if (data._version === version) return data as VersionizedData<X>;

      const prevAtLeast = model.$.migrate(data as MaybeVersionizedData<P>);
      if (!prevAtLeast._version || prevAtLeast._version < version) {
        if (prevAtLeast._version && prevAtLeast._version + 1 !== version) {
          console.warn(
            "Weird migration, version applied out of order? got %d, expected %d, applying %d",
            prevAtLeast._version,
            prevAtLeast._version + 1,
            version
          );
        }
        return {
          ...opts.migrate(prevAtLeast as VersionizedData<T>),
          _version: version,
        };
      }
      // need to cast here, typescript wise, this would never really happen,
      // but this whole migration library is meant to handle old data with
      // new code, and therefore, data could either be
      return data as VersionizedData<X>;
    };
    const migratedModel: CreateModelInterface<X, T> = {
      $: {
        ...model.$,
        sample: () => opts.sample(model.$.sample()),
        version,
        toStore: curryToStore(opts.toStore ?? JSON.stringify, version),
        fromStore: curryFromStore(opts.fromStore ?? JSON.parse, migrate),
        migrate,
      },
    };

    return {
      ...migratedModel,
      $migrate: curryMigrate(migratedModel),
    };
  };
}

export function createModel<T extends {}>(opts: {
  sample: () => T;
  name?: string;
  indexes?: Array<keyof T>;
  toStore?: { (entry: T): StoredValue };
  fromStore?: { (storedEntry: StoredValue): T };
}): CreatedModel<T, {}> {
  const model: CreateModelInterface<T, {}> = {
    $: {
      sample: opts.sample,
      toStore: curryToStore(opts.toStore ?? JSON.stringify, 1),
      fromStore: curryFromStore(opts.fromStore ?? JSON.parse, (e) => e),
      migrate: (d: MaybeVersionizedData<{}>) => {
        return { ...d, _version: 1 } as VersionizedData<T>;
      },
      indexes: opts.indexes,
      name: opts.name ?? opts.sample.name ?? "anonymous",
      version: 1,
    },
  };

  return {
    ...model,
    $migrate: curryMigrate(model),
  };
}

const curryToStore =
  <T>(serialize: { (data: T): string }, version: number) =>
  (data: T) =>
    serialize({ ...data, _version: version });

const curryFromStore =
  <T, P>(
    deserialize: { (raw: string): T | P },
    migrate: { (parsed: T | P): T }
  ) =>
  (raw: string) =>
    migrate(deserialize(raw));
