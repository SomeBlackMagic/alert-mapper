# Input plugin AlertManager

This input plugin grab event from [Prometheus Alert Manager](https://prometheus.io/docs/alerting/latest/alertmanager/).

For enabled this plugin set variable 
```dotenv
APP_INPUT_ALERTMANAGER_ENABLED=true
```
and set AlertManager route config
```dotenv
receivers:
- name: alerta-bot
  webhook_configs:
  - send_resolved: true
    http_config:
      follow_redirects: true
    url: http://link-to-mapper:3000/input/alert-manager/webhook
    max_alerts: 0
```
Extra vars:
- APP_INPUT_ALERTMANAGER_ENV - for set environment name in alert(allow prod,stage,test,dev)
- APP_INPUT_ALERTMANAGER_RESOURCE - any string set global resource name

# TODO
- Add silent hook to Alertmanager
