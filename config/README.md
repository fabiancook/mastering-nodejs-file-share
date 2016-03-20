# Configuration

Please create four configuration (`.json`) files, `default`, `development`, `quality` & `production`

The structure for these files are:

```json
{
  "httpServer": {
    "port": 8080,
    "sessionSecret": "",
    "logging": {
      "enabled": true,
      "format": "common"
    }
  },
  "httpAuth0": {
    "secret": {
      "contents": "",
      "encoding": "base64"
    },
    "audience": ""
  },
  "logging": {
    "stdout_enabled": true,
    "stdout_level": "info"
  },
  "aws": {
    "s3": {
      "params": {
        "Bucket": ""
      },
      "accessKeyId": "",
      "secretAccessKey": "",
      "region": ""
    }
  }
}
```
