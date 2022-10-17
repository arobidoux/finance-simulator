## Summary

Allow creation of model that can then later be used within the app. A Store can
be defined for each model defined. Base Store available are InMemory (default
value for every model), SessionStorage and LocalStorage.

All of those store can be changed without an impact on the behavior, which allow
to easily move from one to the other from within a React Context.

The StoreContext can be `used`, have one or many `specialize` override
specified, then `provided` to the rest of the components.

Technically, a REST based Store could be defined, and would then allow models to
be stored from a backend source, or even a firestore synced collection.

### Version your data - Migration

If you are using LocalStorage (or another form of persistent client side
storage), the model definition should not be altered once created and used on
with "production" data. If a change in the model is required, it should
therefore be a "migration". Said migration will provide required information to
be able to bring the old data to the new version, allowing user with old version
of the state to be able to run the new version seamlessly. This does imply the
migration will be able to fill in mising information, and therefore things that
cannot be computed or do not have a sensible default value should either be:

- handled as missing from within the app
- notify the user that he needs to start over / provide the missing information

### Update the data

When making changes on an entry, changes are detected the same way they would be
in a React Reducer. this implies that any nested object need to have their
reference changed, and not just the nested entry. Use of the spread operator is
helpful for this scenario.

### Commit your data

The model entry retrieved from the store can be altered locally without having
their changes commited. The pristine version of the entry is kept in memory,
which allow you to "reset" to the original state (discard changes), detect if
there "hasChanges" (globally or on a top level key), which in turn allows us to
know what is the information that we are trying to alter (could be usefull in
the case of a 409 when using a REST store).

In any case, changes made to the model are **not** committed by default, and
must be done explicitly, from which point the new version will be saved to the
store and persisted.