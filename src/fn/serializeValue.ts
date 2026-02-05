export function serializeValue(v: any): string {

	if (v instanceof RegExp)
		return v.toString();

	if (typeof v === "string")
		return `'${v.replace(/\\/g, "/")}'`;

	if (Array.isArray(v))
		return `[${v.map(serializeValue).join(", ")}]`;

	if (typeof v === "object" && v !== null) {

		const body = Object.entries(v)
			.map(([k, val]) => `${k}: ${serializeValue(val)}`)
			.join(", ");

		return `{${body}}`;
	}

	return String(v);
}
