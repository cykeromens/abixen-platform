/**
 * Copyright (c) 2010-present Abixen Systems. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

(function () {

    'use strict';

    angular
        .module('platformDatabaseDataSourceModule')
        .controller('DatabaseDataSourceDetailsController', DatabaseDataSourceDetailsController);

    DatabaseDataSourceDetailsController.$inject = [
        '$scope',
        'DatabaseDataSource',
        '$state',
        '$stateParams',
        '$log',
        'DatabaseConnection',
        'DatabaseDataSourcePreviewData',
        'responseHandler'
    ];

    function DatabaseDataSourceDetailsController($scope, DatabaseDataSource, $state, $stateParams, $log, DatabaseConnection, DatabaseDataSourcePreviewData, responseHandler) {
        $log.log('DatabaseDataSourceDetailsController');
        var databaseDataSourceDetails = this;

        new AbstractDetailsController(databaseDataSourceDetails, DatabaseDataSource, responseHandler, $scope,
            {
                entityId: $stateParams.id,
                getValidators: getValidators,
                onSuccessSaveForm: onSuccessSaveForm,
                onSuccessGetEntity: onSuccessGetEntity
            }
        );

        var data = '{"group": {"operator": "AND","rules": []}}';
        databaseDataSourceDetails.databaseConnections = [];
        databaseDataSourceDetails.databaseTables = [];
        databaseDataSourceDetails.databaseTableColumns = [];
        databaseDataSourceDetails.fields = [];
        databaseDataSourceDetails.getDatabaseTables = getDatabaseTables;
        databaseDataSourceDetails.getDatabaseTableColumns = getDatabaseTableColumns;
        databaseDataSourceDetails.beforeSaveForm = beforeSaveForm;
        databaseDataSourceDetails.goToViewMode = goToViewMode;
        databaseDataSourceDetails.getPreviewData = getPreviewData;

        databaseDataSourceDetails.json = null;
        databaseDataSourceDetails.filter = JSON.parse(data);
        databaseDataSourceDetails.query = {
            and: [
                {
                    name: 'title',
                    operation: '=',
                    value: 'Page View'
                }
            ]
        };

        databaseDataSourceDetails.filterCriteria = {
            page: 0,
            size: 20,
            sort: 'id,asc',
            gridFilterParameters: []
        };

        $scope.$watch('databaseDataSourceDetails.filter', function (newValue) {
            if (databaseDataSourceDetails.entity) {
                databaseDataSourceDetails.json = JSON.stringify(newValue, null, 2);
                databaseDataSourceDetails.entity.filter = databaseDataSourceDetails.json;
            }
        }, true);


        DatabaseConnection.query({}, function (data) {
            databaseDataSourceDetails.databaseConnections = data.content;
            $log.log('databaseDataSourceDetails.databaseConnections: ', databaseDataSourceDetails.databaseConnections);
        });

        function getDatabaseTables(databaseConnection) {
            DatabaseConnection.tables({id: databaseConnection.id}, function (data) {
                databaseDataSourceDetails.databaseTables = data;
                $log.log('databaseDataSourceDetails.databaseTables: ', databaseDataSourceDetails.databaseTables);
            });
        }

        function onSuccessSaveForm() {
            $state.go('application.multiVisualization.modules.databaseDataSource.list');
        }

        function getDatabaseTableColumns(databaseConnection, tableName) {
            DatabaseConnection.tableColumns({id: databaseConnection.id, tableName: tableName}, function (data) {
                $log.log('databaseTableColumns data: ', data);
                $log.log('databaseDataSourceDetails.entity.columns: ', databaseDataSourceDetails.entity.columns);

                var tmpColumns = [];

                for (var i = 0; i < data.length; i++) {
                    $log.log('iteracja: ' + databaseDataSourceDetails.entity.columns);
                    var selected = false;

                    if (databaseDataSourceDetails.entity.columns != null) {
                        for (var j = 0; j < databaseDataSourceDetails.entity.columns.length; j++) {
                            if (databaseDataSourceDetails.entity.columns[j].name.toUpperCase() == data[i].toUpperCase()) {
                                selected = true;
                            }
                        }
                    }

                    tmpColumns.push({name: data[i], selected: selected});
                }

                databaseDataSourceDetails.fields = tmpColumns;
                databaseDataSourceDetails.databaseTableColumns = tmpColumns;

            });
        }

        function htmlEntities(str) {
            return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

         function onSuccessGetEntity() {
             $log.log('afterGetDatabaseDataSource', databaseDataSourceDetails.entity);
             databaseDataSourceDetails.json = JSON.stringify(databaseDataSourceDetails.entity.filter, null, 2);
             databaseDataSourceDetails.filter = JSON.parse(databaseDataSourceDetails.entity.filter);

             databaseDataSourceDetails.getDatabaseTables(databaseDataSourceDetails.entity.databaseConnection);
             databaseDataSourceDetails.getDatabaseTableColumns(databaseDataSourceDetails.entity.databaseConnection, databaseDataSourceDetails.entity.table);

        }

        function goToViewMode() {
            $state.go('application.multiVisualization.modules.databaseDataSource.list');
        }

        function beforeSaveForm() {
            $log.log('beforeSaveForm', databaseDataSourceDetails.entity);

            databaseDataSourceDetails.entity.columns = [];

            var columnPosition = 1;

            for (var i = 0; i < databaseDataSourceDetails.databaseTableColumns.length; i++) {
                if (databaseDataSourceDetails.databaseTableColumns[i].selected) {
                    databaseDataSourceDetails.entity.columns.push({
                        name: databaseDataSourceDetails.databaseTableColumns[i].name,
                        position: columnPosition++
                    });
                }
            }
            databaseDataSourceDetails.saveForm();
        }

        function getPreviewData() {
            databaseDataSourceDetails.entity.columns = [];

            var columnPosition = 1;

            for (var i = 0; i < databaseDataSourceDetails.databaseTableColumns.length; i++) {
                if (databaseDataSourceDetails.databaseTableColumns[i].selected) {
                    databaseDataSourceDetails.entity.columns.push({
                        name: databaseDataSourceDetails.databaseTableColumns[i].name,
                        position: columnPosition++
                    });
                }
            }

            DatabaseDataSourcePreviewData.query({}, databaseDataSourceDetails.entity)
                .$promise
                .then(onQueryResult, onQueryError);
        }

        function onQueryResult(data) {
            $log.log('DatabaseDataSourcePreviewData.query: ', data);
            $scope.$broadcast('DatabaseDataSourceDataUpdated', data);
        }

        function onQueryError(error) {
            responseHandler.handle(error, $scope);
        }

        function getValidators() {
            var validators = [];

            validators['name'] =
                [
                    new NotNull(),
                    new Length(0, 60)
                ];

            validators['description'] =
                [
                    new Length(0, 1000)
                ];
            return validators;
        }

    }
})();