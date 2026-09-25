import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';

const contentTypes = {
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
};

async function findAssetFiles(directory, relativeDirectory = '') {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const relativePath = path.join(relativeDirectory, entry.name);
		const absolutePath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...await findAssetFiles(absolutePath, relativePath));
		} else if (entry.isFile() && relativePath.split(path.sep).includes('assets')) {
			files.push(relativePath);
		}
	}

	return files;
}

function storyAssets() {
	const storiesDirectory = path.resolve(process.cwd(), 'stories');

	return {
		name: 'story-assets',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								name: 'story-assets-build',
								apply: 'build',
								async buildStart() {
									for (const relativePath of await findAssetFiles(storiesDirectory)) {
										this.emitFile({
											type: 'asset',
											fileName: path.posix.join('stories', relativePath.split(path.sep).join('/')),
											source: await fs.readFile(path.join(storiesDirectory, relativePath)),
										});
									}
								},
							},
							{
								name: 'story-assets-dev-server',
								apply: 'serve',
								configureServer(server) {
									server.middlewares.use(async (request, response, next) => {
										if (!request.url) {
											next();
											return;
										}

										const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
										const baseUrl = server.config.base.replace(/\/$/, '');
										const publicPath = pathname.startsWith(`${baseUrl}/`)
											? pathname.slice(baseUrl.length + 1)
											: pathname.slice(1);

										if (!publicPath.startsWith('stories/') || !publicPath.split('/').includes('assets')) {
											next();
											return;
										}

										const relativePath = publicPath.slice('stories/'.length);
										const filePath = path.resolve(storiesDirectory, relativePath);

										if (!filePath.startsWith(`${storiesDirectory}${path.sep}`)) {
											next();
											return;
										}

										try {
											const stats = await fs.stat(filePath);

											if (!stats.isFile()) {
												next();
												return;
											}
										} catch {
											next();
											return;
										}

										const contentType = contentTypes[path.extname(filePath).toLowerCase()];
										if (contentType) {
											response.setHeader('Content-Type', contentType);
										}

										createReadStream(filePath).pipe(response);
									});
								},
							},
						],
					},
				});
			},
		},
	};
}

export default storyAssets;
