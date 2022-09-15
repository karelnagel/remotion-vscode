import { bundle as remBundle } from "@remotion/bundler";

export async function bundle(entryPoint: string) {
	return new Promise<string | null>((resolve) => {
		try {
			const path = remBundle(entryPoint, (progress) => {
				if (progress === 100) resolve(path);
			}, { enableCaching: true });
		} catch (e) {
			resolve(null);
		}
	});
}