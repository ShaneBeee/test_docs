export interface SkElement {
    id: string;
    name: string;
    description: string[];
    since: string[];
    patterns: string[];
    examples?: string[];
    usage?: string;
    "event values"?: string[];
    entries?: {
        name: string;
        isRequired: boolean;
        isSection: boolean;
    }[];
    cancellable?: boolean;
}

export interface SkDocs {
    metadata: {
        version: string;
    };
    types: SkElement[];
    structures: SkElement[];
    events: SkElement[];
    sections: SkElement[];
    effects: SkElement[];
    expressions: SkElement[];
    conditions: SkElement[];
    functions: SkElement[];
}

export type SkCategory = keyof Omit<SkDocs, "metadata">;
