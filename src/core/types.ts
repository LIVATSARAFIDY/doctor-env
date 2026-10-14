export interface CompareResult {
    missing: string[];
    extra: string[];
    different: string[];
    matching: string[];
}

export interface ScanUnusedVarsResult {
    command: "scan-unused-vars";
    envFile: string;
    filesScanned: number;
    filesFailed: string[];
    used: string[];
    unused: string[];
    fix: ScanUnusedVarsFixResult;
}

export interface ScanUnusedVarsFixResult {
    requested: boolean;
    applied: boolean;
    dryRun: boolean;
}

export interface EnvVariable {
    key: string;
    value: string;
    line: number;
    quoted: boolean;
}