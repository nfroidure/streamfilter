# API
<a name="StreamFilter"></a>

## StreamFilter(filterCallback, options) ⇒ <code>Stream</code>
Filter piped in streams according to the given `filterCallback` that takes the
 following arguments: `chunk` the actual chunk, `encoding` the chunk encoding,
 filterResultCallback` the function to call as the result of the filtering
process with `true` in argument to filter her or `false` otherwise.

Options are passed in as is in the various stream instances spawned by this
 module. So, to use the objectMode, simply pass in the `options.objectMode`
 value set to `true`.

**Kind**: global function  
**Returns**: <code>Stream</code> - The filtering stream  

| Param | Type | Description |
| --- | --- | --- |
| filterCallback | <code>function</code> | Callback applying the filters |
| options | <code>Object</code> | Filtering options |
| options.passthrough | <code>boolean</code> | Set to `true`, this option change the restore stream nature from a readable  stream to a passthrough one, allowing you to reuse the filtered chunks in an  existing pipeline. |
| options.restore | <code>boolean</code> | Set to `true`, this option create a readable stream allowing you to use the  filtered chunks elsewhere. The restore stream is exposed in the `FilterStream`  instance as a `restore` named property. |

