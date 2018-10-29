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