import { defineConfig } from 'vitepress'
import fontkitTypedocSidebar from '../fontkit/api/typedoc-sidebar.json';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "@pdf-lab",
	base: "/pdf-lab/",
	description: "High-quality PDF tools for Node and the Browser",
	// FIXME! This seems to be a bug in the TypeDoc Markdown plug-in.
	ignoreDeadLinks: true,
	markdown: {
		config(md) {
			md.use(tabsMarkdownPlugin)
		},
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
		],

		sidebar: [
			{
				text: '@pdf-lab/fontkit',
				link: '/fontkit',
				items: [
					{
						text: 'Introduction',
						items: [
							{
								text: 'What is fontkit?',
								link: './what-is-fontkit'
							},
							{
								text: 'Installation',
								link: './installation',
							},
							{
								text: 'Basic Usage',
								link: './basic-usage',
							},
							{
								text: 'Security',
								link: './security',
							},
						],
					},
					{
						text: 'Usage/Examples',
						items: [
							{
								text: 'Font Collections',
								link: '/fontkit/font-collections',
								items: [
									{
										text: 'Listing Fonts',
										link: '/fontkit/font-collections/listing-fonts'
									},
								],
							},
							{
								text: 'Differences to Other Fontkit Versions',
								link: '/fontkit/differences-to-other-fontkit-versions',
							},
							{
								text: 'Legacy API',
								link: '/fontkit/legacy-api',
							},
						],
					},
					{
						text: 'API',
						items: fontkitTypedocSidebar,
					},
				]
			}
		],

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/gflohr/pdf-lab' }
		]
	}
});
