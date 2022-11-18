* Decorator
```js
function decorator(func) {
  return async (...args) => {
    // before
    const result = await func(...args); 
    // after
    return result;
  }
}
```

* Flow

```js
function flow(...args) {
  // do something
  return result;
}
```
