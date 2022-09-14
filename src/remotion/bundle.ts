import { bundle as remBundle } from "@remotion/bundler";

export async function bundle(entryPoint: string) {
	return new Promise<string>((resolve, reject) => {
		try {
			const path = remBundle(entryPoint, (progress) => {
				if (progress === 100) resolve(path);
			}, {});
		} catch (e) {
			reject(e);
		}
	});
}