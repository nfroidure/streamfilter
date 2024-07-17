# API
## Classes

<dl>
<dt><a href="#StreamFilter">StreamFilter</a></dt>
<dd><p>Filter piped in streams according to the given <code>filterCallback</code>.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#filterStream">filterStream(filterCallback, options)</a> ⇒</dt>
<dd><p>Utility function if you prefer a functional way of using this lib</p>
</dd>
</dl>

<a name="StreamFilter"></a>

## StreamFilter
Filter piped in streams according to the given `filterCallback`.

**Kind**: global class  
<a name="new_StreamFilter_new"></a>

### new StreamFilter(filterCallback, options)
Options are passed in as is in the various stream instances spawned by this
 module. So, to use the objectMode, simply pass in the `options.objectMode`
 value set to `true`.

**Returns**: [<code>StreamFilter</code>](#StreamFilter) - The filtering stream  

| Param | Type | Description |
| --- | --- | --- |
| filterCallback | <code>function</code> | Callback applying the filters |
| options | <code>Object</code> | Filtering options |
| options.passthrough | <code>boolean</code> | Set to `true`, this option changes the restore stream nature from a readable  stream to a passthrough one, allowing you to reuse the filtered chunks in an  existing pipeline. |
| options.restore | <code>boolean</code> | Set to `true`, this option create a readable stream allowing you to use the  filtered chunks elsewhere. The restore stream is exposed in the `FilterStream`  instance as a `restore` named property. |

<a name="filterStream"></a>

## filterStream(filterCallback, options) ⇒
Utility function if you prefer a functional way of using this lib

**Kind**: global function  
**Returns**: Stream  

| Param |
| --- |
| filterCallback | 
| options | 

