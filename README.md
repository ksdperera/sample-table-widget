# sample-table-widget
WSO2 Stream Processor Sample Table Widget

**Build Commands:**
```
cd sample-table-widget
npm install
npm run build
```

**Deploy widget:**

Once the the widget build successfully, deployable js bundle and the configuration copied into a directory inside 
the dist, we need to copy this generated artifact directory into: 

```
<wso2sp>/wso2/dashboard/deployment/web-ui-apps/portal/extensions/widgets/SampleTable
```

**Apply SP Dashboard Fixes:**

Copy and replace the following files: 

```
wso2sp-4.2.0-SNAPSHOT/wso2/dashboard/deployment/web-ui-apps/portal/public/js/bundle.js
wso2sp-4.2.0-SNAPSHOT/wso2/lib/plugins/org.wso2.carbon.data.provider-2.0.431.jar
```