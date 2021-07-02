# custom-webpack-plugin
---
__Использование:__
```javascript
const MyPlugin = require('./custom-plugin/MyPlugin');

module.exports = {
    ... ,
	plugins: [
		new MyPlugin(),
	],
```
MyPlugin({ ...options });
- `options`:
    - `entry`: `'string'` - назавние папки откуда начать считывание файлов (по умолчанию корень проекта)
    - `exclude`: `['string', 'string', ...]` - названия папок или файлов, которые не следует учитывать, например 'node_modules', 'readme.md'
