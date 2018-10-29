/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import Widget from '@wso2-dashboards/widget';
import moment from 'moment';
import Axios from 'axios';
import Paper from '@material-ui/core/Paper';

/**
 * Material UI Table
 */
class EnhancedTableHead extends React.Component {
    constructor(props){
        super(props);
        this.createSortHandler = this.createSortHandler.bind(this);
    }
    createSortHandler(property, event) {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {onSelectAllClick, order, orderBy, numSelected, rowCount} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={numSelected === rowCount}
                            onChange={onSelectAllClick}
                        />
                    </TableCell>
                    {rows.map(row => {
                        return (
                            <TableCell
                                key={row.instanceId}
                                numeric={row.numeric}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.instanceId ? order : false}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === row.instanceId}
                                        direction={order}
                                        onClick={this.createSortHandler}
                                    >
                                        {row.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit,
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
});

let EnhancedTableToolbar = props => {
    const {numSelected, onDeleteClick, classes} = props;

    return (
        <Toolbar
            className={classNames(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            <div className={classes.title}>
                {numSelected > 0 ? (
                    <Typography color="inherit" variant="subtitle1">
                        {numSelected} selected
                    </Typography>
                ) : (
                    <Typography variant="h6" id="tableTitle">
                        Viesgo Adaptor Details
                    </Typography>
                )}
            </div>
            <div className={classes.spacer}/>
            <div className={classes.actions}>
                {numSelected > 0 ? (
                    <Tooltip title="Delete">
                        <IconButton aria-label="Delete" onClick={onDeleteClick}>
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Filter list">
                        <IconButton aria-label="Filter list">
                            <FilterListIcon/>
                        </IconButton>
                    </Tooltip>
                )}
            </div>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

function createData(array) {
    return {trackingId:array[0] , instanceId:array[1] ,
        operationName:array[2] , functionalId:array[3] , serviceName:array[4] , timestamp:array[5] , message:array[6]};
}

const rows = [
    {id: 'trackingId', numeric: false, disablePadding: true, label: 'Tracking Id'},
    {id: 'instanceId', numeric: false, disablePadding: true, label: 'Instance Id'},
    {id: 'operationName', numeric: false, disablePadding: true, label: 'Operation Name'},
    {id: 'functionalId', numeric: false, disablePadding: true, label: 'Functional Id'},
    {id: 'serviceName', numeric: false, disablePadding: true, label: 'Service Name'},
    {id: 'timestamp', numeric: false, disablePadding: true, label: 'Timestamp'},
];

/**
 * Viesgo Widget
 */
class SampleTable extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            order: 'asc',
            orderBy: 'instanceId',
            selected: [],
            data: [],
            page: 0,
            rowsPerPage: 5,
            recordsCount: 0,
            timeFromParameter:'24579603000',
            timeToParameter:'3180339603000',
            metadata: {}
        };
        this.handleRequestSort = this.handleRequestSort.bind(this);
        this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
        this.isSelected = this.isSelected.bind(this);
        this.assembleQuery = this.assembleQuery.bind(this);
        this.handlePublisherParameters = this.handlePublisherParameters.bind(this);
        this.requestData = this.requestData.bind(this);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.invokeESBAPI = this.invokeESBAPI.bind(this);
        this.getHttpClient = this.getHttpClient.bind(this);
        this.props.glContainer.on('resize', () => this.setState({
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        }));
    }

    /**
     * Initialize widget.
     */
    componentDidMount() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                this.assembleQuery(message.data.configs.providerConfig);
                this.setState({
                    metadata: message.data.configs.metadata,
                    dataProviderConf: message.data.configs.providerConfig
                });
            })
            .catch(() => {
                this.setState({
                    faultyProviderConf: true,
                });
            });
        super.subscribe(this.handlePublisherParameters);
    }

    handlePublisherParameters(receivedMessage) {
        let message = (typeof receivedMessage === "string") ? JSON.parse(receivedMessage) : receivedMessage;
        console.log(message);
        this.state.timeFromParameter = message.from;
        this.state.timeToParameter =  message.to;
        this.requestData();
    }

    /**
     * Set the state of the widget after metadata and data is received from SiddhiAppProvider
     * @param {JSON} message Message received from data Provider
     */
    handleDataReceived(message) {
        console.log(message);
        let array = [];
        message.data.map(n => {
            array.push(createData(n));
        });
        this.setState({
            data: array,
            recordsCount: Math.ceil(message.lastRow)
        });
    }

    /**
     * Query is initialised after the user input is received
     */
    assembleQuery(congfig) {
        //super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
        const dataProviderConfigs = _.cloneDeep(congfig);
        let { query, recordCountQuery} = dataProviderConfigs.configs.config.queryData;
        query = query
            .replace('{{limit}}', this.state.rowsPerPage)
            .replace('{{offSet}}', 0)
            .replace('{{timeFromParameter}}', this.state.timeFromParameter);
        recordCountQuery = recordCountQuery.replace('{{timeFromParameter}}', this.state.timeFromParameter);
        console.log(query);
        console.log(recordCountQuery);
        dataProviderConfigs.configs.config.queryData.query = query;
        dataProviderConfigs.configs.config.queryData.recordCountQuery = recordCountQuery;
        super.getWidgetChannelManager()
            .subscribeWidget(this.props.id, this.handleDataReceived, dataProviderConfigs);
    }

    requestData(pageSize, page){
        console.log("PageSize: " + pageSize + "Current Page: " + page);
        console.log("Offset: " + page*pageSize + "limit: " + pageSize);
        // This is a mock service to emulate an endpoint you can use any kind of endpoint to fetch data.
        if(this.state.dataProviderConf){
            const dataProviderConfigs = _.cloneDeep(this.state.dataProviderConf);
            let { query, recordCountQuery} = dataProviderConfigs.configs.config.queryData;
            query = query
                .replace('{{limit}}', this.state.rowsPerPage)
                .replace('{{offSet}}', this.state.page*this.state.rowsPerPage)
                .replace('{{timeFromParameter}}', this.state.timeFromParameter);
            recordCountQuery = recordCountQuery.replace('{{timeFromParameter}}', this.state.timeFromParameter);
            console.log(query);
            console.log(recordCountQuery);
            dataProviderConfigs.configs.config.queryData.query = query;
            dataProviderConfigs.configs.config.queryData.recordCountQuery = recordCountQuery;
            super.getWidgetChannelManager()
                .requestPublishWithPagination(this.props.id, this.handleDataReceived, dataProviderConfigs);
        }
    }

    handleRequestSort(event, property) {
        console.log("handleRequestSort")
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    handleSelectAllClick(event) {
        console.log("handleSelectAllClick")
        if (event.target.checked) {
            this.setState(state => ({selected: state.data.map(n => n.instanceId)}));
            return;
        }
        this.setState({selected: []});
    };

    handleClick(event, id) {
        const {selected} = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        this.setState({selected: newSelected});
        console.log(selected);
    };

    handleChangePage(event, page) {
        console.log("handleChangePage - Pagination - Page No   "+page);
        this.state.page = page;
        this.requestData(this.state.rowsPerPage, page);
    };

    handleChangeRowsPerPage(event) {
        this.setState({rowsPerPage: event.target.value});
    };

    handleDeleteClick(){
        console.log("handleDeleteClick");
        this.invokeESBAPI();
    }

    invokeESBAPI() {
        this.state.selected.map(n => {
            let body = {
                "InstanceId" : n
            };
            this.getHttpClient().post(this.state.metadata.esbContext, body, {
                headers: this.state.metadata.headers ,
            });
        });

    }

    getHttpClient() {
        const client = Axios.create({
            baseURL: this.state.metadata.esbUrl,
            timeout: 2000,
        });
        client.defaults.headers.post['Content-Type'] = 'application/json';
        return client;
    }

    isSelected(id) {
        return this.state.selected.indexOf(id) !== -1;
    };

    render() {
        const {data, order, orderBy, selected, rowsPerPage, page, recordsCount} = this.state;
        const {classes} = this.props;

        if(recordsCount <= 0){
            return (<dev>
                    <Paper>
                        <Typography variant="h5" component="h3">
                            No Records Found !
                        </Typography>
                        <Typography component="p">
                            Please select the valid time range.
                        </Typography>
                    </Paper>
            </dev>
            );
        } else {
            return (
                <div>
                    <EnhancedTableToolbar
                        numSelected={selected.length}
                        onDeleteClick={this.handleDeleteClick}
                    />
                    <div>
                        <Table aria-labelledby="tableTitle">
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={this.handleSelectAllClick}
                                onRequestSort={this.handleRequestSort}
                                rowCount={data.length}
                            />
                            <TableBody>
                                {data.map(n => {
                                    const isSelected = this.isSelected(n.instanceId);
                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => this.handleClick(event, n.instanceId)}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={n.instanceId}
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected}/>
                                            </TableCell>
                                            <TableCell component="th" scope="row" padding="none">
                                                {n.trackingId}
                                            </TableCell>
                                            <TableCell component="th" scope="row"
                                                       padding="none">{n.instanceId}</TableCell>
                                            <TableCell component="th" scope="row"
                                                       padding="none">{n.operationName}</TableCell>
                                            <TableCell component="th" scope="row"
                                                       padding="none">{n.functionalId}</TableCell>
                                            <TableCell component="th" scope="row"
                                                       padding="none">{n.serviceName}</TableCell>
                                            <TableCell component="th" scope="row"
                                                       padding="none">{moment(n.timestamp).format('YYYY/MM/DD')}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <TablePagination
                        component="div"
                        count={recordsCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                </div>
            );
        }
    }
}

global.dashboard.registerWidget('SampleTable', SampleTable); //(widgetId,reactComponent)
