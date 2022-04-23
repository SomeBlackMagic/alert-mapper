export interface AlertmanagerAlertsDataInterface {
    receiver: string;
    status: string;
    externalURL: string;
    version: string;
    groupKey: string;
    truncatedAlerts: number;
    alerts: AlertmanagerAlertInterface[];
    groupLabels: {
        job: string
    };
    commonLabels: {
        [name: string]: string
    };
    commonAnnotations: {
        [name: string]: string
    };

}

export interface AlertmanagerAlertInterface {
    status: 'firing' | 'resolved';
    startsAt: Date;
    endsAt: Date;
    generatorURL: string;
    fingerprint: string;
    labels: {
        [name: string]: string
    };
    annotations: {
        description: string
        runbook_url: string
        summary: string
    };
}


