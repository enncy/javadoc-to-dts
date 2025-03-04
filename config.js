// @ts-check




exports.config = {
    ignores_methods: [],
    types_mapping: [
        'int-number',
        'String-string',
        'double-number',
        'float-number',
        'long-number',
        'short-number',
        'byte-number',
        'char-string',
        'Object-JavaObject',
        'List-JavaList',
        'ArrayList-JavaArrayList',
        'LinkedList-JavaLinkedList',
        'Map-JavaMap',
        'Set-JavaSet',
        'Collection-JavaCollection',
        'Date-JavaDate',
        'UUID-JavaUUID',
        'Pattern-JavaPattern',
        'File-JavaFile',
        'Path-JavaPath',
        'URL-JavaURL',
        'URI-JavaURI',
        'Locale-JavaLocale',
        'Class-JavaClass',
        'Thread-JavaThread',
        'Runnable-JavaRunnable',
        'Enum-JavaEnum',
        'Iterable-JavaIterable',
        'Iterator-JavaIterator',
        'Stream-JavaStream',
        'Function-JavaFunction',
        'BiFunction-JavaBiFunction',
        'Consumer-JavaConsumer',
        'BiConsumer-JavaBiConsumer',
        'Supplier-JavaSupplier',
        'Predicate-JavaPredicate',
        'BiPredicate-JavaBiPredicate',
        'Optional-JavaOptional',
    ],
    not_allowed_param_replaces: ['with-_with', 'in-_in', 'function-_function'],
}