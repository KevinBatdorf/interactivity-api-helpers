export default {
	trailingComma: 'all',
	tabWidth: 2,
	useTabs: true,
	semi: true,
	singleQuote: true,
	bracketSameLine: true,
	plugins: ['@trivago/prettier-plugin-sort-imports'],
	importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
	overrides: [
		{
			files: ['**/*.css', '**/*.html'],
			options: {
				singleQuote: false,
			},
		},
		{
			files: ['*.md'],
			options: {
				useTabs: false,
				tabWidth: 4,
			},
		},
	],
};
