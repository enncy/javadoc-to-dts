# javadoc-to-dts

> generate typescript definitions file from javadoc
> useful for https://github.com/oracle/graaljs

## Install

```bash
npm install javadoc-to-dts
```

## Usage

```js
const { Generator } = require("javadoc-to-dts");
const path = require("path");

const docs_index_url =
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html";
const output_path = path.resolve("./output-test");

const generator = new Generator();

generator.generatePackages(docs_index_url, output_path);
```

## Api

- `Generator` : Generator class, use to generate typescript definitions file from javadoc

- `generator.generatePackages` : generate all packages from docs index url, url should be like https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html ,

- `generator.generateType` : generate single type from type doc url, url should be like https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html ,

## Config

change config if you need, witch is export from `config.js`

```js
const { config } = require("javadoc-to-dts");
// example ['wait', 'notify', 'notifyAll']
// defaults: []
config.ignores_methods = [
  /** ... */
];
// example  ["int-number",  "String-string"]
// defaults: see `config.js`
config.types_mapping = [
  /** ... */
];
```

## Translator

> translate type comment to target language comment
> only support [`TencentCloudTranslator`](https://console.cloud.tencent.com/tmt) now

create `.env` file in root folder

see [`TencentCloudTranslator`](https://console.cloud.tencent.com/tmt) Api for more details

```env
SECRET_ID=xxx
SECRET_KEY=xxx
REGION=ap-xxx
PROJECT_ID=0
```

use TencentCloudTranslator

```js
const { Generator, TencentCloudTranslator } = require("javadoc-to-dts");
const translator = new TencentCloudTranslator({
  secretId: process.env.SECRET_ID || "",
  secretKey: process.env.SECRET_KEY || "",
  region: process.env.REGION || "",
  projectId: parseInt(process.env.PROJECT_ID || "0") || 0,
  target: "zh",
  source: "en",
  // TencentCloud limit: 5 request per second
  translate_period: 200,
});

const generator = new Generator({
  translator,
});

// ... generate
```

### Custom translator

> implement your own translator

```js
const { Generator, Translator } = require("javadoc-to-dts");
class CustomTranslator extends Translator {
  async translate(text = "") {
    const translated = "";
    // ...your logic
    return translated;
  }
}

const generator = new Generator({
  translator: new CustomTranslator(),
});
```


## Use With [`graaljs`](https://github.com/oracle/graaljs)

> graaljs is a javascript engine based on graalvm

see /examples/generate.all.and.types.js

## Examples

more examples see /examples folder

## Output

Map.class :

```typescript
/** */
interface JavaMapConstructor {
  new (): JavaMap;
}

interface JavaMap<K, V> {
  /** 
   Removes all of the mappings from this map (optional operation).
   The map will be empty after this call returns.
 * @throws UnsupportedOperationException - if the clear operation
         is not supported by this map
 */
  clear(): void;
  /** 
   If the specified key is not already associated with a value (or is mapped
   to null), attempts to compute its value using the given mapping
   function and enters it into this map unless null.
   
   If the mapping function returns null, no mapping is recorded.
   If the mapping function itself throws an (unchecked) exception, the
   exception is rethrown, and no mapping is recorded.  The most
   common usage is to construct a new object serving as an initial
   mapped value or memoized result, as in:
   
   
   map.computeIfAbsent(key, k -> new Value(f(k)));
   
   
   Or to implement a multi-value map, Map<K,Collection<V>>,
   supporting multiple values per key:
   
   
   map.computeIfAbsent(key, k -> new HashSet<V>()).add(v);
   
   
   The mapping function should not modify this map during computation.
 * @param {K} key  key with which the specified value is to be associated
 * @param {JavaFunction<any>} mapp_ingFunction  the mapping function to compute a value
 * @returns {V} the current (existing or computed) value associated with
         the specified key, or null if the computed value is null
 * @throws NullPointerException - if the specified key is null and
         this map does not support null keys, or the mappingFunction
         is null
 * @throws UnsupportedOperationException - if the put operation
         is not supported by this map
         (optional)
 * @throws ClassCastException - if the class of the specified key or value
         prevents it from being stored in this map
         (optional)
 * @throws IllegalArgumentException - if some property of the specified key
         or value prevents it from being stored in this map
         (optional)
 */
  compute(key: K, mapp_ingFunction: JavaFunction<any>): V;
  /** 
   If the specified key is not already associated with a value (or is mapped
   to null), attempts to compute its value using the given mapping
   function and enters it into this map unless null.
   
   If the mapping function returns null, no mapping is recorded.
   If the mapping function itself throws an (unchecked) exception, the
   exception is rethrown, and no mapping is recorded.  The most
   common usage is to construct a new object serving as an initial
   mapped value or memoized result, as in:
   
   
   map.computeIfAbsent(key, k -> new Value(f(k)));
   
   
   Or to implement a multi-value map, Map<K,Collection<V>>,
   supporting multiple values per key:
   
   
   map.computeIfAbsent(key, k -> new HashSet<V>()).add(v);
   
   
   The mapping function should not modify this map during computation.
 * @param {K} key  key with which the specified value is to be associated
 * @param {JavaFunction<any>} mapp_ingFunction  the mapping function to compute a value
 * @returns {V} the current (existing or computed) value associated with
         the specified key, or null if the computed value is null
 * @throws NullPointerException - if the specified key is null and
         this map does not support null keys, or the mappingFunction
         is null
 * @throws UnsupportedOperationException - if the put operation
         is not supported by this map
         (optional)
 * @throws ClassCastException - if the class of the specified key or value
         prevents it from being stored in this map
         (optional)
 * @throws IllegalArgumentException - if some property of the specified key
         or value prevents it from being stored in this map
         (optional)
 */
  computeIfAbsent(key: K, mapp_ingFunction: JavaFunction<any>): V;
  /** 
   If the value for the specified key is present and non-null, attempts to
   compute a new mapping given the key and its current mapped value.
   
   If the remapping function returns null, the mapping is removed.
   If the remapping function itself throws an (unchecked) exception, the
   exception is rethrown, and the current mapping is left unchanged.
   
   The remapping function should not modify this map during computation.
 * @param {K} key  key with which the specified value is to be associated
 * @param {JavaBiFunction<any>} remapp_ingFunction  the remapping function to compute a value
 * @returns {V} the new value associated with the specified key, or null if none
 * @throws NullPointerException - if the specified key is null and
         this map does not support null keys, or the
         remappingFunction is null
 * @throws UnsupportedOperationException - if the put operation
         is not supported by this map
         (optional)
 * @throws ClassCastException - if the class of the specified key or value
         prevents it from being stored in this map
         (optional)
 * @throws IllegalArgumentException - if some property of the specified key
         or value prevents it from being stored in this map
         (optional)
 */
  computeIfPresent(key: K, remapp_ingFunction: JavaBiFunction<any>): V;
  /** 
   Returns true if this map contains a mapping for the specified
   key.  More formally, returns true if and only if
   this map contains a mapping for a key k such that
   Objects.equals(key, k).  (There can be
   at most one such mapping.)
 * @param {JavaObject} key  key whose presence in this map is to be tested
 * @returns {boolean} true if this map contains a mapping for the specified
         key
 * @throws ClassCastException - if the key is of an inappropriate type for
         this map (optional)
 * @throws NullPointerException - if the specified key is null and this map
         does not permit null keys (optional)
 */
  containsKey(key: JavaObject): boolean;
  /** 
   Returns true if this map maps one or more keys to the
   specified value.  More formally, returns true if and only if
   this map contains at least one mapping to a value v such that
   Objects.equals(value, v).  This operation
   will probably require time linear in the map size for most
   implementations of the Map interface.
 * @param {JavaObject} value  value whose presence in this map is to be tested
 * @returns {boolean} true if this map maps one or more keys to the
         specified value
 * @throws ClassCastException - if the value is of an inappropriate type for
         this map (optional)
 * @throws NullPointerException - if the specified value is null and this
         map does not permit null values (optional)
 */
  containsValue(value: JavaObject): boolean;
  /** 
   Returns a Set view of the mappings contained in this map.
   The set is backed by the map, so changes to the map are
   reflected in the set, and vice-versa.  If the map is modified
   while an iteration over the set is in progress (except through
   the iterator's own remove operation, or through the
   setValue operation on a map entry returned by the
   iterator) the results of the iteration are undefined.  The set
   supports element removal, which removes the corresponding
   mapping from the map, via the Iterator.remove,
   Set.remove, removeAll, retainAll and
   clear operations.  It does not support the
   add or addAll operations.
 * @returns {JavaSet<Map_Entry<K,V>>} a set view of the mappings contained in this map
 */
  entry(): JavaSet<Map_Entry<K, V>>;
  /** 
   Returns a Set view of the mappings contained in this map.
   The set is backed by the map, so changes to the map are
   reflected in the set, and vice-versa.  If the map is modified
   while an iteration over the set is in progress (except through
   the iterator's own remove operation, or through the
   setValue operation on a map entry returned by the
   iterator) the results of the iteration are undefined.  The set
   supports element removal, which removes the corresponding
   mapping from the map, via the Iterator.remove,
   Set.remove, removeAll, retainAll and
   clear operations.  It does not support the
   add or addAll operations.
 * @returns {JavaSet<Map_Entry<K,V>>} a set view of the mappings contained in this map
 */
  entrySet(): JavaSet<Map_Entry<K, V>>;
  /** 
   Compares the specified object with this map for equality.  Returns
   true if the given object is also a map and the two maps
   represent the same mappings.  More formally, two maps m1 and
   m2 represent the same mappings if
   m1.entrySet().equals(m2.entrySet()).  This ensures that the
   equals method works properly across different implementations
   of the Map interface.
 * @param {JavaObject} o  object to be compared for equality with this map
 * @returns {boolean} true if the specified object is equal to this map
 */
  equals(o: JavaObject): boolean;
  /** 
   Performs the given action for each entry in this map until all entries
   have been processed or the action throws an exception.   Unless
   otherwise specified by the implementing class, actions are performed in
   the order of entry set iteration (if an iteration order is specified.)
   Exceptions thrown by the action are relayed to the caller.
 * @param {JavaBiConsumer<any>} action  The action to be performed for each entry
 * @throws NullPointerException - if the specified action is null
 * @throws ConcurrentModificationException - if an entry is found to be
 removed during iteration
 */
  forEach(action: JavaBiConsumer<any>): void;
  /** 
   Returns the value to which the specified key is mapped,
   or null if this map contains no mapping for the key.
   
   More formally, if this map contains a mapping from a key
   k to a value v such that
   Objects.equals(key, k),
   then this method returns v; otherwise
   it returns null.  (There can be at most one such mapping.)
   
   If this map permits null values, then a return value of
   null does not necessarily indicate that the map
   contains no mapping for the key; it's also possible that the map
   explicitly maps the key to null.  The containsKey operation may be used to distinguish these two cases.
 * @param {JavaObject} key  the key whose associated value is to be returned
 * @returns {V} the value to which the specified key is mapped, or
         null if this map contains no mapping for the key
 * @throws ClassCastException - if the key is of an inappropriate type for
         this map (optional)
 * @throws NullPointerException - if the specified key is null and this map
         does not permit null keys (optional)
 */
  get(key: JavaObject): V;
  /** 
   Returns the value to which the specified key is mapped, or
   defaultValue if this map contains no mapping for the key.
 * @param {JavaObject} key  the key whose associated value is to be returned
 * @param {V} defaultValue  the default mapping of the key
 * @returns {V} the value to which the specified key is mapped, or
 defaultValue if this map contains no mapping for the key
 * @throws ClassCastException - if the key is of an inappropriate type for
 this map (optional)
 * @throws NullPointerException - if the specified key is null and this map
 does not permit null keys (optional)
 */
  getOrDefault(key: JavaObject, defaultValue: V): V;
  /** 
   Returns the hash code value for this map.  The hash code of a map is
   defined to be the sum of the hash codes of each entry in the map's
   entrySet() view.  This ensures that m1.equals(m2)
   implies that m1.hashCode()==m2.hashCode() for any two maps
   m1 and m2, as required by the general contract of
   Object.hashCode().
 * @returns {number} the hash code value for this map
 */
  hashCode(): number;
  /** 
   Returns true if this map contains no key-value mappings.
 * @returns {boolean} true if this map contains no key-value mappings
 */
  isEmpty(): boolean;
  /** 
   Returns a Set view of the keys contained in this map.
   The set is backed by the map, so changes to the map are
   reflected in the set, and vice-versa.  If the map is modified
   while an iteration over the set is in progress (except through
   the iterator's own remove operation), the results of
   the iteration are undefined.  The set supports element removal,
   which removes the corresponding mapping from the map, via the
   Iterator.remove, Set.remove,
   removeAll, retainAll, and clear
   operations.  It does not support the add or addAll
   operations.
 * @returns {JavaSet<K>} a set view of the keys contained in this map
 */
  keySet(): JavaSet<K>;
  /** 
   If the specified key is not already associated with a value or is
   associated with null, associates it with the given non-null value.
   Otherwise, replaces the associated value with the results of the given
   remapping function, or removes if the result is null. This
   method may be of use when combining multiple mapped values for a key.
   For example, to either create or append a String msg to a
   value mapping:
   
   
   map.merge(key, msg, String::concat)
   
   
   If the remapping function returns null, the mapping is removed.
   If the remapping function itself throws an (unchecked) exception, the
   exception is rethrown, and the current mapping is left unchanged.
   
   The remapping function should not modify this map during computation.
 * @param {K} key  key with which the resulting value is to be associated
 * @param {V} value  the non
 * @param {JavaBiFunction<any>} remapp_ingFunction  the remapping function to recompute a value if
        present
 * @returns {V} the new value associated with the specified key, or null if no
         value is associated with the key
 * @throws UnsupportedOperationException - if the put operation
         is not supported by this map
         (optional)
 * @throws ClassCastException - if the class of the specified key or value
         prevents it from being stored in this map
         (optional)
 * @throws IllegalArgumentException - if some property of the specified key
         or value prevents it from being stored in this map
         (optional)
 * @throws NullPointerException - if the specified key is null and this map
         does not support null keys or the value or remappingFunction is
         null
 */
  merge(key: K, value: V, remapp_ingFunction: JavaBiFunction<any>): V;
  /** 
   Associates the specified value with the specified key in this map
   (optional operation).  If the map previously contained a mapping for
   the key, the old value is replaced by the specified value.  (A map
   m is said to contain a mapping for a key k if and only
   if m.containsKey(k) would return
   true.)
 * @param {K} key  key with which the specified value is to be associated
 * @param {V} value  value to be associated with the specified key
 * @returns {V} the previous value associated with key, or
         null if there was no mapping for key.
         (A null return can also indicate that the map
         previously associated null with key,
         if the implementation supports null values.)
 * @throws UnsupportedOperationException - if the put operation
         is not supported by this map
 * @throws ClassCastException - if the class of the specified key or value
         prevents it from being stored in this map
 * @throws NullPointerException - if the specified key or value is null
         and this map does not permit null keys or values
 * @throws IllegalArgumentException - if some property of the specified key
         or value prevents it from being stored in this map
 */
  put(key: K, value: V): V;
  /** 
   Copies all of the mappings from the specified map to this map
   (optional operation).  The effect of this call is equivalent to that
   of calling put(k, v) on this map once
   for each mapping from key k to value v in the
   specified map.  The behavior of this operation is undefined if the specified map
   is modified while the operation is in progress. If the specified map has a defined
   encounter order,
   processing of its mappings generally occurs in that order.
 * @param {JavaMap<any>} m  mappings to be stored in this map
 * @throws UnsupportedOperationException - if the putAll operation
         is not supported by this map
 * @throws ClassCastException - if the class of a key or value in the
         specified map prevents it from being stored in this map
 * @throws NullPointerException - if the specified map is null, or if
         this map does not permit null keys or values, and the
         specified map contains null keys or values
 * @throws IllegalArgumentException - if some property of a key or value in
         the specified map prevents it from being stored in this map
 */
  putAll(m: JavaMap<any>): void;
  /** 
   If the specified key is not already associated with a value (or is mapped
   to null) associates it with the given value and returns
   null, else returns the current value.
 * @param {K} key  key with which the specified value is to be associated
 * @param {V} value  value to be associated with the specified key
 * @returns {V} the previous value associated with the specified key, or
         null if there was no mapping for the key.
         (A null return can also indicate that the map
         previously associated null with the key,
         if the implementation supports null values.)
 * @throws UnsupportedOperationException - if the put operation
         is not supported by this map
         (optional)
 * @throws ClassCastException - if the key or value is of an inappropriate
         type for this map (optional)
 * @throws NullPointerException - if the specified key or value is null,
         and this map does not permit null keys or values
         (optional)
 * @throws IllegalArgumentException - if some property of the specified key
         or value prevents it from being stored in this map
         (optional)
 */
  putIfAbsent(key: K, value: V): V;
  /** 
   Removes the mapping for a key from this map if it is present
   (optional operation).   More formally, if this map contains a mapping
   from key k to value v such that
   Objects.equals(key, k), that mapping
   is removed.  (The map can contain at most one such mapping.)
   
   Returns the value to which this map previously associated the key,
   or null if the map contained no mapping for the key.
   
   If this map permits null values, then a return value of
   null does not necessarily indicate that the map
   contained no mapping for the key; it's also possible that the map
   explicitly mapped the key to null.
   
   The map will not contain a mapping for the specified key once the
   call returns.
 * @param {JavaObject} key  key whose mapping is to be removed from the map
 * @returns {V} the previous value associated with key, or
         null if there was no mapping for key.
 * @throws UnsupportedOperationException - if the remove operation
         is not supported by this map
 * @throws ClassCastException - if the key is of an inappropriate type for
         this map (optional)
 * @throws NullPointerException - if the specified key is null and this
         map does not permit null keys (optional)
 */
  remove(key: JavaObject): V;
  /** 
   Removes the mapping for a key from this map if it is present
   (optional operation).   More formally, if this map contains a mapping
   from key k to value v such that
   Objects.equals(key, k), that mapping
   is removed.  (The map can contain at most one such mapping.)
   
   Returns the value to which this map previously associated the key,
   or null if the map contained no mapping for the key.
   
   If this map permits null values, then a return value of
   null does not necessarily indicate that the map
   contained no mapping for the key; it's also possible that the map
   explicitly mapped the key to null.
   
   The map will not contain a mapping for the specified key once the
   call returns.
 * @param {JavaObject} key  key whose mapping is to be removed from the map
 * @returns {V} the previous value associated with key, or
         null if there was no mapping for key.
 * @throws UnsupportedOperationException - if the remove operation
         is not supported by this map
 * @throws ClassCastException - if the key is of an inappropriate type for
         this map (optional)
 * @throws NullPointerException - if the specified key is null and this
         map does not permit null keys (optional)
 */
  remove(key: JavaObject): V;
  /** 
   Replaces each entry's value with the result of invoking the given
   function on that entry until all entries have been processed or the
   function throws an exception.  Exceptions thrown by the function are
   relayed to the caller.
 * @param {JavaBiFunction<any>} _function  the function to apply to each entry
 * @throws UnsupportedOperationException - if the set operation
         is not supported by this map's entry set iterator.
 * @throws ClassCastException - if the class of a replacement value
         prevents it from being stored in this map
         (optional)
 * @throws NullPointerException - if the specified function is null, or if a
         replacement value is null and this map does not permit null values
         (optional)
 * @throws IllegalArgumentException - if some property of a replacement value
         prevents it from being stored in this map
         (optional)
 * @throws ConcurrentModificationException - if an entry is found to be
         removed during iteration
 */
  replace(_function: JavaBiFunction<any>): void;
  /** 
   Replaces each entry's value with the result of invoking the given
   function on that entry until all entries have been processed or the
   function throws an exception.  Exceptions thrown by the function are
   relayed to the caller.
 * @param {JavaBiFunction<any>} _function  the function to apply to each entry
 * @throws UnsupportedOperationException - if the set operation
         is not supported by this map's entry set iterator.
 * @throws ClassCastException - if the class of a replacement value
         prevents it from being stored in this map
         (optional)
 * @throws NullPointerException - if the specified function is null, or if a
         replacement value is null and this map does not permit null values
         (optional)
 * @throws IllegalArgumentException - if some property of a replacement value
         prevents it from being stored in this map
         (optional)
 * @throws ConcurrentModificationException - if an entry is found to be
         removed during iteration
 */
  replace(_function: JavaBiFunction<any>): void;
  /** 
   Replaces each entry's value with the result of invoking the given
   function on that entry until all entries have been processed or the
   function throws an exception.  Exceptions thrown by the function are
   relayed to the caller.
 * @param {JavaBiFunction<any>} _function  the function to apply to each entry
 * @throws UnsupportedOperationException - if the set operation
         is not supported by this map's entry set iterator.
 * @throws ClassCastException - if the class of a replacement value
         prevents it from being stored in this map
         (optional)
 * @throws NullPointerException - if the specified function is null, or if a
         replacement value is null and this map does not permit null values
         (optional)
 * @throws IllegalArgumentException - if some property of a replacement value
         prevents it from being stored in this map
         (optional)
 * @throws ConcurrentModificationException - if an entry is found to be
         removed during iteration
 */
  replaceAll(_function: JavaBiFunction<any>): void;
  /** 
   Returns the number of key-value mappings in this map.  If the
   map contains more than Integer.MAX_VALUE elements, returns
   Integer.MAX_VALUE.
 * @returns {number} the number of key-value mappings in this map
 */
  size(): number;
  /** 
   Returns a Collection view of the values contained in this map.
   The collection is backed by the map, so changes to the map are
   reflected in the collection, and vice-versa.  If the map is
   modified while an iteration over the collection is in progress
   (except through the iterator's own remove operation),
   the results of the iteration are undefined.  The collection
   supports element removal, which removes the corresponding
   mapping from the map, via the Iterator.remove,
   Collection.remove, removeAll,
   retainAll and clear operations.  It does not
   support the add or addAll operations.
 * @returns {JavaCollection<V>} a collection view of the values contained in this map
 */
  values(): JavaCollection<V>;
}
```
