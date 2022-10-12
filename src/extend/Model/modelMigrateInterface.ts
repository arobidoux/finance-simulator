import { CreateModelInterface } from "./CreateModelInterface";
import { StoredValue } from "./StoredValue";

export interface modelMigrateInterface<T> {
  $migrate: {
    <X extends T>(opts: {
      sample: { (prev: T): X };
      migrate: { (prev: T): X };
      toStore?: { (e: X): StoredValue };
      fromStore?: { (s: StoredValue): X };
    }): CreateModelInterface<X, T> & modelMigrateInterface<X>;
  };
}
