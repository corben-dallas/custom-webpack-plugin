const path = require('path');
const fs = require('fs');

class MyPlugin {
	static defaultOptions = {
		exclude: [
			'webpack.config.js',
			'package.json',
			'package-lock.json',
			'custom-plugin',
			'.babelrc',
			'.gitignore',
			'.git',
		],
		entry: './',
	};
	
	constructor(options = { exclude: [] }) {
		this.options = { 
			...MyPlugin.defaultOptions, 
			...options,
			exclude: [ ...MyPlugin.defaultOptions.exclude, ...options.exclude ],
			_dir: '',
		};
		this.usedFilesPath = [];
		this.allFilesPath = [];
	};

	apply(compiler) {
		const { webpack } = compiler;
		const { Compilation } = webpack;
		const { RawSource } = webpack.sources;

		compiler.hooks.normalModuleFactory.tap(
			'MyPlugin',
			(moduleFactory) => {
				moduleFactory.hooks.module.tap(
					'MyPlugin', 
					(_, createData) => {
						this.usedFilesPath = [...this.usedFilesPath, createData.resource ];
					});
			});

		compiler.hooks.beforeCompile.tap('MyPlugin', () => {
			this.allFilesPath = [ 
				...this.allFilesPath, 
				...this._getFiles(path.resolve(this.options._dir, this.options.entry))
			];
		});

		compiler.hooks.thisCompilation.tap('MyPlugin', (compilation) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'MyPlugin',
					stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
				},
				() => {
					const unusedFiles = this._compareResult(this.allFilesPath, this.usedFilesPath)
						.reduce((acc, item, index) => {
							return { ...acc, [index]: item };
						}, {});
					compilation.emitAsset('unused.json', new RawSource(JSON.stringify(unusedFiles)));
				}
			);
		});

		// compiler.hooks.done.tap('MyPlugin', () => {
		// 	const unusedFiles = this._compareResult(this.allFilesPath, this.usedFilesPath)
		// 		.reduce((acc, item, index) => {
		// 			return { ...acc, [index]: item };
		// 		}, {});

		// 	fs.writeFile('unused.json', JSON.stringify(unusedFiles), (err) => {
		// 		if (err) throw err;
		// 	});
		// });
	};

	_getFiles = (dir, files_) => {
		files_ = files_ || [];

		const files = fs.readdirSync(dir);
		for (let i in files){
			if (this.options.exclude.some(item => item === files[i])) continue;

			const name = dir + '\\' + files[i];

			if (fs.statSync(name).isDirectory()){
				this._getFiles(name, files_);
			} else {
				files_.push(name);
			}
		}

		return files_;
	};

	_compareResult = (allFilesPath, usedFilesPath) => {
		const result = allFilesPath.filter(filePath => {
			return !usedFilesPath.some(item => item === filePath);
		})

		return result;
	}
};

module.exports = MyPlugin;