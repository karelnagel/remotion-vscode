export type States = "indexPath" | "compositions" | "presets";
export const idk = "asdfsadfsd";
export type PostType = States | "readPropFile" | "writePropFile"
export interface Preset {
	name: string;
	props: string;
}
export const propsFileName = "props.json";
