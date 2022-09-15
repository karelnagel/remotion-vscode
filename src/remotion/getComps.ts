import { getCompositions } from "@remotion/renderer";
import { bundle } from "./bundle";

export async function getComps(entryPoint: string) {
	const bun = await bundle(entryPoint);
	if (!bun) throw ("Invalid index file");

	return await getCompositions(bun);
}