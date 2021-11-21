export interface AlertaAlertsInterface {
    receiver: string
    status: string
    externalURL: string
    version: string
    groupKey: string
    truncatedAlerts: number
    alerts: AlertInterface[]
    groupLabels: {
        job: string
    }
    commonLabels: {
        [name: string]: string
    }
    commonAnnotations: {
        [name: string]: string
    }

}

export interface AlertInterface {
    status: "firing" | "resolved"
    startsAt: Date
    endsAt: Date
    generatorURL: string
    fingerprint: string
    labels: {
        [name: string]: string
    }
    annotations: {
        description: string
        runbook_url: string
        summary: string
    }
}
