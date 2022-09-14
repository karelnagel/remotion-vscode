import { getCompositions } from "@remotion/renderer";
import { bundle } from "./bundle";

export async function getComps(entryPoint: string) {
	const bun = await bundle(entryPoint);
	return await getCompositions(bun);
}