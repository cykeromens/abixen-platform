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

package com.abixen.platform.service.businessintelligence.multivisualization.model.web;

import com.abixen.platform.core.util.WebModelJsonSerialize;
import com.abixen.platform.service.businessintelligence.multivisualization.model.impl.datasource.file.FileDataSource;
import com.abixen.platform.service.businessintelligence.multivisualization.model.impl.datasource.file.FileDataSourceRow;
import com.abixen.platform.service.businessintelligence.multivisualization.model.impl.file.DataFile;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.util.Set;


@JsonDeserialize(as = FileDataSource.class)
public interface FileDataSourceWeb extends DataSourceWeb {

    @JsonView(WebModelJsonSerialize.class)
    Set<FileDataSourceRow> getRows();

    @JsonView(WebModelJsonSerialize.class)
    DataFile getDataFile();
}
