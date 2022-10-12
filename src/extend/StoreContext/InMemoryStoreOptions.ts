export interface InMemoryStoreOptions {
  id?: {
    // used for id generation
    prefix?: string;
    // used for id generation
    incrementPadding?: number;
  };
  list?: {
    pageSize?: number;
  };
  // by default, the InMemoryStore will output a warning when used. This is to
  // ensure default use is not left on by mistake
  warnOnUse?: boolean;
}
