export interface GlobalAlertInterface {
    externalEventId: string
    summary: string
    description: string
    event: string
    environment: GlobalAlertEnvironment
    severity: GlobalSeverityLevels
    status: GlobalStatus
    labels?: {
        [key: string]: string;
    }
    tags?: string[]
    startedAt?: Date
    raw?: object
}


export enum GlobalAlertEnvironment {
    production = 'prod',
    staging = 'stage',
    testing = 'test',
    development = 'dev'
}

export enum GlobalSeverityLevels {
    security = "security",
    critical = "critical",
    major = "major",
    minor = "minor",
    warning = "warning",
    informational = "informational",
    debug = "debug",
    trace = "trace",
    indeterminate = "indeterminate",
    cleared = "cleared",
    normal = "normal",
    ok = "ok",
    unknown = "unknown"
}

export enum GlobalStatus {
    open = 'open',
    assign = 'assign',
    ack = 'ack',
    closed = 'closed'
}
